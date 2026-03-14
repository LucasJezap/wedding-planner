"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  hasValidImportHeaders,
  IMPORT_TEMPLATE_HEADERS,
} from "@/features/import/types/import";
import { mapPreviewRows } from "@/features/import/hooks/use-import-preview";
import type { GuestView } from "@/lib/planner-domain";
import { apiClient } from "@/lib/api-client";

type PreviewRow = Record<string, string>;

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

  const buildDefaultMapping = (sheetRows: PreviewRow[]) => {
    const sheetHeaders = Object.keys(sheetRows[0] ?? {});
    return {
      firstName: sheetHeaders[0] ?? messages.import.fields.firstName,
      lastName: sheetHeaders[1] ?? messages.import.fields.lastName,
      side: sheetHeaders[2] ?? messages.import.fields.side,
      email: sheetHeaders[3] ?? messages.import.fields.email,
      phone: sheetHeaders[4] ?? messages.import.fields.phone,
      dietaryRestrictions:
        sheetHeaders[5] ?? messages.import.fields.dietaryRestrictions,
      notes: sheetHeaders[6] ?? messages.import.fields.notes,
      invitationReceived: sheetHeaders[7] ?? "InvitationReceived",
      paymentCoverage: sheetHeaders[8] ?? "PaymentCoverage",
      transportToVenue: sheetHeaders[9] ?? "TransportToVenue",
      transportFromVenue: sheetHeaders[10] ?? "TransportFromVenue",
    };
  };

  const handleFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const parseDelimitedRows = async (separator: "," | "\t") => {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      const parsedHeaders = (lines[0] ?? "")
        .split(separator)
        .map((value) => value.trim());
      if (!hasValidImportHeaders(parsedHeaders)) {
        throw new Error("Struktura pliku jest nieprawidłowa");
      }
      return lines.slice(1).map((line) => {
        const values = line.split(separator);
        return Object.fromEntries(
          parsedHeaders.map((header, index) => [header, values[index] ?? ""]),
        );
      });
    };

    try {
      setError("");
      let parsedWorkbookRows: Record<string, PreviewRow[]> = {};

      if (extension === "csv") {
        parsedWorkbookRows = { CSV: await parseDelimitedRows(",") };
      } else if (extension === "tsv") {
        parsedWorkbookRows = { TSV: await parseDelimitedRows("\t") };
      }

      if (extension !== "csv" && extension !== "tsv") {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const workbookEntries = Object.fromEntries(
          workbook.SheetNames.map((sheetName) => {
            const sheetRows = XLSX.utils.sheet_to_json<PreviewRow>(
              workbook.Sheets[sheetName]!,
              {
                defval: "",
              },
            );
            const sheetHeaders = Object.keys(sheetRows[0] ?? {});
            if (!hasValidImportHeaders(sheetHeaders)) {
              throw new Error("Struktura pliku jest nieprawidłowa");
            }
            return [sheetName, sheetRows];
          }),
        );
        parsedWorkbookRows = workbookEntries;
      }

      const availableSheets = Object.keys(parsedWorkbookRows);
      const firstSheet = availableSheets[0] ?? "";
      const sheetRows = parsedWorkbookRows[firstSheet] ?? [];

      setWorkbookRows(parsedWorkbookRows);
      setSheetNames(availableSheets);
      setSelectedSheet(firstSheet);
      setRows(sheetRows);
      setMapping(buildDefaultMapping(sheetRows));
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
    ["invitationReceived", "InvitationReceived"],
    ["paymentCoverage", "PaymentCoverage"],
    ["transportToVenue", "TransportToVenue"],
    ["transportFromVenue", "TransportFromVenue"],
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
              `FirstName`, `LastName`, `Side`, `Email`, `Phone`,
              `DietaryRestrictions`, `Notes`
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
              onClick={() => {
                const content = `${IMPORT_TEMPLATE_HEADERS.join(",")}\n`;
                const blob = new Blob([content], {
                  type: "text/csv;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "wedding-guests-template.csv";
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                const content = `${IMPORT_TEMPLATE_HEADERS.join("\t")}\n`;
                const blob = new Blob([content], {
                  type: "text/tab-separated-values;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "wedding-guests-template.tsv";
                link.click();
                URL.revokeObjectURL(url);
              }}
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
                setMapping(buildDefaultMapping(nextRows));
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
                  const guests = await apiClient<GuestView[]>("/api/import", {
                    method: "POST",
                    body: JSON.stringify({
                      rows: mapPreviewRows(rows, mapping),
                    }),
                  });
                  onImported?.(guests);
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
