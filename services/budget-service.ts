import { getRepository } from "@/db/repositories";
import type {
  BudgetCategoryView,
  ExpenseView,
  PaymentRecord,
} from "@/lib/planner-domain";
import {
  budgetCategoryInputSchema,
  expenseInputSchema,
  paymentInputSchema,
  type BudgetCategoryInput,
  type ExpenseInput,
  type PaymentInput,
} from "@/features/budget/types/budget";
import { fromDateTimeLocalValue } from "@/lib/date-time";

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

export const getBudgetOverview = async (): Promise<{
  categories: BudgetCategoryView[];
  expenses: ExpenseView[];
  payments: PaymentRecord[];
}> => {
  const repository = getRepository();
  const [categories, expenses, payments] = await Promise.all([
    repository.listBudgetCategories(),
    repository.listExpenses(),
    repository.listPayments(),
  ]);

  const expenseViews: ExpenseView[] = expenses
    .map((expense) => {
      const expensePayments = payments
        .filter((payment) => payment.expenseId === expense.id)
        .sort((left, right) => right.paidAt.localeCompare(left.paidAt));
      const paidAmount = sum(expensePayments.map((payment) => payment.amount));
      const category = categories.find(
        (candidate) => candidate.id === expense.categoryId,
      );

      return {
        ...expense,
        categoryName: category?.name ?? "",
        categoryColor: category?.color ?? "#D89BAE",
        paidAmount,
        remainingAmount: Math.max(expense.actualAmount - paidAmount, 0),
        payments: expensePayments,
      };
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return {
    categories: categories.map((category) => {
      const categoryExpenses = expenseViews.filter(
        (expense) => expense.categoryId === category.id,
      );
      const actualAmount = sum(
        categoryExpenses.map((expense) => expense.actualAmount),
      );
      const paidAmount = sum(
        categoryExpenses.map((expense) => expense.paidAmount),
      );
      const estimatedAmount = sum(
        categoryExpenses.map((expense) => expense.estimateMax),
      );

      return {
        ...category,
        estimatedAmount,
        actualAmount,
        paidAmount,
        remainingAmount: Math.max(category.plannedAmount - paidAmount, 0),
      };
    }),
    expenses: expenseViews,
    payments: payments.sort((left, right) =>
      right.paidAt.localeCompare(left.paidAt),
    ),
  };
};

export const updateBudgetCategory = async (
  categoryId: string,
  input: BudgetCategoryInput,
): Promise<BudgetCategoryView> => {
  const repository = getRepository();
  const data = budgetCategoryInputSchema.parse(input);
  await repository.updateBudgetCategory(categoryId, data);

  return (await getBudgetOverview()).categories.find(
    (candidate) => candidate.id === categoryId,
  )!;
};

export const createBudgetCategory = async (
  input: BudgetCategoryInput,
): Promise<BudgetCategoryView> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const data = budgetCategoryInputSchema.parse(input);
  const created = await repository.createBudgetCategory({
    weddingId: wedding.id,
    name: data.name,
    plannedAmount: data.plannedAmount,
    color: data.color,
    notes: data.notes,
  });
  return (await getBudgetOverview()).categories.find(
    (candidate) => candidate.id === created.id,
  )!;
};

export const deleteBudgetCategory = async (
  categoryId: string,
): Promise<void> => {
  const repository = getRepository();
  await repository.deleteBudgetCategory(categoryId);
};

export const createExpense = async (
  input: ExpenseInput,
): Promise<ExpenseView> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const data = expenseInputSchema.parse(input);
  const created = await repository.createExpense({
    weddingId: wedding.id,
    categoryId: data.categoryId,
    name: data.name,
    estimateMin: data.estimateMin,
    estimateMax: data.estimateMax,
    actualAmount: data.actualAmount,
    notes: data.notes,
  });

  return (await getBudgetOverview()).expenses.find(
    (candidate) => candidate.id === created.id,
  )!;
};

export const updateExpense = async (
  expenseId: string,
  input: Partial<ExpenseInput>,
): Promise<ExpenseView> => {
  const current = (await getBudgetOverview()).expenses.find(
    (candidate) => candidate.id === expenseId,
  );
  if (!current) {
    throw new Error("Expense not found");
  }

  const data = expenseInputSchema.parse({
    categoryId: current.categoryId,
    name: current.name,
    estimateMin: current.estimateMin,
    estimateMax: current.estimateMax,
    actualAmount: current.actualAmount,
    notes: current.notes,
    ...input,
  });

  const repository = getRepository();
  await repository.updateExpense(expenseId, data);
  return (await getBudgetOverview()).expenses.find(
    (candidate) => candidate.id === expenseId,
  )!;
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  const repository = getRepository();
  await repository.deleteExpense(expenseId);
};

export const createPayment = async (
  input: PaymentInput,
): Promise<ExpenseView> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const data = paymentInputSchema.parse(input);
  await repository.createPayment({
    weddingId: wedding.id,
    expenseId: data.expenseId,
    amount: data.amount,
    paidAt: fromDateTimeLocalValue(data.paidAt),
    notes: data.notes,
  });

  return (await getBudgetOverview()).expenses.find(
    (candidate) => candidate.id === data.expenseId,
  )!;
};
