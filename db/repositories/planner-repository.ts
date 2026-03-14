import type {
  BudgetCategoryRecord,
  ContactRecord,
  ExpenseRecord,
  GuestRecord,
  NoteRecord,
  PaymentRecord,
  PlannerState,
  RsvpRecord,
  TaskRecord,
  TimelineEventRecord,
  UserInvitationRecord,
  UserRecord,
  VendorCategoryRecord,
  VendorRecord,
  WeddingRecord,
  WeddingTableRecord,
  SeatRecord,
} from "@/lib/planner-domain";

export type PlannerRepository = {
  getState(): Promise<PlannerState>;
  getUserByEmail(email: string): Promise<UserRecord | null>;
  listUsers(): Promise<UserRecord[]>;
  listUserInvitations(): Promise<UserInvitationRecord[]>;
  createUser(
    user: Omit<UserRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<UserRecord>;
  createUserInvitation(
    invitation: Omit<UserInvitationRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<UserInvitationRecord>;
  getUserInvitationByToken(token: string): Promise<UserInvitationRecord | null>;
  markUserInvitationAccepted(
    invitationId: string,
  ): Promise<UserInvitationRecord>;
  updateUser(
    userId: string,
    user: Partial<
      Omit<UserRecord, "id" | "weddingId" | "createdAt" | "updatedAt">
    >,
  ): Promise<UserRecord>;
  getWedding(): Promise<WeddingRecord>;
  getGuestByRsvpToken(token: string): Promise<GuestRecord | null>;
  listGuests(): Promise<GuestRecord[]>;
  listContacts(): Promise<ContactRecord[]>;
  listNotes(): Promise<NoteRecord[]>;
  listTables(): Promise<WeddingTableRecord[]>;
  listSeats(): Promise<SeatRecord[]>;
  listVendors(): Promise<VendorRecord[]>;
  listVendorCategories(): Promise<VendorCategoryRecord[]>;
  listBudgetCategories(): Promise<BudgetCategoryRecord[]>;
  listExpenses(): Promise<ExpenseRecord[]>;
  listPayments(): Promise<PaymentRecord[]>;
  listTasks(): Promise<TaskRecord[]>;
  listTimelineEvents(): Promise<TimelineEventRecord[]>;
  listRsvps(): Promise<RsvpRecord[]>;
  createGuest(
    guest: Omit<GuestRecord, "id" | "createdAt" | "updatedAt">,
    contact: Omit<ContactRecord, "id" | "createdAt" | "updatedAt">,
    note: Omit<NoteRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<GuestRecord>;
  updateGuest(
    guestId: string,
    guest: Partial<
      Omit<GuestRecord, "id" | "weddingId" | "createdAt" | "updatedAt">
    >,
    contact: Partial<
      Omit<
        ContactRecord,
        "id" | "weddingId" | "guestId" | "createdAt" | "updatedAt"
      >
    >,
    note: Partial<
      Omit<
        NoteRecord,
        "id" | "weddingId" | "guestId" | "createdAt" | "updatedAt"
      >
    >,
  ): Promise<GuestRecord>;
  deleteGuest(guestId: string): Promise<void>;
  createVendor(
    vendor: Omit<VendorRecord, "id" | "createdAt" | "updatedAt">,
    contact: Omit<ContactRecord, "id" | "createdAt" | "updatedAt">,
    note: Omit<NoteRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<VendorRecord>;
  updateVendor(
    vendorId: string,
    vendor: Partial<
      Omit<VendorRecord, "id" | "weddingId" | "createdAt" | "updatedAt">
    >,
    contact: Partial<
      Omit<
        ContactRecord,
        "id" | "weddingId" | "vendorId" | "createdAt" | "updatedAt"
      >
    >,
    note: Partial<
      Omit<
        NoteRecord,
        "id" | "weddingId" | "vendorId" | "createdAt" | "updatedAt"
      >
    >,
  ): Promise<VendorRecord>;
  deleteVendor(vendorId: string): Promise<void>;
  createTask(
    task: Omit<TaskRecord, "id" | "createdAt" | "updatedAt">,
    note: Omit<NoteRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<TaskRecord>;
  updateTask(
    taskId: string,
    task: Partial<
      Omit<TaskRecord, "id" | "weddingId" | "createdAt" | "updatedAt">
    >,
    note: Partial<
      Omit<
        NoteRecord,
        "id" | "weddingId" | "taskId" | "createdAt" | "updatedAt"
      >
    >,
  ): Promise<TaskRecord>;
  deleteTask(taskId: string): Promise<void>;
  updateBudgetCategory(
    categoryId: string,
    category: Partial<
      Omit<BudgetCategoryRecord, "id" | "weddingId" | "createdAt" | "updatedAt">
    >,
  ): Promise<BudgetCategoryRecord>;
  createBudgetCategory(
    category: Omit<BudgetCategoryRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<BudgetCategoryRecord>;
  createExpense(
    expense: Omit<ExpenseRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<ExpenseRecord>;
  updateExpense(
    expenseId: string,
    expense: Partial<
      Omit<ExpenseRecord, "id" | "weddingId" | "createdAt" | "updatedAt">
    >,
  ): Promise<ExpenseRecord>;
  deleteExpense(expenseId: string): Promise<void>;
  createPayment(
    payment: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<PaymentRecord>;
  createTimelineEvent(
    event: Omit<TimelineEventRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<TimelineEventRecord>;
  updateTimelineEvent(
    eventId: string,
    event: Partial<
      Omit<TimelineEventRecord, "id" | "weddingId" | "createdAt" | "updatedAt">
    >,
  ): Promise<TimelineEventRecord>;
  deleteTimelineEvent(eventId: string): Promise<void>;
  assignGuestToSeat(guestId: string, seatId?: string): Promise<void>;
  updateTablePosition(
    tableId: string,
    position: { positionX: number; positionY: number },
  ): Promise<WeddingTableRecord>;
  upsertRsvp(
    rsvp: Omit<RsvpRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<RsvpRecord>;
};
