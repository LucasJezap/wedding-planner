import type { DashboardData, UserRole } from "@/lib/planner-domain";
import { getRepository } from "@/db/repositories";
import { getBudgetOverview } from "@/services/budget-service";
import { listGuests } from "@/services/guest-service";
import { listTasks } from "@/services/task-service";
import { listTimelineEvents } from "@/services/timeline-service";
import { canViewDashboardTasks } from "@/lib/access-control";

export const getDashboardData = async (options?: {
  viewerRole?: UserRole;
}): Promise<DashboardData> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const [guests, budget, tasks, events] = await Promise.all([
    listGuests(),
    getBudgetOverview(),
    listTasks({ viewerRole: options?.viewerRole }),
    listTimelineEvents(),
  ]);

  const firstTimelineEvent = events[0]?.startsAt ?? wedding.ceremonyDate;
  const ceremonyDate = new Date(firstTimelineEvent).getTime();
  const currentDate = Date.now();
  const countdownMs = Math.max(0, ceremonyDate - currentDate);
  const countdownDays = Math.floor(countdownMs / (1000 * 60 * 60 * 24));
  const countdownHours = Math.floor(
    (countdownMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  const planned = budget.categories.reduce(
    (sum, category) => sum + category.plannedAmount,
    0,
  );
  const actual = budget.expenses.reduce(
    (sum, expense) => sum + expense.actualAmount,
    0,
  );
  const visibleTasks = canViewDashboardTasks(options?.viewerRole ?? "ADMIN")
    ? tasks
    : [];
  const upcomingTasks = visibleTasks
    .filter((task) => task.status !== "DONE")
    .slice()
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, 6)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee,
      notes: task.notes,
    }));
  const expenseHighlights = budget.expenses
    .map((expense) => ({
      id: expense.id,
      name: expense.name,
      planned: expense.estimateMax,
      actual: expense.actualAmount,
      remaining: expense.remainingAmount,
    }))
    .sort((left, right) => right.planned - left.planned);

  return {
    wedding,
    countdownDays,
    countdownHours,
    viewerRole: options?.viewerRole,
    guestStats: {
      total: guests.length,
      attending: guests.filter((guest) => guest.rsvpStatus === "ATTENDING")
        .length,
      pending: guests.filter((guest) => guest.rsvpStatus === "PENDING").length,
      declined: guests.filter((guest) => guest.rsvpStatus === "DECLINED")
        .length,
    },
    budgetStats: {
      planned,
      actual,
      remaining: planned - actual,
    },
    taskStats: {
      total: visibleTasks.length,
      done: visibleTasks.filter((task) => task.status === "DONE").length,
      inProgress: visibleTasks.filter((task) => task.status === "IN_PROGRESS")
        .length,
      todo: visibleTasks.filter((task) => task.status === "TODO").length,
    },
    nextEvents: events.slice(0, 3),
    categorySpend: budget.categories.map((category) => ({
      name: category.name,
      planned: category.plannedAmount,
      actual: category.actualAmount,
      remaining: category.remainingAmount,
    })),
    upcomingTasks,
    expenseHighlights,
  };
};
