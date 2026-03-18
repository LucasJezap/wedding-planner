import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/db/prisma";
import {
  buildSeatLabel,
  isSyntheticSeatId,
  parseSyntheticSeatId,
  SEATS_PER_TABLE,
} from "@/features/seating/lib/seating-seat";
import type {
  BudgetCategoryRecord,
  ContactRecord,
  ExpenseRecord,
  GuestRecord,
  NoteRecord,
  PaymentRecord,
  PlannerState,
  RsvpRecord,
  SeatRecord,
  TaskRecord,
  TimelineEventRecord,
  UserInvitationRecord,
  UserRecord,
  VendorCategoryRecord,
  VendorRecord,
  WeddingRecord,
  WeddingTableRecord,
} from "@/lib/planner-domain";
import type { PlannerRepository } from "@/db/repositories/planner-repository";

const db = prisma as PrismaClient;

const toUserRecord = (user: {
  id: string;
  weddingId: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}): UserRecord => ({
  id: user.id,
  weddingId: user.weddingId,
  email: user.email,
  name: user.name,
  role: user.role as UserRecord["role"],
  passwordHash: user.passwordHash,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const toUserInvitationRecord = (invitation: {
  id: string;
  weddingId: string;
  email: string;
  role: string;
  token: string;
  acceptedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): UserInvitationRecord => ({
  id: invitation.id,
  weddingId: invitation.weddingId,
  email: invitation.email,
  role: invitation.role as UserInvitationRecord["role"],
  token: invitation.token,
  acceptedAt: invitation.acceptedAt?.toISOString(),
  expiresAt: invitation.expiresAt.toISOString(),
  createdAt: invitation.createdAt.toISOString(),
  updatedAt: invitation.updatedAt.toISOString(),
});

const toWeddingRecord = (wedding: {
  id: string;
  slug: string;
  title: string;
  coupleOneName: string;
  coupleTwoName: string;
  venueName: string;
  venueAddress: string;
  ceremonyDate: Date;
  createdAt: Date;
  updatedAt: Date;
}): WeddingRecord => ({
  id: wedding.id,
  slug: wedding.slug,
  title: wedding.title,
  coupleOneName: wedding.coupleOneName,
  coupleTwoName: wedding.coupleTwoName,
  venueName: wedding.venueName,
  venueAddress: wedding.venueAddress,
  ceremonyDate: wedding.ceremonyDate.toISOString(),
  createdAt: wedding.createdAt.toISOString(),
  updatedAt: wedding.updatedAt.toISOString(),
});

const toGuestRecord = (guest: {
  id: string;
  weddingId: string;
  firstName: string;
  lastName: string;
  side: string;
  rsvpStatus: string;
  rsvpToken: string;
  dietaryRestrictions: string[];
  paymentCoverage: string;
  invitationReceived: boolean;
  transportToVenue: boolean;
  transportFromVenue: boolean;
  tableId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): GuestRecord => ({
  id: guest.id,
  weddingId: guest.weddingId,
  firstName: guest.firstName,
  lastName: guest.lastName,
  side: guest.side as GuestRecord["side"],
  rsvpStatus: guest.rsvpStatus as GuestRecord["rsvpStatus"],
  rsvpToken: guest.rsvpToken,
  dietaryRestrictions: guest.dietaryRestrictions,
  paymentCoverage: guest.paymentCoverage as GuestRecord["paymentCoverage"],
  invitationReceived: guest.invitationReceived,
  transportToVenue: guest.transportToVenue,
  transportFromVenue: guest.transportFromVenue,
  tableId: guest.tableId ?? undefined,
  createdAt: guest.createdAt.toISOString(),
  updatedAt: guest.updatedAt.toISOString(),
});

const toContactRecord = (contact: {
  id: string;
  weddingId: string;
  guestId: string | null;
  vendorId: string | null;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}): ContactRecord => ({
  id: contact.id,
  weddingId: contact.weddingId,
  guestId: contact.guestId ?? undefined,
  vendorId: contact.vendorId ?? undefined,
  email: contact.email,
  phone: contact.phone,
  createdAt: contact.createdAt.toISOString(),
  updatedAt: contact.updatedAt.toISOString(),
});

const toNoteRecord = (note: {
  id: string;
  weddingId: string;
  guestId: string | null;
  vendorId: string | null;
  taskId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}): NoteRecord => ({
  id: note.id,
  weddingId: note.weddingId,
  guestId: note.guestId ?? undefined,
  vendorId: note.vendorId ?? undefined,
  taskId: note.taskId ?? undefined,
  content: note.content,
  createdAt: note.createdAt.toISOString(),
  updatedAt: note.updatedAt.toISOString(),
});

const toWeddingTableRecord = (table: {
  id: string;
  weddingId: string;
  name: string;
  capacity: number;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
}): WeddingTableRecord => ({
  id: table.id,
  weddingId: table.weddingId,
  name: table.name,
  capacity: table.capacity,
  positionX: table.positionX,
  positionY: table.positionY,
  createdAt: table.createdAt.toISOString(),
  updatedAt: table.updatedAt.toISOString(),
});

const toSeatRecord = (seat: {
  id: string;
  weddingId: string;
  tableId: string;
  guestId: string | null;
  label: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}): SeatRecord => ({
  id: seat.id,
  weddingId: seat.weddingId,
  tableId: seat.tableId,
  guestId: seat.guestId ?? undefined,
  label: seat.label,
  position: seat.position,
  createdAt: seat.createdAt.toISOString(),
  updatedAt: seat.updatedAt.toISOString(),
});

const toVendorCategoryRecord = (category: {
  id: string;
  weddingId: string;
  name: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}): VendorCategoryRecord => ({
  id: category.id,
  weddingId: category.weddingId,
  name: category.name,
  type: category.type as VendorCategoryRecord["type"],
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
});

const toVendorRecord = (vendor: {
  id: string;
  weddingId: string;
  categoryId: string;
  name: string;
  cost: { toNumber(): number };
  createdAt: Date;
  updatedAt: Date;
}): VendorRecord => ({
  id: vendor.id,
  weddingId: vendor.weddingId,
  categoryId: vendor.categoryId,
  name: vendor.name,
  cost: vendor.cost.toNumber(),
  createdAt: vendor.createdAt.toISOString(),
  updatedAt: vendor.updatedAt.toISOString(),
});

const toBudgetCategoryRecord = (category: {
  id: string;
  weddingId: string;
  name: string;
  plannedAmount: { toNumber(): number };
  color: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}): BudgetCategoryRecord => ({
  id: category.id,
  weddingId: category.weddingId,
  name: category.name,
  plannedAmount: category.plannedAmount.toNumber(),
  color: category.color,
  notes: category.notes,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
});

const toExpenseRecord = (expense: {
  id: string;
  weddingId: string;
  categoryId: string;
  name: string;
  estimateMin: { toNumber(): number };
  estimateMax: { toNumber(): number };
  actualAmount: { toNumber(): number };
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}): ExpenseRecord => ({
  id: expense.id,
  weddingId: expense.weddingId,
  categoryId: expense.categoryId,
  name: expense.name,
  estimateMin: expense.estimateMin.toNumber(),
  estimateMax: expense.estimateMax.toNumber(),
  actualAmount: expense.actualAmount.toNumber(),
  notes: expense.notes,
  createdAt: expense.createdAt.toISOString(),
  updatedAt: expense.updatedAt.toISOString(),
});

const toPaymentRecord = (payment: {
  id: string;
  weddingId: string;
  expenseId: string;
  amount: { toNumber(): number };
  paidAt: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}): PaymentRecord => ({
  id: payment.id,
  weddingId: payment.weddingId,
  expenseId: payment.expenseId,
  amount: payment.amount.toNumber(),
  paidAt: payment.paidAt.toISOString(),
  notes: payment.notes,
  createdAt: payment.createdAt.toISOString(),
  updatedAt: payment.updatedAt.toISOString(),
});

const toTaskRecord = (task: {
  id: string;
  weddingId: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
  assignee: string;
  createdAt: Date;
  updatedAt: Date;
}): TaskRecord => ({
  id: task.id,
  weddingId: task.weddingId,
  title: task.title,
  description: task.description,
  dueDate: task.dueDate.toISOString(),
  priority: task.priority as TaskRecord["priority"],
  status: task.status as TaskRecord["status"],
  assignee: task.assignee as TaskRecord["assignee"],
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

const toTimelineEventRecord = (event: {
  id: string;
  weddingId: string;
  title: string;
  description: string;
  startsAt: Date;
  location: string;
  visibleToGuests: boolean;
  createdAt: Date;
  updatedAt: Date;
}): TimelineEventRecord => ({
  id: event.id,
  weddingId: event.weddingId,
  title: event.title,
  description: event.description,
  startsAt: event.startsAt.toISOString(),
  location: event.location,
  visibleToGuests: event.visibleToGuests,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
});

const toRsvpRecord = (rsvp: {
  id: string;
  weddingId: string;
  guestId: string;
  status: string;
  guestCount: number;
  createdAt: Date;
  updatedAt: Date;
}): RsvpRecord => ({
  id: rsvp.id,
  weddingId: rsvp.weddingId,
  guestId: rsvp.guestId,
  status: rsvp.status as RsvpRecord["status"],
  guestCount: rsvp.guestCount,
  createdAt: rsvp.createdAt.toISOString(),
  updatedAt: rsvp.updatedAt.toISOString(),
});

const getWeddingOrThrow = async () => db.wedding.findFirstOrThrow();

export const prismaPlannerRepository: PlannerRepository = {
  async getState(): Promise<PlannerState> {
    const [
      users,
      userInvitations,
      wedding,
      guests,
      contacts,
      notes,
      weddingTables,
      seats,
      vendorCategories,
      vendors,
      budgetCategories,
      expenses,
      payments,
      tasks,
      timelineEvents,
      rsvps,
    ] = await Promise.all([
      db.user.findMany(),
      db.userInvitation.findMany(),
      getWeddingOrThrow(),
      db.guest.findMany(),
      db.contact.findMany(),
      db.note.findMany(),
      db.weddingTable.findMany(),
      db.seat.findMany(),
      db.vendorCategory.findMany(),
      db.vendor.findMany(),
      db.budgetCategory.findMany(),
      db.expense.findMany(),
      db.payment.findMany(),
      db.task.findMany(),
      db.timelineEvent.findMany(),
      db.rsvp.findMany(),
    ]);

    return {
      users: users.map(toUserRecord),
      userInvitations: userInvitations.map(toUserInvitationRecord),
      wedding: toWeddingRecord(wedding),
      guests: guests.map(toGuestRecord),
      contacts: contacts.map(toContactRecord),
      notes: notes.map(toNoteRecord),
      weddingTables: weddingTables.map(toWeddingTableRecord),
      seats: seats.map(toSeatRecord),
      vendorCategories: vendorCategories.map(toVendorCategoryRecord),
      vendors: vendors.map(toVendorRecord),
      budgetCategories: budgetCategories.map(toBudgetCategoryRecord),
      expenses: expenses.map(toExpenseRecord),
      payments: payments.map(toPaymentRecord),
      tasks: tasks.map(toTaskRecord),
      timelineEvents: timelineEvents.map(toTimelineEventRecord),
      rsvps: rsvps.map(toRsvpRecord),
    };
  },
  async getUserByEmail(email) {
    const user = await db.user.findUnique({ where: { email } });
    return user ? toUserRecord(user) : null;
  },
  async listUsers() {
    return (await db.user.findMany({ orderBy: { email: "asc" } })).map(
      toUserRecord,
    );
  },
  async listUserInvitations() {
    return (
      await db.userInvitation.findMany({ orderBy: { email: "asc" } })
    ).map(toUserInvitationRecord);
  },
  async createUser(user) {
    return toUserRecord(
      await db.user.create({
        data: {
          weddingId: user.weddingId,
          email: user.email,
          name: user.name,
          role: user.role,
          passwordHash: user.passwordHash,
        },
      }),
    );
  },
  async updateUser(userId, user) {
    return toUserRecord(
      await db.user.update({
        where: { id: userId },
        data: {
          email: user.email,
          name: user.name,
          role: user.role,
          passwordHash: user.passwordHash,
        },
      }),
    );
  },
  async createUserInvitation(invitation) {
    return toUserInvitationRecord(
      await db.userInvitation.upsert({
        where: {
          weddingId_email: {
            weddingId: invitation.weddingId,
            email: invitation.email,
          },
        },
        update: {
          role: invitation.role,
          token: invitation.token,
          acceptedAt: invitation.acceptedAt
            ? new Date(invitation.acceptedAt)
            : null,
          expiresAt: new Date(invitation.expiresAt),
        },
        create: {
          weddingId: invitation.weddingId,
          email: invitation.email,
          role: invitation.role,
          token: invitation.token,
          acceptedAt: invitation.acceptedAt
            ? new Date(invitation.acceptedAt)
            : null,
          expiresAt: new Date(invitation.expiresAt),
        },
      }),
    );
  },
  async getUserInvitationByToken(token) {
    const invitation = await db.userInvitation.findUnique({ where: { token } });
    return invitation ? toUserInvitationRecord(invitation) : null;
  },
  async markUserInvitationAccepted(invitationId) {
    return toUserInvitationRecord(
      await db.userInvitation.update({
        where: { id: invitationId },
        data: { acceptedAt: new Date() },
      }),
    );
  },
  async getWedding() {
    return toWeddingRecord(await getWeddingOrThrow());
  },
  async getGuestByRsvpToken(token) {
    const guest = await db.guest.findUnique({ where: { rsvpToken: token } });
    return guest ? toGuestRecord(guest) : null;
  },
  async listGuests() {
    return (await db.guest.findMany()).map(toGuestRecord);
  },
  async listContacts() {
    return (await db.contact.findMany()).map(toContactRecord);
  },
  async listNotes() {
    return (await db.note.findMany()).map(toNoteRecord);
  },
  async listTables() {
    return (await db.weddingTable.findMany()).map(toWeddingTableRecord);
  },
  async listSeats() {
    return (await db.seat.findMany()).map(toSeatRecord);
  },
  async listVendors() {
    return (await db.vendor.findMany()).map(toVendorRecord);
  },
  async listVendorCategories() {
    return (await db.vendorCategory.findMany()).map(toVendorCategoryRecord);
  },
  async listBudgetCategories() {
    return (await db.budgetCategory.findMany()).map(toBudgetCategoryRecord);
  },
  async listExpenses() {
    return (await db.expense.findMany()).map(toExpenseRecord);
  },
  async listPayments() {
    return (await db.payment.findMany({ orderBy: { paidAt: "desc" } })).map(
      toPaymentRecord,
    );
  },
  async listTasks() {
    return (await db.task.findMany()).map(toTaskRecord);
  },
  async listTimelineEvents() {
    return (await db.timelineEvent.findMany()).map(toTimelineEventRecord);
  },
  async listRsvps() {
    return (await db.rsvp.findMany()).map(toRsvpRecord);
  },
  async createGuest(guest, contact, note) {
    const created = await db.guest.create({
      data: {
        weddingId: guest.weddingId,
        firstName: guest.firstName,
        lastName: guest.lastName,
        side: guest.side,
        rsvpStatus: guest.rsvpStatus,
        rsvpToken: guest.rsvpToken,
        dietaryRestrictions: guest.dietaryRestrictions,
        paymentCoverage: guest.paymentCoverage,
        invitationReceived: guest.invitationReceived,
        transportToVenue: guest.transportToVenue,
        transportFromVenue: guest.transportFromVenue,
        tableId: guest.tableId,
      },
    });

    await db.contact.create({
      data: {
        weddingId: contact.weddingId,
        guestId: created.id,
        email: contact.email,
        phone: contact.phone,
      },
    });

    await db.note.create({
      data: {
        weddingId: note.weddingId,
        guestId: created.id,
        content: note.content,
      },
    });

    return toGuestRecord(created);
  },
  async updateGuest(guestId, guest, contact, note) {
    const updated = await db.guest.update({
      where: { id: guestId },
      data: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        side: guest.side,
        rsvpStatus: guest.rsvpStatus,
        rsvpToken: guest.rsvpToken,
        dietaryRestrictions: guest.dietaryRestrictions,
        paymentCoverage: guest.paymentCoverage,
        invitationReceived: guest.invitationReceived,
        transportToVenue: guest.transportToVenue,
        transportFromVenue: guest.transportFromVenue,
        tableId: guest.tableId,
      },
    });

    await db.contact.upsert({
      where: { guestId },
      update: {
        email: contact.email,
        phone: contact.phone,
      },
      create: {
        weddingId: updated.weddingId,
        guestId,
        email: contact.email ?? "",
        phone: contact.phone ?? "",
      },
    });

    await db.note.upsert({
      where: { guestId },
      update: {
        content: note.content,
      },
      create: {
        weddingId: updated.weddingId,
        guestId,
        content: note.content ?? "",
      },
    });

    return toGuestRecord(updated);
  },
  async deleteGuest(guestId) {
    await db.$transaction([
      db.seat.updateMany({ where: { guestId }, data: { guestId: null } }),
      db.contact.deleteMany({ where: { guestId } }),
      db.note.deleteMany({ where: { guestId } }),
      db.rsvp.deleteMany({ where: { guestId } }),
      db.guest.delete({ where: { id: guestId } }),
    ]);
  },
  async createVendor(vendor, contact, note) {
    const created = await db.vendor.create({
      data: {
        weddingId: vendor.weddingId,
        categoryId: vendor.categoryId,
        name: vendor.name,
        cost: vendor.cost,
      },
    });

    await db.contact.create({
      data: {
        weddingId: contact.weddingId,
        vendorId: created.id,
        email: contact.email,
        phone: contact.phone,
      },
    });

    await db.note.create({
      data: {
        weddingId: note.weddingId,
        vendorId: created.id,
        content: note.content,
      },
    });

    return toVendorRecord(created);
  },
  async updateVendor(vendorId, vendor, contact, note) {
    const updated = await db.vendor.update({
      where: { id: vendorId },
      data: {
        categoryId: vendor.categoryId,
        name: vendor.name,
        cost: vendor.cost,
      },
    });

    await db.contact.upsert({
      where: { vendorId },
      update: {
        email: contact.email,
        phone: contact.phone,
      },
      create: {
        weddingId: updated.weddingId,
        vendorId,
        email: contact.email ?? "",
        phone: contact.phone ?? "",
      },
    });

    await db.note.upsert({
      where: { vendorId },
      update: {
        content: note.content,
      },
      create: {
        weddingId: updated.weddingId,
        vendorId,
        content: note.content ?? "",
      },
    });

    return toVendorRecord(updated);
  },
  async deleteVendor(vendorId) {
    await db.$transaction([
      db.contact.deleteMany({ where: { vendorId } }),
      db.note.deleteMany({ where: { vendorId } }),
      db.vendor.delete({ where: { id: vendorId } }),
    ]);
  },
  async createTask(task, note) {
    const created = await db.task.create({
      data: {
        weddingId: task.weddingId,
        title: task.title,
        description: task.description,
        dueDate: new Date(task.dueDate),
        priority: task.priority,
        status: task.status,
        assignee: task.assignee,
      },
    });

    await db.note.create({
      data: {
        weddingId: note.weddingId,
        taskId: created.id,
        content: note.content,
      },
    });

    return toTaskRecord(created);
  },
  async updateTask(taskId, task, note) {
    const updated = await db.task.update({
      where: { id: taskId },
      data: {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        priority: task.priority,
        status: task.status,
        assignee: task.assignee,
      },
    });

    await db.note.upsert({
      where: { taskId },
      update: {
        content: note.content,
      },
      create: {
        weddingId: updated.weddingId,
        taskId,
        content: note.content ?? "",
      },
    });

    return toTaskRecord(updated);
  },
  async deleteTask(taskId) {
    await db.$transaction([
      db.note.deleteMany({ where: { taskId } }),
      db.task.delete({ where: { id: taskId } }),
    ]);
  },
  async updateBudgetCategory(categoryId, category) {
    const updated = await db.budgetCategory.update({
      where: { id: categoryId },
      data: {
        name: category.name,
        plannedAmount: category.plannedAmount,
        color: category.color,
        notes: category.notes,
      },
    });

    return toBudgetCategoryRecord(updated);
  },
  async createBudgetCategory(category) {
    return toBudgetCategoryRecord(
      await db.budgetCategory.create({
        data: {
          weddingId: category.weddingId,
          name: category.name,
          plannedAmount: category.plannedAmount,
          color: category.color,
          notes: category.notes,
        },
      }),
    );
  },
  async deleteBudgetCategory(categoryId) {
    const expenses = await db.expense.findMany({
      where: { categoryId },
      select: { id: true },
    });
    const expenseIds = expenses.map((expense) => expense.id);

    await db.$transaction([
      db.payment.deleteMany({ where: { expenseId: { in: expenseIds } } }),
      db.expense.deleteMany({ where: { categoryId } }),
      db.budgetCategory.delete({ where: { id: categoryId } }),
    ]);
  },
  async createExpense(expense) {
    return toExpenseRecord(
      await db.expense.create({
        data: {
          weddingId: expense.weddingId,
          categoryId: expense.categoryId,
          name: expense.name,
          estimateMin: expense.estimateMin,
          estimateMax: expense.estimateMax,
          actualAmount: expense.actualAmount,
          notes: expense.notes,
        },
      }),
    );
  },
  async updateExpense(expenseId, expense) {
    return toExpenseRecord(
      await db.expense.update({
        where: { id: expenseId },
        data: {
          categoryId: expense.categoryId,
          name: expense.name,
          estimateMin: expense.estimateMin,
          estimateMax: expense.estimateMax,
          actualAmount: expense.actualAmount,
          notes: expense.notes,
        },
      }),
    );
  },
  async deleteExpense(expenseId) {
    await db.$transaction([
      db.payment.deleteMany({ where: { expenseId } }),
      db.expense.delete({ where: { id: expenseId } }),
    ]);
  },
  async createPayment(payment) {
    return toPaymentRecord(
      await db.payment.create({
        data: {
          weddingId: payment.weddingId,
          expenseId: payment.expenseId,
          amount: payment.amount,
          paidAt: new Date(payment.paidAt),
          notes: payment.notes,
        },
      }),
    );
  },
  async createTimelineEvent(event) {
    return toTimelineEventRecord(
      await db.timelineEvent.create({
        data: {
          weddingId: event.weddingId,
          title: event.title,
          description: event.description,
          startsAt: new Date(event.startsAt),
          location: event.location,
          visibleToGuests: event.visibleToGuests,
        },
      }),
    );
  },
  async updateTimelineEvent(eventId, event) {
    return toTimelineEventRecord(
      await db.timelineEvent.update({
        where: { id: eventId },
        data: {
          title: event.title,
          description: event.description,
          startsAt: event.startsAt ? new Date(event.startsAt) : undefined,
          location: event.location,
          visibleToGuests: event.visibleToGuests,
        },
      }),
    );
  },
  async deleteTimelineEvent(eventId) {
    await db.timelineEvent.delete({ where: { id: eventId } });
  },
  async assignGuestToSeat(guestId, seatId) {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      if (!seatId) {
        await tx.seat.updateMany({
          where: { guestId },
          data: { guestId: null },
        });
        await tx.guest.update({
          where: { id: guestId },
          data: { tableId: null },
        });
        return;
      }

      const sourceSeat = await tx.seat.findFirst({
        where: { guestId },
      });
      const seat =
        (await tx.seat.findUnique({
          where: { id: seatId },
        })) ??
        (async () => {
          if (!isSyntheticSeatId(seatId)) {
            return null;
          }

          const parsedSeat = parseSyntheticSeatId(seatId);
          if (!parsedSeat) {
            return null;
          }

          const table = await tx.weddingTable.findUniqueOrThrow({
            where: { id: parsedSeat.tableId },
          });

          return tx.seat.create({
            data: {
              weddingId: table.weddingId,
              tableId: table.id,
              label: buildSeatLabel(parsedSeat.position),
              position: parsedSeat.position,
            },
          });
        })();
      const targetSeat = await seat;
      if (!targetSeat) {
        throw new Error("Seat not found");
      }
      if (sourceSeat?.id === targetSeat.id) {
        return;
      }

      const targetGuestId = targetSeat.guestId;

      await tx.seat.update({
        where: { id: targetSeat.id },
        data: { guestId: null },
      });

      if (sourceSeat) {
        await tx.seat.update({
          where: { id: sourceSeat.id },
          data: { guestId: null },
        });
      }

      if (targetGuestId) {
        await tx.guest.update({
          where: { id: targetGuestId },
          data: { tableId: sourceSeat?.tableId ?? null },
        });
        if (sourceSeat) {
          await tx.seat.update({
            where: { id: sourceSeat.id },
            data: { guestId: targetGuestId },
          });
        }
      }

      await tx.seat.update({
        where: { id: targetSeat.id },
        data: { guestId },
      });

      await tx.guest.update({
        where: { id: guestId },
        data: { tableId: targetSeat.tableId },
      });
    });
  },
  async updateTablePosition(tableId, position) {
    return toWeddingTableRecord(
      await db.weddingTable.update({
        where: { id: tableId },
        data: {
          positionX: position.positionX,
          positionY: position.positionY,
        },
      }),
    );
  },
  async swapTableAssignments(sourceTableId, targetTableId) {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const sourceTable = await tx.weddingTable.findUniqueOrThrow({
        where: { id: sourceTableId },
      });
      const targetTable = await tx.weddingTable.findUniqueOrThrow({
        where: { id: targetTableId },
      });
      const seatPairs: Array<{
        sourceSeatId: string;
        targetSeatId: string;
        sourceGuestId: string | null;
        targetGuestId: string | null;
      }> = [];

      for (let position = 1; position <= SEATS_PER_TABLE; position += 1) {
        const sourceSeat =
          (await tx.seat.findFirst({
            where: { tableId: sourceTableId, position },
          })) ??
          (await tx.seat.create({
            data: {
              weddingId: sourceTable.weddingId,
              tableId: sourceTableId,
              label: buildSeatLabel(position),
              position,
            },
          }));
        const targetSeat =
          (await tx.seat.findFirst({
            where: { tableId: targetTableId, position },
          })) ??
          (await tx.seat.create({
            data: {
              weddingId: targetTable.weddingId,
              tableId: targetTableId,
              label: buildSeatLabel(position),
              position,
            },
          }));

        seatPairs.push({
          sourceSeatId: sourceSeat.id,
          targetSeatId: targetSeat.id,
          sourceGuestId: sourceSeat.guestId,
          targetGuestId: targetSeat.guestId,
        });
      }

      await tx.seat.updateMany({
        where: {
          id: {
            in: seatPairs.flatMap((pair) => [
              pair.sourceSeatId,
              pair.targetSeatId,
            ]),
          },
        },
        data: { guestId: null },
      });

      for (const pair of seatPairs) {
        await tx.seat.update({
          where: { id: pair.sourceSeatId },
          data: { guestId: pair.targetGuestId },
        });
        await tx.seat.update({
          where: { id: pair.targetSeatId },
          data: { guestId: pair.sourceGuestId },
        });

        if (pair.sourceGuestId) {
          await tx.guest.update({
            where: { id: pair.sourceGuestId },
            data: { tableId: targetTableId },
          });
        }
        if (pair.targetGuestId) {
          await tx.guest.update({
            where: { id: pair.targetGuestId },
            data: { tableId: sourceTableId },
          });
        }
      }
    });
  },
  async upsertRsvp(rsvp) {
    const record = await db.rsvp.upsert({
      where: { guestId: rsvp.guestId },
      update: {
        status: rsvp.status,
        guestCount: rsvp.guestCount,
      },
      create: {
        weddingId: rsvp.weddingId,
        guestId: rsvp.guestId,
        status: rsvp.status,
        guestCount: rsvp.guestCount,
      },
    });

    await db.guest.update({
      where: { id: rsvp.guestId },
      data: { rsvpStatus: rsvp.status },
    });

    return toRsvpRecord(record);
  },
};
