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
    sheet_to_json: vi.fn((sheet: { name: string }) =>
      sheet.name === "VIP"
        ? [
            {
              FirstName: "Jan",
              LastName: "Nowak",
              Side: "FRIENDS",
              Email: "jan@example.com",
              Phone: "123456",
              DietaryRestrictions: "",
              Notes: "",
              InvitationReceived: "true",
              PaymentCoverage: "FULL",
              TransportToVenue: "false",
              TransportFromVenue: "false",
            },
          ]
        : [
            {
              FirstName: "Ivy",
              LastName: "Stone",
              Side: "BRIDE",
              Email: "ivy@example.com",
              Phone: "123456",
              DietaryRestrictions: "",
              Notes: "",
              InvitationReceived: "false",
              PaymentCoverage: "FULL",
              TransportToVenue: "false",
              TransportFromVenue: "false",
            },
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
        "Import przyjmuje pliki .xlsx lub .xls. Pierwszy wiersz powinien zawierać nagłówki kolumn.",
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
      expect(screen.getAllByText("FirstName").length).toBeGreaterThan(0),
    );
  });
});
