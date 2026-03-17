import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { ImportWizard } from "@/features/import/components/import-wizard";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

vi.mock("xlsx", () => ({
  read: vi.fn(() => ({
    SheetNames: ["Guests", "VIP"],
    Sheets: {
      Guests: { name: "Guests" },
      VIP: { name: "VIP" },
    },
  })),
  utils: {
    aoa_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    write: vi.fn(() => new ArrayBuffer(8)),
    sheet_to_json: vi.fn((sheet: { name: string }) =>
      sheet.name === "VIP"
        ? [
            [
              "Imię",
              "Nazwisko",
              "Strona",
              "Email",
              "Telefon",
              "Dieta",
              "Notatki",
              "RSVP",
              "Zaproszenie doręczone",
              "Płatność",
              "Transport na salę",
              "Transport powrotny",
            ],
            [
              "Jan",
              "Nowak",
              "Przyjaciele",
              "jan@example.com",
              "123456",
              "Brak",
              "",
              "Oczekuje",
              "☐",
              "100%",
              "☐",
              "☐",
            ],
          ]
        : [
            [
              "Imię",
              "Nazwisko",
              "Strona",
              "Email",
              "Telefon",
              "Dieta",
              "Notatki",
              "RSVP",
              "Zaproszenie doręczone",
              "Płatność",
              "Transport na salę",
              "Transport powrotny",
            ],
            [
              "Ivy",
              "Stone",
              "Panna Młoda",
              "ivy@example.com",
              "123456",
              "Wege",
              "",
              "Potwierdzono",
              "☑",
              "100%",
              "☐",
              "☐",
            ],
          ],
    ),
  },
}));

describe("ImportWizard", () => {
  it("loads workbook rows, explains the input and switches sheets", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce([]);
    render(<ImportWizard />);

    expect(screen.getByText("Jak przygotować plik")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Import przyjmuje pliki .xlsx, .xls, .csv i .tsv. Pierwszy wiersz musi zawierać polskie nagłówki z szablonu.",
      ),
    ).toBeInTheDocument();

    const file = new File(["xlsx"], "guests.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    Object.defineProperty(file, "arrayBuffer", {
      value: vi.fn(async () => new ArrayBuffer(8)),
    });
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });

    await waitFor(() =>
      expect(screen.getByText("Mapowanie kolumn")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByDisplayValue("Guests"), {
      target: { value: "VIP" },
    });

    await waitFor(() =>
      expect(screen.getAllByText("Imię").length).toBeGreaterThan(0),
    );
  });
});
