import { z } from "zod";

import type { TaskRecord } from "@/lib/planner-domain";

export const taskInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assignee: z.enum(["GROOM", "BRIDE", "COUPLE", "WITNESSES"]),
  notes: z.string().default(""),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
export type { TaskRecord };
