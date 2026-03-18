import type {
  BudgetCategoryInput,
  ExpenseInput,
  PaymentInput,
} from "@/features/budget/types/budget";
import {
  createBudgetCategory,
  createExpense,
  createPayment,
  deleteBudgetCategory,
  deleteExpense,
  getBudgetOverview,
  updateBudgetCategory,
  updateExpense,
} from "@/services/budget-service";

export const getBudgetHandler = async () => getBudgetOverview();
export const createBudgetCategoryHandler = async (input: BudgetCategoryInput) =>
  createBudgetCategory(input);
export const deleteBudgetCategoryHandler = async (categoryId: string) =>
  deleteBudgetCategory(categoryId);
export const updateBudgetCategoryHandler = async (
  categoryId: string,
  input: BudgetCategoryInput,
) => updateBudgetCategory(categoryId, input);
export const createExpenseHandler = async (input: ExpenseInput) =>
  createExpense(input);
export const updateExpenseHandler = async (
  expenseId: string,
  input: Partial<ExpenseInput>,
) => updateExpense(expenseId, input);
export const deleteExpenseHandler = async (expenseId: string) =>
  deleteExpense(expenseId);
export const createPaymentHandler = async (input: PaymentInput) =>
  createPayment(input);
