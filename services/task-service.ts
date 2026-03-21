import { getRepository } from "@/db/repositories";
import type { TaskView, UserRole } from "@/lib/planner-domain";
import { taskInputSchema, type TaskInput } from "@/features/tasks/types/task";
import { fromDateTimeLocalValue } from "@/lib/date-time";
import { isWitnessScopedTaskViewer } from "@/lib/access-control";

const buildTasks = async (): Promise<TaskView[]> => {
  const repository = getRepository();
  const [tasks, notes, checklistItems] = await Promise.all([
    repository.listTasks(),
    repository.listNotes(),
    repository.listTaskChecklistItems(),
  ]);

  return tasks
    .map((task) => ({
      ...task,
      notes:
        notes.find((candidate) => candidate.taskId === task.id)?.content ?? "",
      checklistItems: checklistItems
        .filter((candidate) => candidate.taskId === task.id)
        .sort((left, right) => left.sortOrder - right.sortOrder),
      blockedByTaskTitles: task.blockedByTaskIds
        .map(
          (blockedTaskId) =>
            tasks.find((candidate) => candidate.id === blockedTaskId)?.title,
        )
        .filter((title): title is string => Boolean(title)),
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
}): Promise<TaskView[]> => {
  const tasks = await buildTasks();

  return tasks.filter((task) => {
    if (
      isWitnessScopedTaskViewer(options?.viewerRole) &&
      task.assignee !== "WITNESSES"
    ) {
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
): Promise<TaskView> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const data = taskInputSchema.parse(input);
  const assignee = isWitnessScopedTaskViewer(options?.viewerRole)
    ? "WITNESSES"
    : data.assignee;
  const allTasks = await repository.listTasks();
  const normalizedBlockedByTaskIds = data.blockedByTaskIds.filter(
    (blockedTaskId) => allTasks.some((task) => task.id === blockedTaskId),
  );

  const task = await repository.createTask(
    {
      weddingId: wedding.id,
      title: data.title,
      description: data.description,
      dueDate: fromDateTimeLocalValue(data.dueDate),
      priority: data.priority,
      status: data.status,
      assignee,
      tags: data.tags,
      blockedByTaskIds: normalizedBlockedByTaskIds,
    },
    {
      weddingId: wedding.id,
      content: data.notes,
    },
    data.checklistItems.map((item) => ({
      weddingId: wedding.id,
      title: item.title,
      completed: item.completed,
      sortOrder: 0,
    })),
  );

  return (await buildTasks()).find((candidate) => candidate.id === task.id)!;
};

export const updateTask = async (
  taskId: string,
  input: Partial<TaskInput>,
): Promise<TaskView> => {
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
  const allTasks = await repository.listTasks();
  const normalizedBlockedByTaskIds = data.blockedByTaskIds.filter(
    (blockedTaskId) =>
      blockedTaskId !== taskId &&
      allTasks.some((task) => task.id === blockedTaskId),
  );
  await repository.updateTask(
    taskId,
    {
      title: data.title,
      description: data.description,
      dueDate: fromDateTimeLocalValue(data.dueDate),
      priority: data.priority,
      status: data.status,
      assignee: data.assignee,
      tags: data.tags,
      blockedByTaskIds: normalizedBlockedByTaskIds,
    },
    {
      content: data.notes,
    },
    data.checklistItems.map((item) => ({
      weddingId: current.weddingId,
      title: item.title,
      completed: item.completed,
      sortOrder: 0,
    })),
  );

  return (await buildTasks()).find((candidate) => candidate.id === taskId)!;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const repository = getRepository();
  await repository.deleteTask(taskId);
};
