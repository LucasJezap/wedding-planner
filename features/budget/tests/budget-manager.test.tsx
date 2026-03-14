import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { BudgetManager } from "@/features/budget/components/budget-manager";
import { apiClient } from "@/lib/api-client";
import { getBudgetOverview } from "@/services/budget-service";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

describe("BudgetManager", () => {
  it("renders totals and creates an expense", async () => {
    const budget = await getBudgetOverview();
    vi.mocked(apiClient)
      .mockResolvedValueOnce({
        ...budget.expenses[0]!,
        id: "expense-new",
        name: "Extra blooms",
      })
      .mockResolvedValueOnce({
        categories: budget.categories,
        expenses: [
          {
            ...budget.expenses[0]!,
            id: "expense-new",
            name: "Extra blooms",
          },
          ...budget.expenses,
        ],
      });

    render(
      <BudgetManager
        initialCategories={budget.categories}
        initialExpenses={budget.expenses}
      />,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Nazwa wydatku"), "Extra blooms");
    await user.click(screen.getByRole("button", { name: "Utwórz wydatek" }));

    await waitFor(() => expect(apiClient).toHaveBeenCalled());
    expect(screen.getByText("Podsumowanie budżetu")).toBeInTheDocument();
  });
});
