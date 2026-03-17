import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardData } from "@/services/dashboard-service";

describe("DashboardOverview", () => {
  it("renders summary cards, filters and secondary summaries", async () => {
    render(<DashboardOverview data={await getDashboardData()} />);

    expect(screen.getByText("Odliczanie")).toBeInTheDocument();
    expect(screen.getByText("Wydatki według kategorii")).toBeInTheDocument();
    expect(screen.getByText("Guest arrival")).toBeInTheDocument();
    expect(screen.getByText("Najbliższe zadania")).toBeInTheDocument();
    expect(screen.getByText("Wszystkie wydatki")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.selectOptions(
      screen.getByLabelText("Filtr wykresu budżetu"),
      "paid",
    );
    expect(screen.getByDisplayValue("Tylko opłacone")).toBeInTheDocument();
  });

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
  });

  it("hides dashboard task modules for read-only view", async () => {
    render(
      <DashboardOverview
        data={await getDashboardData({ viewerRole: "READ_ONLY" })}
      />,
    );

    expect(screen.queryByText("Najbliższe zadania")).not.toBeInTheDocument();
  });
});
