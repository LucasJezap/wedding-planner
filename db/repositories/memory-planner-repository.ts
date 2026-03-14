import { createPlannerSeed } from "@/lib/planner-seed";
import type {
  ExpenseRecord,
  GuestRecord,
  PaymentRecord,
  PlannerState,
  RsvpRecord,
  TaskRecord,
  TimelineEventRecord,
  VendorRecord,
} from "@/lib/planner-domain";
import type { PlannerRepository } from "@/db/repositories/planner-repository";

let state = createPlannerSeed();

const createId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const now = (): string => new Date().toISOString();

const updateRecord = <T extends { updatedAt: string }>(
  record: T,
  updates: Partial<Omit<T, "updatedAt">>,
): T => ({
  ...record,
  ...updates,
  updatedAt: now(),
});

const required = <T>(value: T | undefined, label: string): T => {
  if (!value) {
    throw new Error(`${label} not found`);
  }

  return value;
};

export const resetPlannerStore = (): void => {
  state = createPlannerSeed();
};

export const getPlannerState = (): PlannerState => structuredClone(state);

export const memoryPlannerRepository: PlannerRepository = {
  async getState() {
    return getPlannerState();
  },
  async getUserByEmail(email) {
    return state.users.find((user) => user.email === email) ?? null;
  },
  async listUsers() {
    return [...state.users];
  },
  async listUserInvitations() {
    return [...state.userInvitations];
  },
  async createUser(user) {
    const created = {
      ...user,
      id: createId("user"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.users.push(created);
    return created;
  },
  async updateUser(userId, user) {
    const target = required(
      state.users.find((candidate) => candidate.id === userId),
      "User",
    );
    Object.assign(target, updateRecord(target, user));
    return target;
  },
  async createUserInvitation(invitation) {
    const created = {
      ...invitation,
      id: createId("invitation"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.userInvitations = state.userInvitations
      .filter((candidate) => candidate.email !== created.email)
      .concat(created);
    return created;
  },
  async getUserInvitationByToken(token) {
    return (
      state.userInvitations.find((candidate) => candidate.token === token) ??
      null
    );
  },
  async markUserInvitationAccepted(invitationId) {
    const target = required(
      state.userInvitations.find((candidate) => candidate.id === invitationId),
      "Invitation",
    );
    Object.assign(target, updateRecord(target, { acceptedAt: now() }));
    return target;
  },
  async getWedding() {
    return state.wedding;
  },
  async getGuestByRsvpToken(token) {
    return state.guests.find((guest) => guest.rsvpToken === token) ?? null;
  },
  async listGuests() {
    return [...state.guests];
  },
  async listContacts() {
    return [...state.contacts];
  },
  async listNotes() {
    return [...state.notes];
  },
  async listTables() {
    return [...state.weddingTables];
  },
  async listSeats() {
    return [...state.seats];
  },
  async listVendors() {
    return [...state.vendors];
  },
  async listVendorCategories() {
    return [...state.vendorCategories];
  },
  async listBudgetCategories() {
    return [...state.budgetCategories];
  },
  async listExpenses() {
    return [...state.expenses];
  },
  async listPayments() {
    return [...state.payments];
  },
  async listTasks() {
    return [...state.tasks];
  },
  async listTimelineEvents() {
    return [...state.timelineEvents];
  },
  async listRsvps() {
    return [...state.rsvps];
  },
  async createGuest(guest, contact, note) {
    const createdGuest: GuestRecord = {
      ...guest,
      id: createId("guest"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.guests.push(createdGuest);
    state.contacts.push({
      ...contact,
      id: createId("contact"),
      guestId: createdGuest.id,
      createdAt: now(),
      updatedAt: now(),
    });
    state.notes.push({
      ...note,
      id: createId("note"),
      guestId: createdGuest.id,
      createdAt: now(),
      updatedAt: now(),
    });
    return createdGuest;
  },
  async updateGuest(guestId, guest, contact, note) {
    const target = required(
      state.guests.find((candidate) => candidate.id === guestId),
      "Guest",
    );
    Object.assign(target, updateRecord(target, guest));

    const targetContact = required(
      state.contacts.find((candidate) => candidate.guestId === guestId),
      "Guest contact",
    );
    Object.assign(targetContact, updateRecord(targetContact, contact));

    const targetNote = state.notes.find(
      (candidate) => candidate.guestId === guestId,
    );
    if (targetNote) {
      Object.assign(targetNote, updateRecord(targetNote, note));
    }

    return target;
  },
  async deleteGuest(guestId) {
    state.guests = state.guests.filter((guest) => guest.id !== guestId);
    state.contacts = state.contacts.filter(
      (contact) => contact.guestId !== guestId,
    );
    state.notes = state.notes.filter((note) => note.guestId !== guestId);
    state.rsvps = state.rsvps.filter((rsvp) => rsvp.guestId !== guestId);
    state.seats = state.seats.map((seat) =>
      seat.guestId === guestId
        ? updateRecord(seat, { guestId: undefined })
        : seat,
    );
  },
  async createVendor(vendor, contact, note) {
    const createdVendor: VendorRecord = {
      ...vendor,
      id: createId("vendor"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.vendors.push(createdVendor);
    state.contacts.push({
      ...contact,
      id: createId("contact"),
      vendorId: createdVendor.id,
      createdAt: now(),
      updatedAt: now(),
    });
    state.notes.push({
      ...note,
      id: createId("note"),
      vendorId: createdVendor.id,
      createdAt: now(),
      updatedAt: now(),
    });
    return createdVendor;
  },
  async updateVendor(vendorId, vendor, contact, note) {
    const target = required(
      state.vendors.find((candidate) => candidate.id === vendorId),
      "Vendor",
    );
    Object.assign(target, updateRecord(target, vendor));

    const targetContact = required(
      state.contacts.find((candidate) => candidate.vendorId === vendorId),
      "Vendor contact",
    );
    Object.assign(targetContact, updateRecord(targetContact, contact));

    const targetNote = state.notes.find(
      (candidate) => candidate.vendorId === vendorId,
    );
    if (targetNote) {
      Object.assign(targetNote, updateRecord(targetNote, note));
    }

    return target;
  },
  async deleteVendor(vendorId) {
    state.vendors = state.vendors.filter((vendor) => vendor.id !== vendorId);
    state.contacts = state.contacts.filter(
      (contact) => contact.vendorId !== vendorId,
    );
    state.notes = state.notes.filter((note) => note.vendorId !== vendorId);
  },
  async createTask(task, note) {
    const createdTask: TaskRecord = {
      ...task,
      id: createId("task"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.tasks.push(createdTask);
    state.notes.push({
      ...note,
      id: createId("note"),
      taskId: createdTask.id,
      createdAt: now(),
      updatedAt: now(),
    });
    return createdTask;
  },
  async updateTask(taskId, task, note) {
    const target = required(
      state.tasks.find((candidate) => candidate.id === taskId),
      "Task",
    );
    Object.assign(target, updateRecord(target, task));
    const targetNote = state.notes.find(
      (candidate) => candidate.taskId === taskId,
    );
    if (targetNote) {
      Object.assign(targetNote, updateRecord(targetNote, note));
    }
    return target;
  },
  async deleteTask(taskId) {
    state.tasks = state.tasks.filter((task) => task.id !== taskId);
    state.notes = state.notes.filter((note) => note.taskId !== taskId);
  },
  async updateBudgetCategory(categoryId, category) {
    const target = required(
      state.budgetCategories.find((candidate) => candidate.id === categoryId),
      "Budget category",
    );
    Object.assign(target, updateRecord(target, category));
    return target;
  },
  async createBudgetCategory(category) {
    const created = {
      ...category,
      id: createId("budget-category"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.budgetCategories.push(created);
    return created;
  },
  async createExpense(expense) {
    const createdExpense: ExpenseRecord = {
      ...expense,
      id: createId("expense"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.expenses.push(createdExpense);
    return createdExpense;
  },
  async updateExpense(expenseId, expense) {
    const target = required(
      state.expenses.find((candidate) => candidate.id === expenseId),
      "Expense",
    );
    Object.assign(target, updateRecord(target, expense));
    return target;
  },
  async deleteExpense(expenseId) {
    state.expenses = state.expenses.filter(
      (expense) => expense.id !== expenseId,
    );
    state.payments = state.payments.filter(
      (payment) => payment.expenseId !== expenseId,
    );
  },
  async createPayment(payment) {
    const createdPayment: PaymentRecord = {
      ...payment,
      id: createId("payment"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.payments.push(createdPayment);
    return createdPayment;
  },
  async createTimelineEvent(event) {
    const createdEvent: TimelineEventRecord = {
      ...event,
      id: createId("timeline"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.timelineEvents.push(createdEvent);
    return createdEvent;
  },
  async updateTimelineEvent(eventId, event) {
    const target = required(
      state.timelineEvents.find((candidate) => candidate.id === eventId),
      "Timeline event",
    );
    Object.assign(target, updateRecord(target, event));
    return target;
  },
  async deleteTimelineEvent(eventId) {
    state.timelineEvents = state.timelineEvents.filter(
      (event) => event.id !== eventId,
    );
  },
  async assignGuestToSeat(guestId, seatId) {
    state.seats = state.seats.map((seat) =>
      seat.guestId === guestId
        ? updateRecord(seat, { guestId: undefined })
        : seat,
    );
    state.guests = state.guests.map((guest) =>
      guest.id === guestId
        ? updateRecord(guest, { tableId: undefined })
        : guest,
    );

    if (seatId) {
      const seat = required(
        state.seats.find((candidate) => candidate.id === seatId),
        "Seat",
      );
      const existingGuestId = seat.guestId;
      if (existingGuestId) {
        state.guests = state.guests.map((guest) =>
          guest.id === existingGuestId
            ? updateRecord(guest, { tableId: undefined })
            : guest,
        );
      }

      Object.assign(seat, updateRecord(seat, { guestId }));
      const guest = required(
        state.guests.find((candidate) => candidate.id === guestId),
        "Guest",
      );
      Object.assign(guest, updateRecord(guest, { tableId: seat.tableId }));
    }
  },
  async updateTablePosition(tableId, position) {
    const table = required(
      state.weddingTables.find((candidate) => candidate.id === tableId),
      "Table",
    );
    Object.assign(table, updateRecord(table, position));
    return table;
  },
  async upsertRsvp(rsvp) {
    const existing = state.rsvps.find(
      (candidate) => candidate.guestId === rsvp.guestId,
    );
    if (existing) {
      Object.assign(existing, updateRecord(existing, rsvp));
      state.guests = state.guests.map((guest) =>
        guest.id === rsvp.guestId
          ? updateRecord(guest, { rsvpStatus: rsvp.status })
          : guest,
      );
      return existing;
    }

    const created: RsvpRecord = {
      ...rsvp,
      id: createId("rsvp"),
      createdAt: now(),
      updatedAt: now(),
    };
    state.rsvps.push(created);
    state.guests = state.guests.map((guest) =>
      guest.id === rsvp.guestId
        ? updateRecord(guest, { rsvpStatus: rsvp.status })
        : guest,
    );
    return created;
  },
};
