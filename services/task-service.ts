import { getRepository } from "@/db/repositories";
import type { TaskRecord, UserRole } from "@/lib/planner-domain";
import { taskInputSchema, type TaskInput } from "@/features/tasks/types/task";
import { fromDateTimeLocalValue } from "@/lib/date-time";

const buildTasks = async (): Promise<Array<TaskRecord & { notes: string }>> => {
  const repository = getRepository();
  const [tasks, notes] = await Promise.all([
    repository.listTasks(),
    repository.listNotes(),
  ]);

  return tasks
    .map((task) => ({
      ...task,
      notes:
        notes.find((candidate) => candidate.taskId === task.id)?.content ?? "",
    }))
    .sort((left, right) => {
      const statusOrder = { TODO: 0, IN_PROGRESS: 1, DONE: 2 } as const;
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
      return (
        statusOrder[left.status] - statusOrder[right.status] ||
        left.dueDate.localeCompare(right.dueDate) ||
        priorityOrder[left.priority] - priorityOrder[right.priority]
      );
    });
};

export const listTasks = async (options?: {
  viewerRole?: UserRole;
  assignee?: TaskInput["assignee"];
}): Promise<Array<TaskRecord & { notes: string }>> => {
  const tasks = await buildTasks();

  return tasks.filter((task) => {
    if (options?.viewerRole === "WITNESS" && task.assignee !== "WITNESSES") {
      return false;
    }
    if (options?.assignee && task.assignee !== options.assignee) {
      return false;
    }
    return true;
  });
};

export const createTask = async (
  input: TaskInput,
  options?: { viewerRole?: UserRole },
): Promise<TaskRecord & { notes: string }> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const data = taskInputSchema.parse(input);
  const assignee =
    options?.viewerRole === "WITNESS" ? "WITNESSES" : data.assignee;

  const task = await repository.createTask(
    {
      weddingId: wedding.id,
      title: data.title,
      description: data.description,
      dueDate: fromDateTimeLocalValue(data.dueDate),
      priority: data.priority,
      status: data.status,
      assignee,
    },
    {
      weddingId: wedding.id,
      content: data.notes,
    },
  );

  return (await buildTasks()).find((candidate) => candidate.id === task.id)!;
};

export const updateTask = async (
  taskId: string,
  input: Partial<TaskInput>,
): Promise<TaskRecord & { notes: string }> => {
  const current = (await buildTasks()).find(
    (candidate) => candidate.id === taskId,
  );
  if (!current) {
    throw new Error("Task not found");
  }

  const data = taskInputSchema.parse({
    ...current,
    ...input,
  });

  const repository = getRepository();
  await repository.updateTask(
    taskId,
    {
      title: data.title,
      description: data.description,
      dueDate: fromDateTimeLocalValue(data.dueDate),
      priority: data.priority,
      status: data.status,
      assignee: data.assignee,
    },
    {
      content: data.notes,
    },
  );

  return (await buildTasks()).find((candidate) => candidate.id === taskId)!;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const repository = getRepository();
  await repository.deleteTask(taskId);
};
