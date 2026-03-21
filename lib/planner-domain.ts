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
export type VendorStatus =
  | "RESEARCH"
  | "CONTACTED"
  | "OFFER_RECEIVED"
  | "NEGOTIATING"
  | "BOOKED"
  | "REJECTED";

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
  aboutText?: string;
  dressCode?: string;
  faqItems?: string;
  parkingInfo?: string;
  accommodationInfo?: string;
  registryInfo?: string;
  transportInfo?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  createdAt: string;
  updatedAt: string;
};

export type FaqItem = { question: string; answer: string };

export type InvitationGroupRecord = {
  id: string;
  weddingId: string;
  name: string;
  invitedGuestCount: number;
  allowsPlusOne: boolean;
  notes: string;
  sharedRsvpStatus: RsvpStatus;
  attendingChildren: number;
  plusOneName: string;
  mealChoice: string;
  dietaryNotes: string;
  needsAccommodation: boolean;
  transportToVenue: boolean;
  transportFromVenue: boolean;
  message: string;
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
  invitationGroupId?: string;
  tableId?: string;
  groupName?: string;
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
  status: VendorStatus;
  owner: string;
  bookingDate?: string;
  followUpDate?: string;
  depositAmount: number;
  offerUrl: string;
  websiteUrl: string;
  instagramUrl: string;
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
  vendorId?: string;
  name: string;
  estimateMin: number;
  estimateMax: number;
  actualAmount: number;
  dueDate?: string;
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
  tags: string[];
  blockedByTaskIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type TaskChecklistItemRecord = {
  id: string;
  weddingId: string;
  taskId: string;
  title: string;
  completed: boolean;
  sortOrder: number;
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
  attendingChildren: number;
  plusOneName: string;
  mealChoice: string;
  dietaryNotes: string;
  needsAccommodation: boolean;
  transportToVenue: boolean;
  transportFromVenue: boolean;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type PlannerState = {
  users: UserRecord[];
  userInvitations: UserInvitationRecord[];
  wedding: WeddingRecord;
  invitationGroups: InvitationGroupRecord[];
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
  taskChecklistItems: TaskChecklistItemRecord[];
  timelineEvents: TimelineEventRecord[];
  rsvps: RsvpRecord[];
};

export type GuestView = GuestRecord & {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  tableName?: string;
  invitedGuestCount?: number;
  allowsPlusOne?: boolean;
  groupNotes?: string;
};

export type InvitationGroupView = InvitationGroupRecord & {
  memberCount: number;
  pendingCount: number;
  attendingCount: number;
  declinedCount: number;
  memberNames: string[];
};

export type VendorView = VendorRecord & {
  categoryName: string;
  categoryType: VendorCategoryType;
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

export type TaskView = TaskRecord & {
  notes: string;
  checklistItems: TaskChecklistItemRecord[];
  blockedByTaskTitles: string[];
};

export type ExpenseView = ExpenseRecord & {
  categoryName: string;
  categoryColor: string;
  vendorName?: string;
  paidAmount: number;
  remainingAmount: number;
  isOverdue: boolean;
  payments: PaymentRecord[];
};

export type DashboardData = {
  wedding: WeddingRecord;
  countdownDays: number;
  countdownHours: number;
  viewerRole?: UserRole;
  responsibilityOptions: Array<
    | {
        id: "ALL";
        type: "ALL";
        label: string;
      }
    | {
        id: `TASK:${TaskAssignee}`;
        type: "TASK_ASSIGNEE";
        value: TaskAssignee;
        label: string;
      }
    | {
        id: `VENDOR:${string}`;
        type: "VENDOR_OWNER";
        value: string;
        label: string;
      }
  >;
  attentionStats: {
    missingRsvp: number;
    unseatedGuests: number;
    overdueTasks: number;
    vendorFollowUps: number;
    overdueExpenses: number;
  };
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
    blocked: number;
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
    id: string;
    name: string;
    planned: number;
    actual: number;
    remaining: number;
  }>;
  pendingRsvps: Array<{
    id: string;
    name: string;
    side: GuestSide;
    invitationGroupName?: string;
  }>;
  unseatedGuests: Array<{
    id: string;
    name: string;
    side: GuestSide;
    invitationGroupName?: string;
  }>;
  attentionTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignee: TaskAssignee;
    notes: string;
    isOverdue: boolean;
  }>;
  overdueTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: TaskPriority;
    assignee: TaskAssignee;
    notes: string;
  }>;
  vendorFollowUps: Array<{
    id: string;
    name: string;
    categoryName: string;
    status: VendorStatus;
    followUpDate: string;
    owner: string;
  }>;
  vendorsMissingContact: Array<{
    id: string;
    name: string;
    categoryName: string;
    owner: string;
    hasEmail: boolean;
    hasPhone: boolean;
  }>;
  paymentAlerts: Array<{
    id: string;
    name: string;
    vendorName?: string;
    dueDate: string;
    remaining: number;
    isOverdue: boolean;
  }>;
  upcomingPayments: Array<{
    id: string;
    name: string;
    vendorName?: string;
    dueDate: string;
    remaining: number;
  }>;
  todayFocus: {
    tasks: Array<{
      id: string;
      title: string;
      dueDate: string;
      href: string;
    }>;
    events: Array<{
      id: string;
      title: string;
      startsAt: string;
      href: string;
    }>;
    payments: Array<{
      id: string;
      name: string;
      dueDate: string;
      href: string;
    }>;
    vendorFollowUps: Array<{
      id: string;
      name: string;
      followUpDate: string;
      href: string;
    }>;
  };
  activityFeed: Array<{
    id: string;
    type: "TASK" | "GUEST" | "VENDOR" | "EXPENSE" | "TIMELINE";
    title: string;
    detail: string;
    updatedAt: string;
    href: string;
    taskAssignee?: TaskAssignee;
    vendorOwner?: string;
  }>;
  decisionQueue: Array<{
    id: string;
    title: string;
    detail: string;
    href: string;
    taskAssignee?: TaskAssignee;
    vendorOwner?: string;
  }>;
  quickActions: Array<{
    id: "ADD_GUEST" | "ADD_TASK" | "ADD_EXPENSE" | "ADD_TIMELINE_EVENT";
    href: string;
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
  aboutText?: string;
  dressCode?: string;
  faqItems: FaqItem[];
  ceremonyDate: string;
  coupleNames: string;
  logistics: Array<{
    id: "parking" | "accommodation" | "registry" | "transport" | "coordinator";
    content: string;
  }>;
};

export type PublicGuestLookupView = {
  guest: {
    id: string;
    name: string;
    status: RsvpStatus;
    guestCount: number;
    attendingChildren: number;
    plusOneName: string;
    mealChoice: string;
    dietaryNotes: string;
    needsAccommodation: boolean;
    dietaryRestrictions: string[];
    transportToVenue: boolean;
    transportFromVenue: boolean;
    message: string;
  };
  invitationGroup?: {
    id: string;
    name: string;
    invitedGuestCount: number;
    allowsPlusOne: boolean;
    members: Array<{
      id: string;
      name: string;
      status: RsvpStatus;
    }>;
    sharedResponse: boolean;
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
  groupName?: string;
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
export const VENDOR_CATEGORY_TYPES: VendorCategoryType[] = [
  "VENUE",
  "CATERING",
  "MUSIC",
  "PHOTO",
  "FLORAL",
  "WEDDING_PLANNER",
  "CONTENT_CREATOR",
  "MAKEUP",
  "HAIR",
  "PRIEST",
  "ATTIRE",
  "TRANSPORT",
  "OTHER",
];
export const VENDOR_STATUSES: VendorStatus[] = [
  "RESEARCH",
  "CONTACTED",
  "OFFER_RECEIVED",
  "NEGOTIATING",
  "BOOKED",
  "REJECTED",
];
export const USER_ROLES: UserRole[] = ["ADMIN", "WITNESS", "READ_ONLY"];
export const PAYMENT_COVERAGES: PaymentCoverage[] = ["FULL", "HALF"];
