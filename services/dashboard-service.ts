import type {
  DashboardData,
  TaskAssignee,
  UserRole,
} from "@/lib/planner-domain";
import { getRepository } from "@/db/repositories";
import { getBudgetOverview } from "@/services/budget-service";
import { listGuests } from "@/services/guest-service";
import { listTasks } from "@/services/task-service";
import { listTimelineEvents } from "@/services/timeline-service";
import { listVendors } from "@/services/vendor-service";
import { canViewDashboardTasks } from "@/lib/access-control";

const toIsoDecisionDate = (value: string) => new Date(value).toISOString();

export const getDashboardData = async (options?: {
  viewerRole?: UserRole;
}): Promise<DashboardData> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const [guests, budget, tasks, events, vendors] = await Promise.all([
    listGuests(),
    getBudgetOverview(),
    listTasks({ viewerRole: options?.viewerRole }),
    listTimelineEvents(),
    listVendors(),
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
  const now = Date.now();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const isToday = (value: string) => {
    const timestamp = new Date(value).getTime();
    return (
      timestamp >= startOfToday.getTime() && timestamp <= endOfToday.getTime()
    );
  };
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
  const attentionTasks = visibleTasks
    .filter((task) => task.status !== "DONE")
    .slice()
    .sort((left, right) => {
      const leftOverdue = new Date(left.dueDate).getTime() < now ? 0 : 1;
      const rightOverdue = new Date(right.dueDate).getTime() < now ? 0 : 1;
      return (
        leftOverdue - rightOverdue || left.dueDate.localeCompare(right.dueDate)
      );
    })
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee,
      notes: task.notes,
      isOverdue: new Date(task.dueDate).getTime() < now,
    }));
  const overdueTaskList = visibleTasks
    .filter(
      (task) =>
        task.status !== "DONE" && new Date(task.dueDate).getTime() < now,
    )
    .slice()
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
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
  const pendingRsvps = guests
    .filter((guest) => guest.rsvpStatus === "PENDING")
    .slice(0, 5)
    .map((guest) => ({
      id: guest.id,
      name: guest.fullName,
      side: guest.side,
      invitationGroupName: guest.groupName,
    }));
  const unseatedGuests = guests
    .filter((guest) => !guest.tableId)
    .slice(0, 5)
    .map((guest) => ({
      id: guest.id,
      name: guest.fullName,
      side: guest.side,
      invitationGroupName: guest.groupName,
    }));
  const vendorFollowUps = vendors
    .filter(
      (vendor) =>
        vendor.followUpDate &&
        vendor.status !== "BOOKED" &&
        vendor.status !== "REJECTED",
    )
    .slice()
    .sort((left, right) =>
      left.followUpDate!.localeCompare(right.followUpDate!),
    )
    .slice(0, 5)
    .map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      categoryName: vendor.categoryName,
      status: vendor.status,
      followUpDate: vendor.followUpDate!,
    }));
  const vendorsMissingContact = vendors
    .filter(
      (vendor) =>
        vendor.contactEmail.trim().length === 0 &&
        vendor.contactPhone.trim().length === 0,
    )
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .slice(0, 5)
    .map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      categoryName: vendor.categoryName,
      hasEmail: vendor.contactEmail.trim().length > 0,
      hasPhone: vendor.contactPhone.trim().length > 0,
    }));
  const paymentAlerts = budget.expenses
    .filter((expense) => expense.dueDate && expense.remainingAmount > 0)
    .slice()
    .sort((left, right) => {
      const leftOverdue = left.isOverdue ? 0 : 1;
      const rightOverdue = right.isOverdue ? 0 : 1;
      return (
        leftOverdue - rightOverdue ||
        left.dueDate!.localeCompare(right.dueDate!)
      );
    })
    .slice(0, 5)
    .map((expense) => ({
      id: expense.id,
      name: expense.name,
      vendorName: expense.vendorName,
      dueDate: expense.dueDate!,
      remaining: expense.remainingAmount,
      isOverdue: expense.isOverdue,
    }));
  const upcomingPayments = budget.expenses
    .filter(
      (expense) =>
        expense.dueDate && expense.remainingAmount > 0 && !expense.isOverdue,
    )
    .slice()
    .sort((left, right) => left.dueDate!.localeCompare(right.dueDate!))
    .slice(0, 5)
    .map((expense) => ({
      id: expense.id,
      name: expense.name,
      vendorName: expense.vendorName,
      dueDate: expense.dueDate!,
      remaining: expense.remainingAmount,
    }));
  const overdueTasks = visibleTasks.filter(
    (task) => task.status !== "DONE" && new Date(task.dueDate).getTime() < now,
  ).length;
  const blockedTasks = visibleTasks.filter(
    (task) => task.status !== "DONE" && task.blockedByTaskIds.length > 0,
  ).length;
  const dueVendorFollowUps = vendors.filter(
    (vendor) =>
      vendor.followUpDate &&
      vendor.status !== "BOOKED" &&
      vendor.status !== "REJECTED" &&
      new Date(vendor.followUpDate).getTime() < now,
  ).length;
  const overdueExpenses = budget.expenses.filter(
    (expense) => expense.isOverdue,
  ).length;
  const taskResponsibilityAssignees = Array.from(
    new Set([
      ...visibleTasks.map((task) => task.assignee),
      ...(options?.viewerRole === "ADMIN" || !options?.viewerRole
        ? (["WITNESSES"] as TaskAssignee[])
        : []),
    ]),
  );
  const responsibilityOptions: DashboardData["responsibilityOptions"] = [
    {
      id: "ALL",
      type: "ALL",
      label: "all",
    },
    ...taskResponsibilityAssignees.map((assignee) => ({
      id: `TASK:${assignee}` as const,
      type: "TASK_ASSIGNEE" as const,
      value: assignee,
      label: assignee.toLowerCase(),
    })),
  ];
  const decisionQueue = [
    ...attentionTasks.slice(0, 2).map((task) => ({
      id: `decision-task-${task.id}`,
      title: task.isOverdue
        ? `Domknij zaległe zadanie: ${task.title}`
        : `Ustal kolejny krok dla zadania: ${task.title}`,
      detail: `Termin: ${toIsoDecisionDate(task.dueDate)}`,
      href: `/tasks#task-${task.id}`,
      taskAssignee: task.assignee,
    })),
    ...pendingRsvps.slice(0, 1).map((guest) => ({
      id: `decision-rsvp-${guest.id}`,
      title: `Domknij RSVP dla: ${guest.name}`,
      detail: guest.invitationGroupName
        ? `Grupa: ${guest.invitationGroupName}`
        : "Brak przypisanej grupy zaproszenia",
      href: `/guests#guest-${guest.id}`,
    })),
    ...unseatedGuests.slice(0, 1).map((guest) => ({
      id: `decision-seat-${guest.id}`,
      title: `Przypisz stół dla: ${guest.name}`,
      detail: guest.invitationGroupName
        ? `Grupa: ${guest.invitationGroupName}`
        : "Gość bez grupy zaproszenia",
      href: `/seating#guest-${guest.id}`,
    })),
    ...vendorsMissingContact.slice(0, 1).map((vendor) => ({
      id: `decision-vendor-contact-${vendor.id}`,
      title: `Uzupełnij kontakt do: ${vendor.name}`,
      detail: vendor.categoryName,
      href: `/vendors#vendor-${vendor.id}`,
    })),
    ...paymentAlerts.slice(0, 1).map((expense) => ({
      id: `decision-payment-${expense.id}`,
      title: `Zdecyduj o płatności: ${expense.name}`,
      detail: expense.vendorName
        ? `Vendor: ${expense.vendorName}`
        : "Wydatek bez przypisanego vendora",
      href: `/budget#expense-${expense.id}`,
    })),
  ].slice(0, 6);
  const todayFocus = {
    tasks: visibleTasks
      .filter((task) => task.status !== "DONE" && isToday(task.dueDate))
      .slice(0, 5)
      .map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        href: `/tasks#task-${task.id}`,
      })),
    events: events
      .filter((event) => isToday(event.startsAt))
      .slice(0, 5)
      .map((event) => ({
        id: event.id,
        title: event.title,
        startsAt: event.startsAt,
        href: `/timeline#timeline-${event.id}`,
      })),
    payments: budget.expenses
      .filter((expense) => expense.dueDate && isToday(expense.dueDate))
      .slice(0, 5)
      .map((expense) => ({
        id: expense.id,
        name: expense.name,
        dueDate: expense.dueDate!,
        href: `/budget#expense-${expense.id}`,
      })),
    vendorFollowUps: vendors
      .filter((vendor) => vendor.followUpDate && isToday(vendor.followUpDate))
      .slice(0, 5)
      .map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        followUpDate: vendor.followUpDate!,
        href: `/vendors#vendor-${vendor.id}`,
      })),
  };

  return {
    wedding,
    countdownDays,
    countdownHours,
    viewerRole: options?.viewerRole,
    responsibilityOptions,
    attentionStats: {
      missingRsvp: guests.filter((guest) => guest.rsvpStatus === "PENDING")
        .length,
      unseatedGuests: guests.filter((guest) => !guest.tableId).length,
      overdueTasks,
      vendorFollowUps: dueVendorFollowUps,
      overdueExpenses,
    },
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
      blocked: blockedTasks,
    },
    nextEvents: events.slice(0, 3),
    categorySpend: budget.categories.map((category) => ({
      name: category.name,
      color: category.color,
      planned: category.plannedAmount,
      actual: category.actualAmount,
      remaining: category.remainingAmount,
    })),
    upcomingTasks,
    expenseHighlights,
    pendingRsvps,
    unseatedGuests,
    attentionTasks,
    overdueTasks: overdueTaskList,
    vendorFollowUps,
    vendorsMissingContact,
    paymentAlerts,
    upcomingPayments,
    todayFocus,
    decisionQueue,
    quickActions: [
      { id: "ADD_GUEST", href: "/guests" },
      { id: "ADD_TASK", href: "/tasks" },
      { id: "ADD_EXPENSE", href: "/budget" },
      { id: "ADD_TIMELINE_EVENT", href: "/timeline" },
    ],
  };
};
