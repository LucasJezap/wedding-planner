"use client";

import { useState } from "react";

const loadXLSX = () => import("xlsx");
const loadJSZip = () => import("jszip").then((mod) => mod.default);

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mapPreviewRows } from "@/features/import/hooks/use-import-preview";
import {
  hasValidImportHeaders,
  IMPORT_FIELD_ALIASES,
  IMPORT_TEMPLATE_HEADERS,
  isBlankImportRow,
} from "@/features/import/types/import";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import type { GuestView } from "@/lib/planner-domain";

type PreviewRow = Record<string, string>;

const TEMPLATE_ROW_COUNT = 200;
const VALIDATION_SHEET_NAME = "_Walidacje";

const templateColumnWidths = [
  { wch: 16 },
  { wch: 18 },
  { wch: 18 },
  { wch: 28 },
  { wch: 18 },
  { wch: 14 },
  { wch: 34 },
  { wch: 16 },
  { wch: 18 },
  { wch: 12 },
  { wch: 16 },
  { wch: 18 },
];

const templateLegendRows = [
  ["Kolumna", "Dozwolone wartości"],
  ["Strona", "Panna Młoda, Pan Młody, Rodzina, Przyjaciele"],
  ["Dieta", "Brak, Wege, Wegan"],
  ["RSVP", "Oczekuje, Potwierdzono, Odmowa"],
  ["Płatność", "100%, 50%"],
  ["Pola typu checkbox", "☑ = Tak, ☐ = Nie"],
];

const validationSheetRows = [
  ["Strona", "Dieta", "RSVP", "Płatność", "Checkbox"],
  ["Panna Młoda", "Brak", "Oczekuje", "100%", "☐"],
  ["Pan Młody", "Wege", "Potwierdzono", "50%", "☑"],
  ["Rodzina", "Wegan", "Odmowa", "", ""],
  ["Przyjaciele", "", "", "", ""],
];

const mappingEntries = Object.entries(IMPORT_FIELD_ALIASES) as Array<
  [keyof typeof IMPORT_FIELD_ALIASES, readonly string[]]
>;

const buildPreviewRows = (
  headers: string[],
  dataRows: string[][],
): PreviewRow[] =>
  dataRows
    .map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, values[index] ?? ""]),
      ),
    )
    .filter((row) => !isBlankImportRow(row));

const buildDefaultMapping = (headers: string[]) =>
  Object.fromEntries(
    mappingEntries.map(([key, aliases]) => [
      key,
      aliases.find((alias) => headers.includes(alias)) ?? aliases[0],
    ]),
  ) as Record<string, string>;

const downloadBlob = (content: BlobPart, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const buildDelimitedTemplate = (separator: "," | "\t") => {
  const rows = Array.from({ length: TEMPLATE_ROW_COUNT }, () =>
    IMPORT_TEMPLATE_HEADERS.map(() => ""),
  );
  return [
    IMPORT_TEMPLATE_HEADERS.join(separator),
    ...rows.map((row) => row.join(separator)),
  ].join("\n");
};

const buildWorkbook = async () => {
  const XLSX = await loadXLSX();
  const workbook = XLSX.utils.book_new();
  const guestRows = [
    [...IMPORT_TEMPLATE_HEADERS],
    ...Array.from({ length: TEMPLATE_ROW_COUNT }, () =>
      IMPORT_TEMPLATE_HEADERS.map(() => ""),
    ),
  ];
  const guestSheet = XLSX.utils.aoa_to_sheet(guestRows);
  guestSheet["!cols"] = templateColumnWidths;

  const legendSheet = XLSX.utils.aoa_to_sheet(templateLegendRows);
  legendSheet["!cols"] = [{ wch: 24 }, { wch: 48 }];

  const validationSheet = XLSX.utils.aoa_to_sheet(validationSheetRows);
  validationSheet["!cols"] = Array.from({ length: 5 }, () => ({ wch: 18 }));

  XLSX.utils.book_append_sheet(workbook, guestSheet, "Goście");
  XLSX.utils.book_append_sheet(workbook, legendSheet, "Legenda");
  XLSX.utils.book_append_sheet(
    workbook,
    validationSheet,
    VALIDATION_SHEET_NAME,
  );

  return workbook;
};

const buildValidationXml = () => {
  const listFormula = (column: string, endRow: number) =>
    `'${VALIDATION_SHEET_NAME}'!$${column}$2:$${column}$${endRow}`;

  const validations = [
    { sqref: "C2:C201", formula: listFormula("A", 5) },
    { sqref: "F2:F201", formula: listFormula("B", 4) },
    { sqref: "H2:H201", formula: listFormula("C", 4) },
    { sqref: "J2:J201", formula: listFormula("D", 3) },
    { sqref: "I2:I201 K2:K201 L2:L201", formula: listFormula("E", 3) },
  ];

  return `<dataValidations count="${validations.length}">${validations
    .map(
      ({ sqref, formula }) =>
        `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="${sqref}"><formula1>${formula}</formula1></dataValidation>`,
    )
    .join("")}</dataValidations>`;
};

const patchWorkbookXml = (xml: string) =>
  xml.replace(
    `name="${VALIDATION_SHEET_NAME}" sheetId="3"`,
    `name="${VALIDATION_SHEET_NAME}" sheetId="3" state="hidden"`,
  );

const patchGuestSheetXml = (xml: string) =>
  xml.includes("<dataValidations")
    ? xml
    : xml.replace("</worksheet>", `${buildValidationXml()}</worksheet>`);

const buildWorkbookBuffer = async (bookType: "xlsx" | "xls") => {
  const XLSX = await loadXLSX();
  const workbook = await buildWorkbook();
  const rawBuffer = XLSX.write(workbook, { bookType, type: "array" });

  if (bookType !== "xlsx") {
    return rawBuffer;
  }

  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(rawBuffer);
  const workbookXmlPath = "xl/workbook.xml";
  const guestSheetPath = "xl/worksheets/sheet1.xml";
  const workbookXml = await zip.file(workbookXmlPath)?.async("string");
  const guestSheetXml = await zip.file(guestSheetPath)?.async("string");

  if (!workbookXml || !guestSheetXml) {
    return rawBuffer;
  }

  zip.file(workbookXmlPath, patchWorkbookXml(workbookXml));
  zip.file(guestSheetPath, patchGuestSheetXml(guestSheetXml));

  return zip.generateAsync({ type: "arraybuffer" });
};

export const ImportWizard = ({
  onImported,
}: {
  onImported?: (guests: GuestView[]) => void;
}) => {
  const { messages } = useLocale();
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [workbookRows, setWorkbookRows] = useState<
    Record<string, PreviewRow[]>
  >({});
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const headers = Object.keys(rows[0] ?? {});

  const handleFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    const parseDelimitedRows = async (separator: "," | "\t") => {
      const lines = (await file.text()).split(/\r?\n/);
      const parsedHeaders = (lines[0] ?? "")
        .split(separator)
        .map((value) => value.trim());
      if (!hasValidImportHeaders(parsedHeaders)) {
        throw new Error("Struktura pliku jest nieprawidłowa");
      }
      return buildPreviewRows(
        parsedHeaders,
        lines.slice(1).map((line) => line.split(separator)),
      );
    };

    try {
      setError("");
      let parsedWorkbookRows: Record<string, PreviewRow[]> = {};

      if (extension === "csv") {
        parsedWorkbookRows = { CSV: await parseDelimitedRows(",") };
      } else if (extension === "tsv") {
        parsedWorkbookRows = { TSV: await parseDelimitedRows("\t") };
      } else {
        const XLSX = await loadXLSX();
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        parsedWorkbookRows = Object.fromEntries(
          workbook.SheetNames.map((sheetName) => {
            const matrix = XLSX.utils.sheet_to_json<string[]>(
              workbook.Sheets[sheetName]!,
              {
                header: 1,
                defval: "",
              },
            );
            const sheetHeaders = (matrix[0] ?? []).map((value) =>
              String(value).trim(),
            );
            if (!hasValidImportHeaders(sheetHeaders)) {
              return null;
            }
            return [sheetName, buildPreviewRows(sheetHeaders, matrix.slice(1))];
          }).filter((entry): entry is [string, PreviewRow[]] => Boolean(entry)),
        );
        if (!Object.keys(parsedWorkbookRows).length) {
          throw new Error("Struktura pliku jest nieprawidłowa");
        }
      }

      const availableSheets = Object.keys(parsedWorkbookRows);
      const firstSheet = availableSheets[0] ?? "";
      const sheetRows = parsedWorkbookRows[firstSheet] ?? [];

      setWorkbookRows(parsedWorkbookRows);
      setSheetNames(availableSheets);
      setSelectedSheet(firstSheet);
      setRows(sheetRows);
      setMapping(buildDefaultMapping(Object.keys(sheetRows[0] ?? {})));
    } catch (cause) {
      setWorkbookRows({});
      setSheetNames([]);
      setSelectedSheet("");
      setRows([]);
      setMapping({});
      setError(
        cause instanceof Error
          ? cause.message
          : "Struktura pliku jest nieprawidłowa",
      );
    }
  };

  const options = [
    ["firstName", messages.import.fields.firstName],
    ["lastName", messages.import.fields.lastName],
    ["side", messages.import.fields.side],
    ["email", messages.import.fields.email],
    ["phone", messages.import.fields.phone],
    ["dietaryRestrictions", messages.import.fields.dietaryRestrictions],
    ["notes", messages.import.fields.notes],
    ["rsvpStatus", messages.guests.rsvp],
    ["invitationReceived", messages.guests.invitationReceived],
    ["paymentCoverage", messages.guests.payment],
    ["transportToVenue", messages.guests.transportTo],
    ["transportFromVenue", messages.guests.transportFrom],
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-white/85">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
            {messages.import.instructionsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-[var(--color-muted-copy)]">
          <p>{messages.import.instructionsLead}</p>
          <ul className="space-y-1">
            {messages.import.instructionsRows.map((row: string) => (
              <li key={row}>• {row}</li>
            ))}
          </ul>
          <div className="rounded-[1.25rem] bg-[var(--color-card-tint)]/75 p-4 text-[var(--color-ink)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
              {messages.import.sampleColumns}
            </p>
            <p className="mt-2 text-sm">
              {IMPORT_TEMPLATE_HEADERS.map((header) => `\`${header}\``).join(
                ", ",
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/85">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
            {messages.import.uploadWorkbook}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={async () =>
                downloadBlob(
                  await buildWorkbookBuffer("xlsx"),
                  "szablon-goscie.xlsx",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
              }
            >
              XLSX
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={async () =>
                downloadBlob(
                  await buildWorkbookBuffer("xls"),
                  "szablon-goscie.xls",
                  "application/vnd.ms-excel",
                )
              }
            >
              XLS
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() =>
                downloadBlob(
                  buildDelimitedTemplate(","),
                  "szablon-goscie.csv",
                  "text/csv;charset=utf-8",
                )
              }
            >
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() =>
                downloadBlob(
                  buildDelimitedTemplate("\t"),
                  "szablon-goscie.tsv",
                  "text/tab-separated-values;charset=utf-8",
                )
              }
            >
              TSV
            </Button>
          </div>

          <Input
            type="file"
            accept=".xlsx,.xls,.csv,.tsv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleFile(file);
              }
            }}
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {sheetNames.length ? (
            <select
              className="h-10 rounded-xl border px-3"
              value={selectedSheet}
              onChange={(event) => {
                const nextSheet = event.target.value;
                const nextRows = workbookRows[nextSheet] ?? [];
                setSelectedSheet(nextSheet);
                setRows(nextRows);
                setMapping(buildDefaultMapping(Object.keys(nextRows[0] ?? {})));
              }}
            >
              {sheetNames.map((sheetName) => (
                <option key={sheetName} value={sheetName}>
                  {sheetName}
                </option>
              ))}
            </select>
          ) : null}
        </CardContent>
      </Card>

      {rows.length ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-white/70 bg-white/85">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                {messages.import.mapColumns}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {options.map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {label}
                  </p>
                  <select
                    className="h-10 w-full rounded-xl border px-3"
                    value={mapping[key] ?? ""}
                    onChange={(event) =>
                      setMapping((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                  >
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <Button
                className="rounded-full"
                onClick={async () => {
                  try {
                    const guests = await apiClient<GuestView[]>("/api/import", {
                      method: "POST",
                      body: JSON.stringify({
                        rows: mapPreviewRows(rows, mapping),
                      }),
                    });
                    onImported?.(guests);
                  } catch {
                    toast.error(messages.common.actionError);
                  }
                }}
              >
                {messages.import.importGuests}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/85">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                {messages.import.previewRows}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rows.slice(0, 5).map((row, index) => (
                <div
                  key={`${index}-${row[headers[0] ?? ""]}`}
                  className="rounded-[1.25rem] bg-[var(--color-card-tint)]/75 p-4"
                >
                  <pre className="overflow-x-auto text-xs text-[var(--color-ink)]">
                    {JSON.stringify(row, null, 2)}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};
