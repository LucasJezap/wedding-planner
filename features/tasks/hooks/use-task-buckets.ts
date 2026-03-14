"use client";

import type { TaskRecord } from "@/lib/planner-domain";

export const useTaskBuckets = (
  tasks: Array<TaskRecord & { notes: string }>,
) => ({
  todo: tasks.filter((task) => task.status === "TODO").length,
  inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
  done: tasks.filter((task) => task.status === "DONE").length,
});
