"use client";

import type { TaskView } from "@/features/tasks/types/task";

export const useTaskBuckets = (tasks: TaskView[]) => ({
  todo: tasks.filter((task) => task.status === "TODO").length,
  inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
  done: tasks.filter((task) => task.status === "DONE").length,
});
