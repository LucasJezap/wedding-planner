import { z } from "zod";

import type { TaskChecklistItemRecord, TaskView } from "@/lib/planner-domain";

export const taskChecklistItemInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1),
  completed: z.boolean().default(false),
});

export const taskInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assignee: z.enum(["GROOM", "BRIDE", "COUPLE", "WITNESSES"]),
  tags: z.array(z.string().trim().min(1)).default([]),
  blockedByTaskIds: z.array(z.string()).default([]),
  notes: z.string().default(""),
  checklistItems: z.array(taskChecklistItemInputSchema).default([]),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
export type TaskChecklistItemInput = z.infer<
  typeof taskChecklistItemInputSchema
>;
export type { TaskChecklistItemRecord, TaskView };
