export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type UserRole = "ADMIN" | "WITNESS" | "READ_ONLY";
export type GuestSide = "BRIDE" | "GROOM" | "FAMILY" | "FRIENDS";
export type RsvpStatus = "PENDING" | "ATTENDING" | "DECLINED";
export type PaymentCoverage = "FULL" | "HALF";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskAssignee = "GROOM" | "BRIDE" | "COUPLE" | "WITNESSES";
export type VendorCategoryType =
  | "VENUE"
  | "CATERING"
  | "MUSIC"
  | "PHOTO"
  | "FLORAL"
  | "WEDDING_PLANNER"
  | "CONTENT_CREATOR"
  | "MAKEUP"
  | "HAIR"
  | "PRIEST"
  | "ATTIRE"
  | "TRANSPORT"
  | "OTHER";

export type UserRecord = {
  id: string;
  weddingId: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type UserInvitationRecord = {
  id: string;
  weddingId: string;
  email: string;
  role: UserRole;
  token: string;
  acceptedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type WeddingRecord = {
  id: string;
  slug: string;
  title: string;
  coupleOneName: string;
  coupleTwoName: string;
  venueName: string;
  venueAddress: string;
  ceremonyDate: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactRecord = {
  id: string;
  weddingId: string;
  guestId?: string;
  vendorId?: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteRecord = {
  id: string;
  weddingId: string;
  guestId?: string;
  vendorId?: string;
  taskId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type GuestRecord = {
  id: string;
  weddingId: string;
  firstName: string;
  lastName: string;
  side: GuestSide;
  rsvpStatus: RsvpStatus;
  rsvpToken: string;
  dietaryRestrictions: string[];
  paymentCoverage: PaymentCoverage;
  invitationReceived: boolean;
  transportToVenue: boolean;
  transportFromVenue: boolean;
  tableId?: string;
  createdAt: string;
  updatedAt: string;
};

export type VendorCategoryRecord = {
  id: string;
  weddingId: string;
  name: string;
  type: VendorCategoryType;
  createdAt: string;
  updatedAt: string;
};

export type VendorRecord = {
  id: string;
  weddingId: string;
  categoryId: string;
  name: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
};

export type BudgetCategoryRecord = {
  id: string;
  weddingId: string;
  name: string;
  plannedAmount: number;
  color: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseRecord = {
  id: string;
  weddingId: string;
  categoryId: string;
  name: string;
  estimateMin: number;
  estimateMax: number;
  actualAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  weddingId: string;
  expenseId: string;
  amount: number;
  paidAt: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskRecord = {
  id: string;
  weddingId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: TaskAssignee;
  createdAt: string;
  updatedAt: string;
};

export type TimelineEventRecord = {
  id: string;
  weddingId: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  visibleToGuests: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WeddingTableRecord = {
  id: string;
  weddingId: string;
  name: string;
  capacity: number;
  positionX: number;
  positionY: number;
  createdAt: string;
  updatedAt: string;
};

export type SeatRecord = {
  id: string;
  weddingId: string;
  tableId: string;
  guestId?: string;
  label: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type RsvpRecord = {
  id: string;
  weddingId: string;
  guestId: string;
  status: RsvpStatus;
  guestCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PlannerState = {
  users: UserRecord[];
  userInvitations: UserInvitationRecord[];
  wedding: WeddingRecord;
  guests: GuestRecord[];
  contacts: ContactRecord[];
  notes: NoteRecord[];
  weddingTables: WeddingTableRecord[];
  seats: SeatRecord[];
  vendorCategories: VendorCategoryRecord[];
  vendors: VendorRecord[];
  budgetCategories: BudgetCategoryRecord[];
  expenses: ExpenseRecord[];
  payments: PaymentRecord[];
  tasks: TaskRecord[];
  timelineEvents: TimelineEventRecord[];
  rsvps: RsvpRecord[];
};

export type GuestView = GuestRecord & {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  tableName?: string;
};

export type VendorView = VendorRecord & {
  categoryName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

export type BudgetCategoryView = BudgetCategoryRecord & {
  paidAmount: number;
  estimatedAmount: number;
  actualAmount: number;
  remainingAmount: number;
};

export type ExpenseView = ExpenseRecord & {
  categoryName: string;
  categoryColor: string;
  paidAmount: number;
  remainingAmount: number;
  payments: PaymentRecord[];
};

export type DashboardData = {
  wedding: WeddingRecord;
  countdownDays: number;
  countdownHours: number;
  viewerRole?: UserRole;
  guestStats: {
    total: number;
    attending: number;
    pending: number;
    declined: number;
  };
  budgetStats: {
    planned: number;
    actual: number;
    remaining: number;
  };
  taskStats: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
  };
  nextEvents: TimelineEventRecord[];
  categorySpend: Array<{
    name: string;
    planned: number;
    actual: number;
    remaining: number;
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignee: TaskAssignee;
    notes: string;
  }>;
  expenseHighlights: Array<{
    name: string;
    planned: number;
    actual: number;
    remaining: number;
  }>;
};

export type SeatingTableView = WeddingTableRecord & {
  seats: Array<
    SeatRecord & {
      guestName?: string;
    }
  >;
};

export type PublicWeddingView = {
  wedding: WeddingRecord;
  timeline: TimelineEventRecord[];
  venue: string;
};

export type PublicGuestLookupView = {
  guest: {
    id: string;
    name: string;
    status: RsvpStatus;
    dietaryRestrictions: string[];
    transportToVenue: boolean;
    transportFromVenue: boolean;
  };
  message: string;
};

export type ImportGuestRow = {
  firstName: string;
  lastName: string;
  side: GuestSide;
  email: string;
  phone: string;
  dietaryRestrictions: string[];
  notes: string;
  invitationReceived?: boolean;
  paymentCoverage?: PaymentCoverage;
  transportToVenue?: boolean;
  transportFromVenue?: boolean;
};

export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
export const TASK_ASSIGNEES: TaskAssignee[] = [
  "GROOM",
  "BRIDE",
  "COUPLE",
  "WITNESSES",
];
export const GUEST_SIDES: GuestSide[] = ["BRIDE", "GROOM", "FAMILY", "FRIENDS"];
export const RSVP_STATUSES: RsvpStatus[] = ["PENDING", "ATTENDING", "DECLINED"];
export const USER_ROLES: UserRole[] = ["ADMIN", "WITNESS", "READ_ONLY"];
export const PAYMENT_COVERAGES: PaymentCoverage[] = ["FULL", "HALF"];
