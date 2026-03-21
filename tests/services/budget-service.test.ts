import {
  createBudgetCategory,
  createPayment,
  createExpense,
  deleteBudgetCategory,
  deleteExpense,
  getBudgetOverview,
  updateBudgetCategory,
  updateExpense,
} from "@/services/budget-service";

describe("budget-service", () => {
  it("calculates category totals", async () => {
    const budget = await getBudgetOverview();
    expect(budget.categories[0]?.actualAmount).toBeGreaterThan(0);
  });

  it("updates categories and expenses", async () => {
    const budget = await getBudgetOverview();
    const category = budget.categories[0]!;
    const firstVendor = (await getBudgetOverview()).expenses[0]?.vendorId;

    const createdCategory = await createBudgetCategory({
      name: "Stationery",
      plannedAmount: 1500,
      color: "#8EA6D1",
      notes: "Invites and paper goods",
    });
    expect(createdCategory.color).toBe("#8EA6D1");

    const updatedCategory = await updateBudgetCategory(category.id, {
      name: category.name,
      plannedAmount: category.plannedAmount + 1000,
      color: category.color,
      notes: category.notes,
    });
    expect(updatedCategory.plannedAmount).toBe(category.plannedAmount + 1000);

    const createdExpense = await createExpense({
      categoryId: category.id,
      vendorId: firstVendor ?? "",
      name: "Extra lighting",
      estimateMin: 500,
      estimateMax: 700,
      actualAmount: 600,
      dueDate: "2026-06-10T12:00",
      notes: "Deposit",
    });
    expect(createdExpense.name).toBe("Extra lighting");
    expect(createdExpense.dueDate).toContain("2026-06-10");

    const updatedExpense = await updateExpense(createdExpense.id, {
      actualAmount: 750,
    });
    expect(updatedExpense.actualAmount).toBe(750);

    const expenseWithPayment = await createPayment({
      expenseId: createdExpense.id,
      amount: 200,
      paidAt: "2026-03-18T12:00",
      notes: "Second installment",
    });
    expect(expenseWithPayment.paidAmount).toBe(200);
    expect(expenseWithPayment.remainingAmount).toBe(550);

    await deleteExpense(createdExpense.id);
    expect(
      (await getBudgetOverview()).expenses.find(
        (item) => item.id === createdExpense.id,
      ),
    ).toBeUndefined();

    await deleteBudgetCategory(createdCategory.id);
    expect(
      (await getBudgetOverview()).categories.find(
        (item) => item.id === createdCategory.id,
      ),
    ).toBeUndefined();
  });

  it("throws when updating a missing expense", async () => {
    await expect(
      updateExpense("missing", { actualAmount: 100 }),
    ).rejects.toThrow("Expense not found");
  });

  it("clamps remaining amount to zero when payments exceed the final cost", async () => {
    const budget = await getBudgetOverview();
    const category = budget.categories[0]!;
    const createdExpense = await createExpense({
      categoryId: category.id,
      name: "Overpaid vendor",
      estimateMin: 100,
      estimateMax: 100,
      actualAmount: 100,
      notes: "",
    });

    const updated = await createPayment({
      expenseId: createdExpense.id,
      amount: 150,
      paidAt: "2026-03-19T12:00",
      notes: "",
    });

    expect(updated.remainingAmount).toBe(0);
  });
});
