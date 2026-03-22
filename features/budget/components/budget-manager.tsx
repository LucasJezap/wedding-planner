"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/field-error";
import { useLocale } from "@/components/locale-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { formatCurrency, formatDate } from "@/lib/format";
import type { BudgetCategoryView, ExpenseView } from "@/lib/planner-domain";
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
];

const sortCategories = (items: BudgetCategoryView[]) =>
  items.slice().sort((left, right) => right.plannedAmount - left.plannedAmount);

type CategoryAmountMode = "EXACT" | "RANGE";

const getCategoryAmountMode = (
  category?: BudgetCategoryView | null,
): CategoryAmountMode =>
  category && category.estimateMin !== category.estimateMax ? "RANGE" : "EXACT";

const formatCategoryAmount = (
  category: BudgetCategoryView,
  locale: "pl" | "en" | undefined,
) =>
  category.estimateMin === category.estimateMax
    ? formatCurrency(category.plannedAmount, locale)
    : `${formatCurrency(category.estimateMin, locale)} / ${formatCurrency(category.estimateMax, locale)}`;

export const BudgetManager = ({
  initialCategories,
  initialExpenses,
}: {
  initialCategories: BudgetCategoryView[];
  initialExpenses: ExpenseView[];
}) => {
  const { locale, messages } = useLocale();
  const [categories, setCategories] = useState(
    sortCategories(initialCategories),
  );
  const [expenses, setExpenses] = useState(initialExpenses);
  const [selectedCategory, setSelectedCategory] =
    useState<BudgetCategoryView | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseView | null>(
    null,
  );
  const [selectedCategoryColor, setSelectedCategoryColor] = useState(
    categoryPalette[0],
  );
  const [categoryAmountMode, setCategoryAmountMode] =
    useState<CategoryAmountMode>("EXACT");
  const [showCategoryColors, setShowCategoryColors] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null,
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
      setCategories(sortCategories(refreshed.categories));
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
    getValues: getCategoryValues,
    formState: { errors: categoryErrors, isSubmitting: isCategorySubmitting },
  } = useForm<BudgetCategoryInput>({
    defaultValues: {
      name: "",
      plannedAmount: 0,
      estimateMin: 0,
      estimateMax: 0,
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
      actualAmount: 0,
      dueDate: "",
      notes: "",
    },
    resolver: zodResolver(expenseInputSchema) as never,
  });

  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    reset: resetPayment,
    formState: { isSubmitting: isPaymentSubmitting },
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
    setCategoryAmountMode("EXACT");
    resetCategory({
      name: "",
      plannedAmount: 0,
      estimateMin: 0,
      estimateMax: 0,
      color: categoryPalette[0],
      notes: "",
    });
  };

  const resetExpenseForm = () => {
    setSelectedExpense(null);
    resetExpense({
      categoryId: categories[0]?.id ?? "",
      name: "",
      actualAmount: 0,
      dueDate: "",
      notes: "",
    });
  };

  const handleEditCategory = (category: BudgetCategoryView) => {
    setSelectedCategory(category);
    setSelectedCategoryColor(category.color);
    setCategoryAmountMode(getCategoryAmountMode(category));
    resetCategory({
      name: category.name,
      plannedAmount: category.plannedAmount,
      estimateMin: category.estimateMin,
      estimateMax: category.estimateMax,
      color: category.color,
      notes: category.notes,
    });
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
      actualAmount: expense.actualAmount,
      dueDate: expense.dueDate ? expense.dueDate.slice(0, 16) : "",
      notes: expense.notes,
    });
    expenseFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const expensesByCategory = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [
          category.id,
          expenses
            .filter((expense) => expense.categoryId === category.id)
            .sort((left, right) => {
              const leftDate = left.dueDate ?? left.createdAt;
              const rightDate = right.dueDate ?? right.createdAt;
              return leftDate.localeCompare(rightDate);
            }),
        ]),
      ) as Record<string, ExpenseView[]>,
    [categories, expenses],
  );

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
                  Math.max(totals.planned - totals.paid, 0),
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
                  const exactAmount = Number(
                    values.plannedAmount ||
                      values.estimateMax ||
                      values.estimateMin,
                  );
                  const estimateMin = Number(values.estimateMin);
                  const estimateMax = Number(
                    values.estimateMax || values.plannedAmount,
                  );
                  const payload =
                    categoryAmountMode === "EXACT"
                      ? {
                          ...values,
                          plannedAmount: exactAmount,
                          estimateMin: exactAmount,
                          estimateMax: exactAmount,
                        }
                      : {
                          ...values,
                          plannedAmount: estimateMax,
                          estimateMin,
                          estimateMax,
                        };
                  await apiClient<BudgetCategoryView>(
                    selectedCategory ? "/api/budget" : "/api/budget/categories",
                    {
                      method: selectedCategory ? "PATCH" : "POST",
                      body: JSON.stringify({
                        ...payload,
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
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant={
                      categoryAmountMode === "EXACT" ? "default" : "outline"
                    }
                    onClick={() => {
                      const currentValues = getCategoryValues();
                      const exactAmount = Number(
                        currentValues.plannedAmount ||
                          currentValues.estimateMax ||
                          currentValues.estimateMin,
                      );
                      setCategoryAmountMode("EXACT");
                      setCategoryValue("plannedAmount", exactAmount, {
                        shouldDirty: true,
                      });
                      setCategoryValue("estimateMin", exactAmount, {
                        shouldDirty: true,
                      });
                      setCategoryValue("estimateMax", exactAmount, {
                        shouldDirty: true,
                      });
                    }}
                  >
                    {messages.budget.exactAmount}
                  </Button>
                  <Button
                    type="button"
                    variant={
                      categoryAmountMode === "RANGE" ? "default" : "outline"
                    }
                    onClick={() => {
                      const currentValues = getCategoryValues();
                      const fallbackAmount = Number(
                        currentValues.plannedAmount ||
                          currentValues.estimateMax ||
                          currentValues.estimateMin,
                      );
                      setCategoryAmountMode("RANGE");
                      setCategoryValue(
                        "estimateMin",
                        Number(currentValues.estimateMin || fallbackAmount),
                        {
                          shouldDirty: true,
                        },
                      );
                      setCategoryValue(
                        "estimateMax",
                        Number(currentValues.estimateMax || fallbackAmount),
                        {
                          shouldDirty: true,
                        },
                      );
                    }}
                  >
                    {messages.budget.estimateRange}
                  </Button>
                </div>
                {categoryAmountMode === "EXACT" ? (
                  <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                    <span>{messages.budget.planAmount}</span>
                    <Input
                      type="number"
                      step="1"
                      {...registerCategory("plannedAmount", {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError error={categoryErrors.plannedAmount} />
                  </label>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                      <span>{messages.budget.estimateMin}</span>
                      <Input
                        type="number"
                        step="1"
                        {...registerCategory("estimateMin", {
                          valueAsNumber: true,
                        })}
                      />
                    </label>
                    <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                      <span>{messages.budget.estimateMax}</span>
                      <Input
                        type="number"
                        step="1"
                        {...registerCategory("estimateMax", {
                          valueAsNumber: true,
                        })}
                      />
                      <FieldError error={categoryErrors.estimateMax} />
                    </label>
                  </div>
                )}
              </div>
              <div className="rounded-[1.25rem] border border-[var(--color-card-tint)]/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--color-ink)]">
                    {messages.budget.categoryColor}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoryColors((current) => !current)}
                  >
                    {showCategoryColors
                      ? messages.budget.hideColors
                      : messages.budget.showColors}
                  </Button>
                </div>
                {showCategoryColors ? (
                  <div className="mt-4 space-y-3">
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
                          className={`h-9 rounded-xl border ${
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
                ) : (
                  <p className="mt-4 text-sm text-[var(--color-muted-copy)]">
                    {selectedCategoryColor}
                  </p>
                )}
              </div>
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
                  const savedExpense = await apiClient<ExpenseView>(
                    selectedExpense
                      ? `/api/budget/expenses/${selectedExpense.id}`
                      : "/api/budget",
                    {
                      method: selectedExpense ? "PATCH" : "POST",
                      body: JSON.stringify({
                        ...values,
                        actualAmount: Number(values.actualAmount),
                      }),
                    },
                  );

                  setExpenses((current) =>
                    [
                      savedExpense,
                      ...current.filter((item) => item.id !== savedExpense.id),
                    ].sort((left, right) =>
                      right.createdAt.localeCompare(left.createdAt),
                    ),
                  );
                  setExpandedCategoryId(savedExpense.categoryId);
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
              <div className="grid gap-3 sm:grid-cols-2">
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
                <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                  <span>{messages.budget.expenseDueDate}</span>
                  <Input
                    type="datetime-local"
                    {...registerExpense("dueDate")}
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
        </Card>

        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-muted-copy)]">
            {messages.budget.emptyCategories}
          </p>
        ) : null}
        <div className="grid gap-4">
          {categories.map((category) => {
            const categoryExpenses = expensesByCategory[category.id] ?? [];
            const expanded = expandedCategoryId === category.id;

            return (
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
                        {category.estimateMin === category.estimateMax
                          ? messages.budget.plan
                          : messages.budget.estimateRange}
                      </p>
                      <p className="mt-2 text-lg text-[var(--color-ink)]">
                        {formatCategoryAmount(category, locale)}
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
                  <Button
                    variant="outline"
                    className="w-fit"
                    onClick={() =>
                      setExpandedCategoryId((current) =>
                        current === category.id ? null : category.id,
                      )
                    }
                  >
                    {expanded
                      ? messages.guests.cancel
                      : messages.budget.showMore}
                  </Button>
                  {expanded ? (
                    <div className="space-y-3 rounded-[1.5rem] bg-[var(--color-card-tint)]/30 p-4">
                      {categoryExpenses.length === 0 ? (
                        <p className="text-sm text-[var(--color-muted-copy)]">
                          {messages.budget.emptyExpenses}
                        </p>
                      ) : null}
                      {categoryExpenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-medium text-[var(--color-ink)]">
                                {expense.name}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                                {formatCurrency(expense.paidAmount, locale)}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                                {expense.dueDate
                                  ? formatDate(expense.dueDate, locale)
                                  : formatDate(expense.createdAt, locale)}
                              </p>
                              {expense.notes ? (
                                <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                                  {expense.notes}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => handleEditExpense(expense)}
                              >
                                {messages.guests.editButton}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={async () => {
                                  if (
                                    !window.confirm(
                                      messages.common.confirmDelete,
                                    )
                                  ) {
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
                            </div>
                          </div>
                          {expandedExpenseId === expense.id ? (
                            <div className="mt-4 space-y-4 rounded-[1rem] bg-[var(--color-card-tint)]/25 p-4">
                              <div className="space-y-2">
                                {expense.payments.map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="rounded-[1rem] border border-white/70 bg-white/80 p-3"
                                  >
                                    <p className="text-sm font-medium text-[var(--color-ink)]">
                                      {formatCurrency(payment.amount, locale)}
                                    </p>
                                    <p className="text-xs text-[var(--color-muted-copy)]">
                                      {formatDate(payment.paidAt, locale)}
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
                                onSubmit={handlePaymentSubmit(
                                  async (values) => {
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
                                        paidAt: new Date()
                                          .toISOString()
                                          .slice(0, 16),
                                        notes: "",
                                      });
                                    } catch {
                                      toast.error(messages.common.actionError);
                                    }
                                  },
                                )}
                              >
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder={messages.budget.paymentAmount}
                                  {...registerPayment("amount", {
                                    valueAsNumber: true,
                                  })}
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
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
