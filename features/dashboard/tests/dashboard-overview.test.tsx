import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardData } from "@/services/dashboard-service";

describe("DashboardOverview", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-04-10T12:00:00.000Z").getTime(),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders summary cards, filters and secondary summaries", async () => {
    render(<DashboardOverview data={await getDashboardData()} />);

    expect(screen.getByText("Odliczanie")).toBeInTheDocument();
    expect(screen.getByText("Filtr odpowiedzialności")).toBeInTheDocument();
    expect(screen.getByText("Do dopilnowania")).toBeInTheDocument();
    expect(screen.getByText("Wydatki według kategorii")).toBeInTheDocument();
    expect(screen.getByText("Guest arrival")).toBeInTheDocument();
    expect(screen.getByText("Najbliższe zadania")).toBeInTheDocument();
    expect(screen.getByText("Szybkie akcje")).toBeInTheDocument();
    expect(screen.getByText("Co dziś")).toBeInTheDocument();
    expect(
      screen.getByText("Najbliższe decyzje do podjęcia"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ostatnie zmiany")).toBeInTheDocument();
    expect(screen.getByText("Wszystkie wydatki")).toBeInTheDocument();
    expect(screen.getByText("RSVP do domknięcia")).toBeInTheDocument();
    expect(screen.getByText("Goście bez stołu")).toBeInTheDocument();
    expect(screen.getByText("Zadania po terminie")).toBeInTheDocument();
    expect(screen.getByText("Zadania wymagające uwagi")).toBeInTheDocument();
    expect(screen.getByText("Follow-upy do vendorów")).toBeInTheDocument();
    expect(screen.getByText("Vendorzy bez kontaktu")).toBeInTheDocument();
    expect(screen.getByText("Płatności wymagające uwagi")).toBeInTheDocument();
    expect(screen.getByText("Płatności nadchodzące")).toBeInTheDocument();
    expect(screen.getAllByText("Northlight Stories").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Domknij zaległe zadanie:/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Approve invitation proof").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Floral design").length).toBeGreaterThan(0);

    const user = userEvent.setup();
    await user.selectOptions(
      screen.getByLabelText("Filtr wykresu budżetu"),
      "paid",
    );
    expect(screen.getByDisplayValue("Tylko opłacone")).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Filtr odpowiedzialności"),
      "TASK:BRIDE",
    );
    expect(screen.getByDisplayValue("Panna młoda")).toBeInTheDocument();
    expect(
      screen.getAllByText("Approve invitation proof").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Approve invitation proof/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByText("Confirm final menu tasting"),
    ).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Filtr odpowiedzialności"),
      "VENDOR:Lukasz",
    );
    expect(screen.getByDisplayValue("Lukasz")).toBeInTheDocument();
    expect(screen.getByText("Rose Atelier")).toBeInTheDocument();
    expect(screen.queryByText("Northlight Stories")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Wszyscy vendorzy maja juz uzupelnione dane kontaktowe.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Dodaj gościa")).toBeInTheDocument();
  }, 10000);

  it("hides budget summaries for witness view", async () => {
    render(
      <DashboardOverview
        data={await getDashboardData({ viewerRole: "WITNESS" })}
      />,
    );

    expect(
      screen.queryByText("Wydatki według kategorii"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Wszystkie wydatki")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Płatności wymagające uwagi"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Płatności nadchodzące")).not.toBeInTheDocument();
    expect(screen.getByText("Follow-upy do vendorów")).toBeInTheDocument();
  });

  it("hides dashboard task modules for read-only view", async () => {
    render(
      <DashboardOverview
        data={await getDashboardData({ viewerRole: "READ_ONLY" })}
      />,
    );

    expect(screen.queryByText("Najbliższe zadania")).not.toBeInTheDocument();
    expect(screen.queryByText("Zadania po terminie")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Zadania wymagające uwagi"),
    ).not.toBeInTheDocument();
  });
});
