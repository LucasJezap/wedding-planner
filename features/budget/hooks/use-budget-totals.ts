"use client";

import type { BudgetCategoryView, ExpenseView } from "@/lib/planner-domain";

export const useBudgetTotals = (
  categories: BudgetCategoryView[],
  expenses: ExpenseView[],
) => ({
  planned: categories.reduce(
    (sum, category) => sum + category.plannedAmount,
    0,
  ),
  actual: expenses.reduce((sum, expense) => sum + expense.actualAmount, 0),
  paid: expenses.reduce((sum, expense) => sum + expense.paidAmount, 0),
});
