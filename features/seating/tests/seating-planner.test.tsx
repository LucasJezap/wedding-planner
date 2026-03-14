import { render, screen } from "@testing-library/react";

import { SeatingPlanner } from "@/features/seating/components/seating-planner";
import { getSeatingBoard } from "@/services/seating-service";

describe("SeatingPlanner", () => {
  it("renders seating summary and tables", async () => {
    render(
      <SeatingPlanner
        initialBoard={await getSeatingBoard()}
        viewerRole="ADMIN"
      />,
    );

    expect(screen.getAllByText("Goście bez stołu")).toHaveLength(2);
    expect(screen.getByText("Garden Table")).toBeInTheDocument();
    expect(
      screen.getAllByPlaceholderText("Upuść gościa tutaj").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Conservatory Table")).toBeInTheDocument();
  });
});
