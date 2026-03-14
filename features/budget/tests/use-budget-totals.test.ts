import { renderHook } from "@testing-library/react";

import { useBudgetTotals } from "@/features/budget/hooks/use-budget-totals";
import { createPlannerSeed } from "@/lib/planner-seed";

describe("useBudgetTotals", () => {
  it("sums planned and actual amounts", () => {
    const seed = createPlannerSeed();
    const categories = seed.budgetCategories.map((category) => ({
      ...category,
      paidAmount: 100,
      estimatedAmount: 150,
      actualAmount: 100,
      remainingAmount: category.plannedAmount - 100,
    }));
    const expenses = seed.expenses.map((expense) => ({
      ...expense,
      categoryName: "Demo",
      categoryColor: "#D89BAE",
      paidAmount: 100,
      remainingAmount: expense.actualAmount - 100,
      payments: [],
    }));
    const { result } = renderHook(() => useBudgetTotals(categories, expenses));
    expect(result.current.planned).toBeGreaterThan(result.current.actual);
    expect(result.current.paid).toBeGreaterThan(0);
  });
});
