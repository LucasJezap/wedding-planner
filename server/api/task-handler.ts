import type { TaskInput } from "@/features/tasks/types/task";
import type { UserRole } from "@/lib/planner-domain";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "@/services/task-service";

export const getTasksHandler = async () => listTasks();
export const createTaskHandler = async (
  input: TaskInput,
  viewerRole?: UserRole,
) => createTask(input, { viewerRole });
export const updateTaskHandler = async (
  taskId: string,
  input: Partial<TaskInput>,
) => updateTask(taskId, input);
export const deleteTaskHandler = async (taskId: string) => deleteTask(taskId);
