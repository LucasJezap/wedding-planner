import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { hashSync } from "bcryptjs";

import type {
  BudgetCategoryRecord,
  ContactRecord,
  ExpenseRecord,
  GuestRecord,
  NoteRecord,
  PaymentRecord,
  PlannerState,
  SeatRecord,
  TaskPriority,
  TaskRecord,
  TaskStatus,
  TimelineEventRecord,
  VendorCategoryRecord,
  VendorCategoryType,
  VendorRecord,
  WeddingTableRecord,
} from "@/lib/planner-domain";
import { DEMO_CREDENTIALS, WITNESS_DEMO_CREDENTIALS } from "@/lib/planner-seed";

const weddingId = "wedding-katarzyna-lukasz";
const now = "2026-03-13T10:00:00.000Z";
const ceremonyDate = "2026-09-10T14:00:00.000Z";
const realPlanPath = join(process.cwd(), "docs", "real-plan.md");

type ParsedExpense = {
  name: string;
  min: number;
  max: number;
  paid: number;
};

type ParsedContact = {
  name: string;
  role: string;
  phone: string;
  email: string;
  website: string;
  notes: string;
};

type ParsedHousehold = {
  names: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
  inviteCopy: string;
  response: string;
  adults: number;
  children: number;
};

type ParsedTable = {
  name: string;
  guests: string[];
};

type SeedGuest = Omit<
  GuestRecord,
  "rsvpToken" | "paymentCoverage" | "transportToVenue" | "transportFromVenue"
> & {
  placeholderType?: "ADULT" | "CHILD";
};

type ParsedGuestListEntry = {
  name: string;
  side: GuestRecord["side"];
};

const normalizeValue = (value: string) =>
  value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeKey = (value: string) =>
  normalizeValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase();

const slugify = (value: string) =>
  normalizeKey(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const parsePolishAmount = (value: string): number => {
  const normalized = normalizeValue(value)
    .replace(/[^\d,-]/g, "")
    .replace(",", ".");
  return normalized ? Number.parseFloat(normalized) : 0;
};

const isAmountLike = (value: string) => /[\d,]/.test(value);

const parseDate = (rawValue: string): string => {
  const value = normalizeValue(rawValue);
  if (value === "Po ślubie") {
    return "2026-09-17T10:00:00.000Z";
  }

  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) {
    return ceremonyDate;
  }

  const [, day, month, year] = match;
  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 10, 0, 0),
  ).toISOString();
};

const buildTaskPriority = (
  dueDate: string,
  status: TaskStatus,
): TaskPriority => {
  if (status === "DONE") {
    return "LOW";
  }

  const daysUntilDue =
    (new Date(dueDate).getTime() - new Date(now).getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysUntilDue <= 60) {
    return "HIGH";
  }
  if (daysUntilDue <= 150) {
    return "MEDIUM";
  }
  return "LOW";
};

const mapTaskAssignee = (value: string): TaskRecord["assignee"] => {
  const normalized = normalizeKey(value);
  if (normalized.includes("ona")) {
    return "BRIDE";
  }
  if (normalized.includes("on")) {
    return "GROOM";
  }
  if (normalized.includes("swiad")) {
    return "WITNESSES";
  }
  return "COUPLE";
};

const readSection = (
  document: string,
  heading: string,
  nextHeading?: string,
) => {
  const lines = document.split(/\r?\n/);
  const start = lines.findIndex((line) => normalizeValue(line) === heading);
  if (start === -1) {
    return [];
  }

  const end = nextHeading
    ? lines.findIndex(
        (line, index) => index > start && normalizeValue(line) === nextHeading,
      )
    : lines.length;

  return lines.slice(start + 1, end === -1 ? lines.length : end);
};

const splitStructuredLine = (line: string) =>
  line.includes("\t")
    ? line.split("\t").map(normalizeValue)
    : line
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((value) => normalizeValue(value.replace(/^"|"$/g, "")));

const readRealPlanDocument = (filePath = realPlanPath) =>
  readFileSync(filePath, "utf8");

const parseTasks = (document: string) => {
  const lines = readSection(document, "Lista zadan", "Lista kontaktów");
  const tasks: TaskRecord[] = [];
  const notes: NoteRecord[] = [];

  lines.forEach((line, index) => {
    const parts = splitStructuredLine(line);
    if (!["✅", "⬜"].includes(parts[0] ?? "")) {
      return;
    }

    const title = parts[1] ?? "";
    if (!title) {
      return;
    }

    const dueDate = parseDate(parts[2] ?? "");
    const status: TaskStatus = parts[0] === "✅" ? "DONE" : "TODO";
    const taskId = `task-real-${index + 1}`;

    tasks.push({
      id: taskId,
      weddingId,
      title,
      description: parts[3] || "Do uzgodnienia",
      dueDate,
      priority: buildTaskPriority(dueDate, status),
      status,
      assignee: mapTaskAssignee(parts[3] ?? ""),
      createdAt: now,
      updatedAt: now,
    });

    if (parts[4]) {
      notes.push({
        id: `note-task-real-${index + 1}`,
        weddingId,
        taskId,
        content: parts[4],
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  return { tasks, notes };
};

const mapVendorType = (value: string): VendorCategoryType => {
  const normalized = normalizeKey(value);
  if (normalized.includes("sali") || normalized.includes("venue")) {
    return "VENUE";
  }
  if (normalized.includes("fotograf") || normalized.includes("film")) {
    return "PHOTO";
  }
  if (normalized.includes("bar") || normalized.includes("barman")) {
    return "CATERING";
  }
  if (normalized.includes("dj") || normalized.includes("muzyk")) {
    return "MUSIC";
  }
  if (normalized.includes("flor")) {
    return "FLORAL";
  }
  return "OTHER";
};

const parseContacts = (document: string): ParsedContact[] =>
  readSection(document, "Lista kontaktów", "Wydatki")
    .map(splitStructuredLine)
    .filter((parts) => /^\d+$/.test(parts[0] ?? ""))
    .map((parts) => ({
      name: parts[1] ?? "",
      role: parts[2] ?? "Usługodawca",
      phone: parts[3] ?? "",
      email: parts[4] ?? "",
      website: parts[5] ?? "",
      notes: parts[6] ?? "",
    }))
    .filter((contact) => contact.name);

const parseExpenses = (document: string): ParsedExpense[] =>
  readSection(document, "Wydatki", "Goscie")
    .map(splitStructuredLine)
    .map((parts) => {
      if (parts[2] && !isAmountLike(parts[2])) {
        return {
          name: parts[2],
          min: parsePolishAmount(parts[3] ?? ""),
          max: parsePolishAmount(parts[4] ?? ""),
          paid: parsePolishAmount(parts[5] ?? ""),
        };
      }

      if (parts[0] && !isAmountLike(parts[0]) && isAmountLike(parts[1] ?? "")) {
        return {
          name: parts[0],
          min: parsePolishAmount(parts[1] ?? ""),
          max: parsePolishAmount(parts[2] ?? ""),
          paid: parsePolishAmount(parts[3] ?? ""),
        };
      }

      return null;
    })
    .filter((expense): expense is ParsedExpense => Boolean(expense?.name))
    .filter(
      (expense) => !["Ł", "K", "Pomoc dla powodzian"].includes(expense.name),
    );

const splitAdultNames = (value: string) => {
  const normalized = normalizeValue(value);
  if (!normalized) {
    return [];
  }
  if (normalizeKey(normalized).includes("para mloda")) {
    return ["Pan Młody", "Panna Młoda"];
  }

  return normalized
    .split(/\s+i\s+/)
    .map(normalizeValue)
    .filter(Boolean);
};

const extractLastName = (names: string) => {
  const normalized = normalizeValue(names)
    .replace(/wraz z dziećmi/gi, "")
    .replace(/oraz .*/gi, "")
    .replace(/z osobą towarzyszącą/gi, "")
    .replace(/z dziećmi/gi, "");
  const match = normalized.match(/([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż-]+)\s*$/);
  return match?.[1] ?? normalized;
};

const parseHouseholds = (document: string): ParsedHousehold[] =>
  readSection(document, "Goscie", "Ulozenie stolow")
    .map(splitStructuredLine)
    .filter(
      (parts) =>
        parts[1] && parts[1] !== "Imię i nazwisko (Odmiana na zaproszeniu)",
    )
    .map((parts) => {
      const contact = parts[2] ?? "";
      const phone = contact.match(/📞\s*([+\d\s]+)/)?.[1]?.trim() ?? "";
      const email = contact.match(/✉️\s*([^\s]+)/)?.[1]?.trim() ?? "";
      const address = contact
        .replace(/📞.*$/g, "")
        .replace(/✉️.*$/g, "")
        .replace(/^-$/, "")
        .trim();

      return {
        names: parts[1] ?? "",
        lastName: extractLastName(parts[1] ?? ""),
        address,
        email,
        phone,
        inviteCopy: parts[3] ?? "",
        response: parts[3]?.includes("Tak") ? "Tak" : "",
        adults:
          Number.parseInt((parts[4] ?? "0").replace(/[^\d]/g, ""), 10) || 0,
        children:
          Number.parseInt((parts[5] ?? "0").replace(/[^\d]/g, ""), 10) || 0,
      };
    })
    .filter((household) => household.names);

const parseGuestList = (document: string): ParsedGuestListEntry[] => {
  const lines = readSection(document, "LISTA");
  const guests: ParsedGuestListEntry[] = [];

  for (const line of lines) {
    const normalized = normalizeValue(line);
    if (!normalized || normalized.startsWith("Znacznik")) {
      break;
    }

    const parts = splitStructuredLine(normalized);
    if (parts.length < 2) {
      continue;
    }

    const name = parts[0] ?? "";
    const sideLabel = normalizeKey(parts.at(-1) ?? "");
    const side =
      sideLabel === "panna mloda"
        ? "BRIDE"
        : sideLabel === "pan mlody"
          ? "GROOM"
          : sideLabel === "przyjaciele"
            ? "FRIENDS"
            : "FAMILY";

    if (name) {
      guests.push({ name, side });
    }
  }

  return guests;
};

const splitListedGuestName = (value: string) => {
  const normalized = normalizeValue(value);
  if (
    !normalized ||
    normalized === "Pan Młody" ||
    normalized === "Panna Młoda" ||
    normalized.includes(" - OT") ||
    normalized.includes("(")
  ) {
    return { firstName: normalized, lastName: "" };
  }

  const segments = normalized.split(" ");
  if (segments.length < 2) {
    return { firstName: normalized, lastName: "" };
  }

  return {
    firstName: segments.slice(0, -1).join(" "),
    lastName: segments.at(-1) ?? "",
  };
};

const buildWeddingMetadata = (document: string) => {
  const parsedGuests = parseGuestList(document);
  const bride = parsedGuests.find((guest) => guest.side === "BRIDE");
  const groom = parsedGuests.find((guest) => guest.side === "GROOM");
  const brideName = splitListedGuestName(bride?.name ?? "Partner A").firstName;
  const groomName = splitListedGuestName(groom?.name ?? "Partner B").firstName;

  return {
    slug: slugify(`${brideName}-${groomName}`) || "demo-wedding",
    title: `${brideName} & ${groomName}`,
    coupleOneName: brideName,
    coupleTwoName: groomName,
  };
};

const buildGuestRosterFromList = (document: string) => {
  const parsedGuests = parseGuestList(document);
  const guests: SeedGuest[] = parsedGuests.map((guest, index) => {
    const nameParts = splitListedGuestName(guest.name);

    return {
      id: `guest-real-${index + 1}`,
      weddingId,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      side: guest.side,
      rsvpStatus: "PENDING",
      dietaryRestrictions: [],
      invitationReceived: true,
      createdAt: now,
      updatedAt: now,
    };
  });

  return {
    guests,
    contacts: [] as ContactRecord[],
    notes: [] as NoteRecord[],
  };
};

const parseSeating = (document: string): ParsedTable[] => {
  return readSection(document, "Ulozenie stolow")
    .map(splitStructuredLine)
    .filter((parts) => /^Stół|^👑\s*Stół/.test(parts[0] ?? ""))
    .map((parts) => ({
      name: (parts[0] ?? "").replace(/^👑\s*/, ""),
      guests: (parts[1] ?? "").split(",").map(normalizeValue).filter(Boolean),
    }));
};

const classifySide = (lastName: string): GuestRecord["side"] => {
  const normalized = normalizeKey(lastName);
  if (
    [
      "jezapkowicz",
      "szulik",
      "wypchol",
      "zajac",
      "lecki",
      "tomala",
      "zlotos",
      "pedracki",
      "pikus",
      "wegrzyk",
      "podlesny",
    ].some((value) => normalized.includes(value))
  ) {
    return "GROOM";
  }
  if (
    ["przybyla", "marchewka", "cyfka", "maj", "zimny"].some((value) =>
      normalized.includes(value),
    )
  ) {
    return "BRIDE";
  }
  return "FAMILY";
};

const buildGuestRoster = (document: string) => {
  const guestListRoster = buildGuestRosterFromList(document);
  if (guestListRoster.guests.length) {
    return guestListRoster;
  }

  const households = parseHouseholds(document);
  const guests: SeedGuest[] = [];
  const contacts: ContactRecord[] = [];
  const notes: NoteRecord[] = [];
  let guestIndex = 1;

  households.forEach((household, householdIndex) => {
    const namedAdults = splitAdultNames(household.names);
    let firstGuestId: string | null = null;

    for (let adultIndex = 0; adultIndex < household.adults; adultIndex += 1) {
      const guestId = `guest-real-${guestIndex++}`;
      const firstName = namedAdults[adultIndex] ?? `Gość ${adultIndex + 1}`;
      const guest: SeedGuest = {
        id: guestId,
        weddingId,
        firstName,
        lastName: household.lastName,
        side: classifySide(household.lastName),
        rsvpStatus: household.response === "Tak" ? "ATTENDING" : "PENDING",
        dietaryRestrictions: [],
        invitationReceived: true,
        createdAt: now,
        updatedAt: now,
        placeholderType: namedAdults[adultIndex] ? undefined : "ADULT",
      };

      guests.push(guest);
      firstGuestId ??= guestId;
    }

    for (let childIndex = 0; childIndex < household.children; childIndex += 1) {
      guests.push({
        id: `guest-real-${guestIndex++}`,
        weddingId,
        firstName: `Dziecko ${childIndex + 1}`,
        lastName: household.lastName,
        side: classifySide(household.lastName),
        rsvpStatus: household.response === "Tak" ? "ATTENDING" : "PENDING",
        dietaryRestrictions: [],
        invitationReceived: true,
        createdAt: now,
        updatedAt: now,
        placeholderType: "CHILD",
      });
    }

    if (!firstGuestId) {
      return;
    }

    if (household.email || household.phone) {
      contacts.push({
        id: `contact-guest-real-${householdIndex + 1}`,
        weddingId,
        guestId: firstGuestId,
        email: household.email,
        phone: household.phone,
        createdAt: now,
        updatedAt: now,
      });
    }

    const noteParts = [household.address, household.inviteCopy].filter(Boolean);
    if (noteParts.length) {
      notes.push({
        id: `note-guest-real-${householdIndex + 1}`,
        weddingId,
        guestId: firstGuestId,
        content: noteParts.join(" | "),
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  return { guests, contacts, notes };
};

const splitPersonName = (label: string) => {
  const normalized = normalizeValue(label);
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  if (
    /^osoba tow/i.test(normalized) ||
    /^dziecko/i.test(normalized) ||
    normalized === "Pan Młody" ||
    normalized === "Panna Młoda" ||
    !normalized.includes(" ")
  ) {
    return { firstName: normalized, lastName: "" };
  }

  const segments = normalized.split(" ");
  return {
    firstName: segments.slice(0, -1).join(" "),
    lastName: segments.at(-1) ?? "",
  };
};

const fullGuestName = (guest: Pick<SeedGuest, "firstName" | "lastName">) =>
  normalizeValue(`${guest.firstName} ${guest.lastName}`);

const getBestGuestMatch = (
  guests: SeedGuest[],
  label: string,
  assignedGuestIds: Set<string>,
) => {
  const normalizedLabel = normalizeKey(label);
  const exact = guests.find(
    (guest) =>
      !assignedGuestIds.has(guest.id) &&
      normalizeKey(fullGuestName(guest)) === normalizedLabel,
  );

  if (exact) {
    return exact;
  }

  const targetName = splitPersonName(label);
  const placeholderPool = guests.filter((guest) => {
    if (assignedGuestIds.has(guest.id) || !guest.placeholderType) {
      return false;
    }

    if (targetName.firstName.toLowerCase().startsWith("dziecko")) {
      return guest.placeholderType === "CHILD";
    }

    return guest.placeholderType === "ADULT";
  });

  const sameLastName = targetName.lastName
    ? placeholderPool.find(
        (guest) =>
          normalizeKey(guest.lastName) === normalizeKey(targetName.lastName),
      )
    : undefined;
  const candidate = sameLastName ?? placeholderPool[0];

  if (!candidate) {
    return null;
  }

  candidate.firstName = targetName.firstName || label;
  candidate.lastName = targetName.lastName;
  delete candidate.placeholderType;
  return candidate;
};

const buildSeating = (document: string, guests: SeedGuest[]) => {
  const parsedTables = parseSeating(document);
  const weddingTables: WeddingTableRecord[] = [];
  const seats: SeatRecord[] = [];
  const assignedGuestIds = new Set<string>();
  let seatIndex = 1;

  parsedTables.forEach((table, tableIndex) => {
    const tableId = `table-real-${tableIndex + 1}`;
    const isCoupleTable = table.name === "Stół nowożeńców";
    weddingTables.push({
      id: tableId,
      weddingId,
      name: table.name,
      capacity: isCoupleTable
        ? Math.max(2, table.guests.length)
        : Math.max(8, table.guests.length || 8),
      positionX: (tableIndex % 3) * 320 + 20,
      positionY: Math.floor(tableIndex / 3) * 280 + 20,
      createdAt: now,
      updatedAt: now,
    });

    table.guests.forEach((guestLabel, guestPosition) => {
      const guest = getBestGuestMatch(guests, guestLabel, assignedGuestIds);
      if (guest) {
        assignedGuestIds.add(guest.id);
        guest.tableId = tableId;
        guest.rsvpStatus = "ATTENDING";
      }

      seats.push({
        id: `seat-real-${seatIndex}`,
        weddingId,
        tableId,
        guestId: guest?.id,
        label: `${table.name.replace(/\s+/g, "-").toLowerCase()}-${guestPosition + 1}`,
        position: guestPosition + 1,
        createdAt: now,
        updatedAt: now,
      });
      seatIndex += 1;
    });
  });

  return { weddingTables, seats };
};

const matchExpense = (expenses: ParsedExpense[], ...keywords: string[]) => {
  const normalizedKeywords = keywords.map(normalizeKey).filter(Boolean);
  return expenses.find((expense) =>
    normalizedKeywords.some((keyword) =>
      normalizeKey(expense.name).includes(keyword),
    ),
  );
};

const buildVendors = (
  parsedContacts: ParsedContact[],
  expenses: ParsedExpense[],
) => {
  const vendorCategoriesMap = new Map<string, VendorCategoryRecord>();
  const vendors: VendorRecord[] = [];
  const contacts: ContactRecord[] = [];
  const notes: NoteRecord[] = [];

  parsedContacts.forEach((contact, index) => {
    const categoryType = mapVendorType(contact.role);
    const categoryKey = `${categoryType}-${slugify(contact.role)}`;
    if (!vendorCategoriesMap.has(categoryKey)) {
      vendorCategoriesMap.set(categoryKey, {
        id: `vendor-category-real-${vendorCategoriesMap.size + 1}`,
        weddingId,
        name: contact.role,
        type: categoryType,
        createdAt: now,
        updatedAt: now,
      });
    }

    const vendorId = `vendor-real-${index + 1}`;
    const matchedExpense =
      matchExpense(expenses, contact.role, contact.name) ??
      matchExpense(
        expenses,
        contact.role === "Manager sali" ? "sala" : "",
        contact.role === "Fotograf" ? "fotograf" : "",
        contact.role === "Barman" ? "barman" : "",
        contact.role === "DJ" ? "dj" : "",
        contact.role === "Filmowiec" ? "kamerzysta" : "",
      );

    vendors.push({
      id: vendorId,
      weddingId,
      categoryId: vendorCategoriesMap.get(categoryKey)!.id,
      name: contact.name,
      cost: matchedExpense?.max ?? 0,
      createdAt: now,
      updatedAt: now,
    });

    contacts.push({
      id: `contact-vendor-real-${index + 1}`,
      weddingId,
      vendorId,
      email: contact.email,
      phone: contact.phone,
      createdAt: now,
      updatedAt: now,
    });

    const noteParts = [contact.role, contact.website, contact.notes].filter(
      Boolean,
    );
    if (noteParts.length) {
      notes.push({
        id: `note-vendor-real-${index + 1}`,
        weddingId,
        vendorId,
        content: noteParts.join(" | "),
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  return {
    vendorCategories: Array.from(vendorCategoriesMap.values()),
    vendors,
    contacts,
    notes,
  };
};

const buildBudget = (expenses: ParsedExpense[]) => {
  const budgetCategories: BudgetCategoryRecord[] = [];
  const expenseRecords: ExpenseRecord[] = [];
  const payments: PaymentRecord[] = [];
  const categoryColors = [
    "#D89BAE",
    "#E8B4A0",
    "#A1C6B4",
    "#8EA6D1",
    "#D8C28F",
    "#B4A7D6",
  ];

  expenses.forEach((expense, index) => {
    const categoryId = `budget-real-${index + 1}`;
    const expenseId = `expense-real-${index + 1}`;
    budgetCategories.push({
      id: categoryId,
      weddingId,
      name: expense.name,
      plannedAmount: expense.max || expense.min,
      color: categoryColors[index % categoryColors.length]!,
      notes: "",
      createdAt: now,
      updatedAt: now,
    });

    expenseRecords.push({
      id: expenseId,
      weddingId,
      categoryId,
      name: expense.name,
      estimateMin: expense.min,
      estimateMax: expense.max || expense.min,
      actualAmount: expense.max || expense.min,
      notes: "",
      createdAt: now,
      updatedAt: now,
    });

    if (expense.paid > 0) {
      payments.push({
        id: `payment-real-${index + 1}`,
        weddingId,
        expenseId,
        amount: expense.paid,
        paidAt: now,
        notes: "Wpłacona kwota z planu",
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  return { budgetCategories, expenses: expenseRecords, payments };
};

const buildTimeline = (): TimelineEventRecord[] => [
  {
    id: "timeline-real-1",
    weddingId,
    title: "Ceremonia ślubna",
    description: "Rozpoczęcie ceremonii i ślubnych przysiąg.",
    startsAt: "2026-09-10T14:00:00.000Z",
    location: "Kościół w Jejkowicach",
    visibleToGuests: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "timeline-real-2",
    weddingId,
    title: "Przyjazd do Leśnej Perły",
    description: "Powitanie gości na sali i toast otwarcia.",
    startsAt: "2026-09-10T16:30:00.000Z",
    location: "Leśna Perła, Radlin",
    visibleToGuests: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "timeline-real-3",
    weddingId,
    title: "Kolacja i pierwszy taniec",
    description: "Start wesela, pierwszy taniec i wieczorny program.",
    startsAt: "2026-09-10T19:00:00.000Z",
    location: "Leśna Perła, Radlin",
    visibleToGuests: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "timeline-real-4",
    weddingId,
    title: "Tort i atrakcje wieczoru",
    description: "Serwis tortu, drink bar i część taneczna.",
    startsAt: "2026-09-10T21:30:00.000Z",
    location: "Leśna Perła, Radlin",
    visibleToGuests: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const buildSeedFromRealPlanDocument = (
  document: string,
): PlannerState => {
  const weddingMetadata = buildWeddingMetadata(document);
  const parsedExpenses = parseExpenses(document);
  const parsedContacts = parseContacts(document);
  const {
    guests,
    contacts: guestContacts,
    notes: guestNotes,
  } = buildGuestRoster(document);
  const { weddingTables, seats } = buildSeating(document, guests);
  const {
    vendorCategories,
    vendors,
    contacts: vendorContacts,
    notes: vendorNotes,
  } = buildVendors(parsedContacts, parsedExpenses);
  const { budgetCategories, expenses, payments } = buildBudget(parsedExpenses);
  const { tasks, notes: taskNotes } = parseTasks(document);

  return {
    users: [
      {
        id: "user-lukasz-jezapkowicz",
        weddingId,
        name: DEMO_CREDENTIALS.name,
        email: DEMO_CREDENTIALS.email,
        role: "ADMIN",
        passwordHash: hashSync(DEMO_CREDENTIALS.password, 8),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-witness-real",
        weddingId,
        name: WITNESS_DEMO_CREDENTIALS.name,
        email: WITNESS_DEMO_CREDENTIALS.email,
        role: "WITNESS",
        passwordHash: hashSync(WITNESS_DEMO_CREDENTIALS.password, 8),
        createdAt: now,
        updatedAt: now,
      },
    ],
    userInvitations: [],
    wedding: {
      id: weddingId,
      slug: weddingMetadata.slug,
      title: weddingMetadata.title,
      coupleOneName: weddingMetadata.coupleOneName,
      coupleTwoName: weddingMetadata.coupleTwoName,
      venueName: "Leśna Perła",
      venueAddress: "Radlin, Polska",
      ceremonyDate,
      createdAt: now,
      updatedAt: now,
    },
    guests: guests.map((guest) => ({
      ...guest,
      rsvpToken: createHash("sha256")
        .update(guest.id)
        .digest("hex")
        .slice(0, 10)
        .toUpperCase(),
      paymentCoverage: "FULL",
      invitationReceived: true,
      transportToVenue: false,
      transportFromVenue: false,
    })),
    contacts: [...guestContacts, ...vendorContacts],
    notes: [...guestNotes, ...vendorNotes, ...taskNotes],
    weddingTables,
    seats,
    vendorCategories,
    vendors,
    budgetCategories: budgetCategories.map((category) => ({
      ...category,
      notes: "",
    })),
    expenses: expenses.map((expense) => ({
      ...expense,
      notes: "",
    })),
    payments,
    tasks,
    timelineEvents: buildTimeline(),
    rsvps: [],
  };
};

export const createRealPlannerSeed = (): PlannerState =>
  buildSeedFromRealPlanDocument(readRealPlanDocument());
