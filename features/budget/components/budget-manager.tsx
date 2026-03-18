"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FieldError } from "@/components/field-error";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

const LazyPieChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } = mod;
      const ChartWrapper = ({
        data,
        dataKey,
        nameKey,
        formatValue,
        fallbackLabel,
      }: {
        data: Array<{
          id: string;
          color: string;
          name: string;
          [key: string]: unknown;
        }>;
        dataKey: string;
        nameKey: string;
        formatValue: (value: number) => string;
        fallbackLabel: string;
      }) => (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              outerRadius={100}
            >
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => [
                formatValue(Number(value ?? 0)),
                item?.payload?.name ?? fallbackLabel,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      );
      ChartWrapper.displayName = "BudgetPieChart";
      return { default: ChartWrapper };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted-copy)]">
        Ładowanie wykresu...
      </div>
    ),
  },
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBudgetTotals } from "@/features/budget/hooks/use-budget-totals";
import {
  budgetCategoryInputSchema,
  expenseInputSchema,
  paymentInputSchema,
} from "@/features/budget/types/budget";
import type {
  BudgetCategoryInput,
  ExpenseInput,
  PaymentInput,
} from "@/features/budget/types/budget";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { BudgetCategoryView, ExpenseView } from "@/lib/planner-domain";

const categoryPalette = [
  "#D89BAE",
  "#E8B4A0",
  "#A1C6B4",
  "#8EA6D1",
  "#D8C28F",
  "#B4A7D6",
  "#D97C6C",
  "#E59F71",
  "#E8B95B",
  "#B7C971",
  "#79B98E",
  "#58B2A5",
  "#5FA5C4",
  "#7393D6",
  "#8E85D9",
  "#AD7AD3",
  "#C971B6",
  "#D46D98",
  "#B95D73",
  "#C48761",
  "#B69674",
  "#8B9A63",
  "#6FA075",
  "#4D9A89",
  "#4C8696",
  "#6279A5",
  "#8572B5",
  "#9E6EAE",
  "#B66B9D",
  "#C56F82",
  "#D28D74",
  "#B8A56B",
  "#8DA66A",
  "#72A58F",
  "#7E8FB4",
];

export const BudgetManager = ({
  initialCategories,
  initialExpenses,
}: {
  initialCategories: BudgetCategoryView[];
  initialExpenses: ExpenseView[];
}) => {
  const { locale, messages } = useLocale();
  const [categories, setCategories] = useState(initialCategories);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [selectedCategory, setSelectedCategory] =
    useState<BudgetCategoryView | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseView | null>(
    null,
  );
  const [selectedCategoryColor, setSelectedCategoryColor] = useState(
    categoryPalette[0],
  );
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(
    null,
  );
  const [categoryChartMetric, setCategoryChartMetric] = useState<
    "plannedAmount" | "paidAmount" | "remainingAmount"
  >("plannedAmount");
  const categoryFormRef = useRef<HTMLDivElement | null>(null);
  const expenseFormRef = useRef<HTMLDivElement | null>(null);
  const totals = useBudgetTotals(categories, expenses);

  const refreshBudget = async () => {
    try {
      const refreshed = await apiClient<{
        categories: BudgetCategoryView[];
        expenses: ExpenseView[];
      }>("/api/budget");
      setCategories(refreshed.categories);
      setExpenses(refreshed.expenses);
    } catch {
      toast.error(messages.common.actionError);
    }
  };

  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    reset: resetCategory,
    setValue: setCategoryValue,
    formState: { errors: categoryErrors, isSubmitting: isCategorySubmitting },
  } = useForm<BudgetCategoryInput>({
    defaultValues: {
      name: "",
      plannedAmount: 0,
      color: categoryPalette[0],
      notes: "",
    },
    resolver: zodResolver(budgetCategoryInputSchema) as never,
  });
  const {
    register: registerExpense,
    handleSubmit: handleExpenseSubmit,
    reset: resetExpense,
    formState: { errors: expenseErrors, isSubmitting: isExpenseSubmitting },
  } = useForm<ExpenseInput>({
    defaultValues: {
      categoryId: initialCategories[0]?.id ?? "",
      name: "",
      estimateMin: 0,
      estimateMax: 0,
      actualAmount: 0,
      notes: "",
    },
    resolver: zodResolver(expenseInputSchema) as never,
  });
  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    reset: resetPayment,
    formState: { errors: paymentErrors, isSubmitting: isPaymentSubmitting },
  } = useForm<PaymentInput>({
    defaultValues: {
      expenseId: "",
      amount: 0,
      paidAt: new Date().toISOString().slice(0, 16),
      notes: "",
    },
    resolver: zodResolver(paymentInputSchema) as never,
  });

  const resetCategoryForm = () => {
    setSelectedCategory(null);
    setSelectedCategoryColor(categoryPalette[0]);
    resetCategory({
      name: "",
      plannedAmount: 0,
      color: categoryPalette[0],
      notes: "",
    });
  };

  const resetExpenseForm = () => {
    setSelectedExpense(null);
    resetExpense({
      categoryId: categories[0]?.id ?? "",
      name: "",
      estimateMin: 0,
      estimateMax: 0,
      actualAmount: 0,
      notes: "",
    });
  };

  const handleEditCategory = (category: BudgetCategoryView) => {
    setSelectedCategory(category);
    resetCategory({
      name: category.name,
      plannedAmount: category.plannedAmount,
      color: category.color,
      notes: category.notes,
    });
    setSelectedCategoryColor(category.color);
    categoryFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleEditExpense = (expense: ExpenseView) => {
    setSelectedExpense(expense);
    resetExpense({
      categoryId: expense.categoryId,
      name: expense.name,
      estimateMin: expense.estimateMin,
      estimateMax: expense.estimateMax,
      actualAmount: expense.actualAmount,
      notes: expense.notes,
    });
    expenseFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.budget.totals}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-[var(--color-card-tint)]/75 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                {messages.budget.plan}
              </p>
              <p className="mt-2 font-display text-4xl text-[var(--color-ink)]">
                {formatCurrency(totals.planned, locale)}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-card-tint)]/75 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                {messages.budget.paid}
              </p>
              <p className="mt-2 font-display text-4xl text-[var(--color-ink)]">
                {formatCurrency(totals.paid, locale)}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-card-tint)]/75 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                {messages.budget.remaining}
              </p>
              <p className="mt-2 font-display text-4xl text-[var(--color-ink)]">
                {formatCurrency(
                  Math.max(totals.actual - totals.paid, 0),
                  locale,
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="scroll-mt-40 border-white/70 bg-white/85"
          ref={categoryFormRef}
        >
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {selectedCategory
                ? messages.budget.editCategory
                : messages.budget.addCategory}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={handleCategorySubmit(async (values) => {
                try {
                  await apiClient<BudgetCategoryView>(
                    selectedCategory ? "/api/budget" : "/api/budget/categories",
                    {
                      method: selectedCategory ? "PATCH" : "POST",
                      body: JSON.stringify({
                        ...values,
                        plannedAmount: Number(values.plannedAmount),
                        categoryId: selectedCategory?.id,
                      }),
                    },
                  );
                  await refreshBudget();
                  resetCategoryForm();
                } catch {
                  toast.error(messages.common.actionError);
                }
              })}
            >
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>{messages.budget.categoryName}</span>
                <Input
                  aria-invalid={!!categoryErrors.name}
                  {...registerCategory("name")}
                />
                <FieldError error={categoryErrors.name} />
              </label>
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>{messages.budget.planAmount}</span>
                <Input
                  type="number"
                  step="1"
                  {...registerCategory("plannedAmount", {
                    valueAsNumber: true,
                  })}
                />
              </label>
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>{messages.budget.categoryColor}</span>
                <div className="space-y-3 rounded-[1.25rem] border border-[var(--color-card-tint)]/80 p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      aria-label={messages.budget.categoryColor}
                      className="h-11 w-16 cursor-pointer rounded-lg border border-[var(--color-card-tint)] bg-white p-1"
                      value={selectedCategoryColor}
                      onChange={(event) => {
                        setSelectedCategoryColor(event.target.value);
                        setCategoryValue("color", event.target.value, {
                          shouldDirty: true,
                        });
                      }}
                    />
                    <Input
                      {...registerCategory("color")}
                      className="font-mono"
                      value={selectedCategoryColor}
                      onChange={(event) => {
                        setSelectedCategoryColor(event.target.value);
                        setCategoryValue("color", event.target.value, {
                          shouldDirty: true,
                        });
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {categoryPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        title={color}
                        aria-label={`${messages.budget.categoryColor}: ${color}`}
                        className={`h-9 rounded-xl border transition-transform hover:scale-[1.04] ${
                          selectedCategoryColor === color
                            ? "border-[var(--color-ink)] ring-2 ring-[var(--color-card-tint)]"
                            : "border-white/80"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setSelectedCategoryColor(color);
                          setCategoryValue("color", color, {
                            shouldDirty: true,
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              </label>
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>{messages.budget.categoryNotes}</span>
                <Input {...registerCategory("notes")} />
              </label>
              <div className="flex gap-3">
                <Button
                  className="rounded-full"
                  type="submit"
                  disabled={isCategorySubmitting}
                >
                  {selectedCategory
                    ? messages.budget.saveCategory
                    : messages.budget.createCategory}
                </Button>
                {selectedCategory ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetCategoryForm}
                    >
                      {messages.guests.cancel}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm(messages.common.confirmDelete)) {
                          return;
                        }
                        try {
                          await apiClient<{ categoryId: string }>(
                            `/api/budget/categories/${selectedCategory.id}`,
                            {
                              method: "DELETE",
                            },
                          );
                          await refreshBudget();
                          resetCategoryForm();
                        } catch {
                          toast.error(messages.common.actionError);
                        }
                      }}
                    >
                      {messages.guests.delete}
                    </Button>
                  </>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card
          className="scroll-mt-40 border-white/70 bg-white/85"
          ref={expenseFormRef}
        >
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {selectedExpense
                ? messages.budget.editExpense
                : messages.budget.addExpense}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={handleExpenseSubmit(async (values) => {
                try {
                  await apiClient<ExpenseView>(
                    selectedExpense
                      ? `/api/budget/expenses/${selectedExpense.id}`
                      : "/api/budget",
                    {
                      method: selectedExpense ? "PATCH" : "POST",
                      body: JSON.stringify({
                        ...values,
                        estimateMin: Number(values.estimateMin),
                        estimateMax: Number(values.estimateMax),
                        actualAmount: Number(values.actualAmount),
                      }),
                    },
                  );
                  await refreshBudget();
                  resetExpenseForm();
                } catch {
                  toast.error(messages.common.actionError);
                }
              })}
            >
              <p className="text-sm leading-6 text-[var(--color-muted-copy)]">
                {messages.budget.expenseHelp}
              </p>
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>{messages.budget.expenseCategory}</span>
                <select
                  className="h-10 w-full rounded-xl border px-3"
                  {...registerExpense("categoryId")}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>{messages.budget.expenseName}</span>
                <Input
                  aria-invalid={!!expenseErrors.name}
                  {...registerExpense("name")}
                />
                <FieldError error={expenseErrors.name} />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                  <span>{messages.budget.estimateMin}</span>
                  <Input
                    type="number"
                    step="1"
                    {...registerExpense("estimateMin", { valueAsNumber: true })}
                  />
                </label>
                <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                  <span>{messages.budget.estimateMax}</span>
                  <Input
                    type="number"
                    step="1"
                    {...registerExpense("estimateMax", { valueAsNumber: true })}
                  />
                </label>
                <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                  <span>{messages.budget.actualAmount}</span>
                  <Input
                    type="number"
                    step="1"
                    {...registerExpense("actualAmount", {
                      valueAsNumber: true,
                    })}
                  />
                </label>
              </div>
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>{messages.budget.expenseNotes}</span>
                <Input {...registerExpense("notes")} />
              </label>
              <div className="flex gap-3">
                <Button
                  className="rounded-full"
                  type="submit"
                  disabled={isExpenseSubmitting}
                >
                  {selectedExpense
                    ? messages.budget.saveExpense
                    : messages.budget.createExpense}
                </Button>
                {selectedExpense ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetExpenseForm}
                  >
                    {messages.guests.cancel}
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                {messages.budget.categoryMix}
              </CardTitle>
              <select
                className="h-10 rounded-full border border-[var(--color-card-tint)] bg-white px-4 text-sm text-[var(--color-ink)]"
                value={categoryChartMetric}
                onChange={(event) =>
                  setCategoryChartMetric(
                    event.target.value as
                      | "plannedAmount"
                      | "paidAmount"
                      | "remainingAmount",
                  )
                }
                aria-label={messages.dashboard.chartFilter}
              >
                <option value="plannedAmount">{messages.budget.plan}</option>
                <option value="paidAmount">{messages.budget.paid}</option>
                <option value="remainingAmount">
                  {messages.budget.remaining}
                </option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <LazyPieChart
              data={categories}
              dataKey={categoryChartMetric}
              nameKey="name"
              formatValue={(value) => formatCurrency(value, locale)}
              fallbackLabel={messages.budget.categoryName}
            />
          </CardContent>
          <CardContent className="pt-0">
            <details className="rounded-[1.25rem] border border-[var(--color-card-tint)]/70 bg-[var(--color-card-tint)]/20 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-medium text-[var(--color-ink)]">
                Legenda kategorii
              </summary>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    title={`${category.name} • ${messages.budget.plan}: ${formatCurrency(
                      category.plannedAmount,
                      locale,
                    )} • ${messages.budget.paid}: ${formatCurrency(
                      category.paidAmount,
                      locale,
                    )}${category.notes ? ` • ${category.notes}` : ""}`}
                    className="flex items-center justify-between rounded-[1rem] border border-[var(--color-card-tint)]/70 bg-[var(--color-card-tint)]/30 px-3 py-2 text-sm text-[var(--color-ink)]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs text-[var(--color-muted-copy)]">
                      {formatCurrency(category[categoryChartMetric], locale)}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </CardContent>
        </Card>

        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-muted-copy)]">
            {messages.budget.emptyCategories}
          </p>
        ) : null}
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              id={`budget-category-${category.id}`}
              className="scroll-mt-40 border-white/70 bg-white/85"
            >
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-display text-3xl text-[var(--color-ink)]">
                        {category.name}
                      </h3>
                    </div>
                    {category.notes ? (
                      <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                        {category.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleEditCategory(category)}
                    >
                      {messages.guests.editButton}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm(messages.common.confirmDelete)) {
                          return;
                        }
                        try {
                          await apiClient<{ categoryId: string }>(
                            `/api/budget/categories/${category.id}`,
                            {
                              method: "DELETE",
                            },
                          );
                          await refreshBudget();
                          if (selectedCategory?.id === category.id) {
                            resetCategoryForm();
                          }
                        } catch {
                          toast.error(messages.common.actionError);
                        }
                      }}
                    >
                      {messages.guests.delete}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-[var(--color-card-tint)]/55 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                      {messages.budget.plan}
                    </p>
                    <p className="mt-2 text-lg text-[var(--color-ink)]">
                      {formatCurrency(category.plannedAmount, locale)}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[var(--color-card-tint)]/55 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                      {messages.budget.paid}
                    </p>
                    <p className="mt-2 text-lg text-[var(--color-ink)]">
                      {formatCurrency(category.paidAmount, locale)}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[var(--color-card-tint)]/55 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                      {messages.budget.remaining}
                    </p>
                    <p className="mt-2 text-lg text-[var(--color-ink)]">
                      {formatCurrency(category.remainingAmount, locale)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {expenses.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-muted-copy)]">
            {messages.budget.emptyExpenses}
          </p>
        ) : null}
        <div className="grid gap-4">
          {expenses.map((expense) => (
            <Card
              key={expense.id}
              id={`expense-${expense.id}`}
              className="scroll-mt-40 border-white/70 bg-white/85"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: expense.categoryColor }}
                      />
                      <h3 className="font-display text-3xl text-[var(--color-ink)]">
                        {expense.name}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                      {expense.categoryName}
                    </p>
                    {expense.notes ? (
                      <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                        {expense.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleEditExpense(expense)}
                    >
                      {messages.guests.editButton}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm(messages.common.confirmDelete)) {
                          return;
                        }
                        try {
                          await apiClient<{ expenseId: string }>(
                            `/api/budget/expenses/${expense.id}`,
                            {
                              method: "DELETE",
                            },
                          );
                          await refreshBudget();
                        } catch {
                          toast.error(messages.common.actionError);
                        }
                      }}
                    >
                      {messages.guests.delete}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-[var(--color-card-tint)]/55 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                      {messages.budget.plan}
                    </p>
                    <p className="mt-2 text-lg text-[var(--color-ink)]">
                      {formatCurrency(expense.actualAmount, locale)}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[var(--color-card-tint)]/55 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                      {messages.budget.paid}
                    </p>
                    <p className="mt-2 text-lg text-[var(--color-ink)]">
                      {formatCurrency(expense.paidAmount, locale)}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[var(--color-card-tint)]/55 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                      {messages.budget.remaining}
                    </p>
                    <p className="mt-2 text-lg text-[var(--color-ink)]">
                      {formatCurrency(expense.remainingAmount, locale)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.budget.rangeLabel(
                    formatCurrency(expense.estimateMin, locale),
                    formatCurrency(expense.estimateMax, locale),
                  )}
                </p>

                <Button
                  variant="outline"
                  onClick={() =>
                    setExpandedExpenseId((current) =>
                      current === expense.id ? null : expense.id,
                    )
                  }
                >
                  {messages.budget.showMore}
                </Button>

                {expandedExpenseId === expense.id ? (
                  <div className="space-y-4 rounded-[1.5rem] bg-[var(--color-card-tint)]/35 p-4">
                    <div className="space-y-2">
                      {expense.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="rounded-[1.25rem] border border-white/70 bg-white/80 p-3"
                        >
                          <p className="text-sm font-medium text-[var(--color-ink)]">
                            {formatCurrency(payment.amount, locale)}
                          </p>
                          <p className="text-xs text-[var(--color-muted-copy)]">
                            {new Date(payment.paidAt).toLocaleString(locale)}
                          </p>
                          {payment.notes ? (
                            <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                              {payment.notes}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <form
                      className="grid gap-3 sm:grid-cols-[1fr_1fr_1.2fr_auto]"
                      onSubmit={handlePaymentSubmit(async (values) => {
                        try {
                          await apiClient<ExpenseView>(
                            `/api/budget/expenses/${expense.id}/payments`,
                            {
                              method: "POST",
                              body: JSON.stringify({
                                amount: Number(values.amount),
                                paidAt: values.paidAt,
                                notes: values.notes,
                              }),
                            },
                          );
                          await refreshBudget();
                          resetPayment({
                            expenseId: expense.id,
                            amount: 0,
                            paidAt: new Date().toISOString().slice(0, 16),
                            notes: "",
                          });
                        } catch {
                          toast.error(messages.common.actionError);
                        }
                      })}
                    >
                      <Input
                        type="number"
                        step="1"
                        placeholder={messages.budget.paymentAmount}
                        {...registerPayment("amount", { valueAsNumber: true })}
                      />
                      <Input
                        type="datetime-local"
                        {...registerPayment("paidAt")}
                      />
                      <Input
                        placeholder={messages.budget.paymentNotes}
                        {...registerPayment("notes")}
                      />
                      <Button
                        className="rounded-full"
                        type="submit"
                        disabled={isPaymentSubmitting}
                      >
                        {messages.budget.addPayment}
                      </Button>
                    </form>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
