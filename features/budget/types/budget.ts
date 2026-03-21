import { z } from "zod";

import type {
  BudgetCategoryView,
  ExpenseView,
  PaymentRecord,
} from "@/lib/planner-domain";

export const budgetCategoryInputSchema = z.object({
  name: z.string().min(1),
  plannedAmount: z.number().min(0),
  color: z.string().min(4).default("#D89BAE"),
  notes: z.string().default(""),
});

export const expenseInputSchema = z
  .object({
    categoryId: z.string().min(1),
    vendorId: z.string().optional().default(""),
    name: z.string().min(1),
    estimateMin: z.number().min(0),
    estimateMax: z.number().min(0),
    actualAmount: z.number().min(0),
    dueDate: z.string().optional().default(""),
    notes: z.string().default(""),
  })
  .refine((value) => value.estimateMax >= value.estimateMin, {
    message: "Estimate max must be greater than or equal to estimate min",
    path: ["estimateMax"],
  });

export const paymentInputSchema = z.object({
  expenseId: z.string().min(1),
  amount: z.number().min(0.01),
  paidAt: z.string().min(1),
  notes: z.string().default(""),
});

export type BudgetCategoryInput = z.infer<typeof budgetCategoryInputSchema>;
export type ExpenseInput = z.input<typeof expenseInputSchema>;
export type PaymentInput = z.infer<typeof paymentInputSchema>;
export type { BudgetCategoryView, ExpenseView, PaymentRecord };
