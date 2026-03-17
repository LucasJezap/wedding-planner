import {
  hasValidImportHeaders,
  IMPORT_TEMPLATE_HEADERS,
  isBlankImportRow,
  LEGACY_IMPORT_TEMPLATE_HEADERS,
} from "@/features/import/types/import";

describe("import types", () => {
  it("accepts Polish and legacy header sets", () => {
    expect(hasValidImportHeaders([...IMPORT_TEMPLATE_HEADERS])).toBe(true);
    expect(hasValidImportHeaders([...LEGACY_IMPORT_TEMPLATE_HEADERS])).toBe(
      true,
    );
  });

  it("rejects incomplete headers and detects blank rows", () => {
    expect(hasValidImportHeaders(["Imię", "Nazwisko"])).toBe(false);
    expect(
      isBlankImportRow({
        Imię: "",
        Nazwisko: "   ",
      }),
    ).toBe(true);
    expect(
      isBlankImportRow({
        Imię: "Anna",
        Nazwisko: "",
      }),
    ).toBe(false);
  });
});
