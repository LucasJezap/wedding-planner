"use client";

type PreviewRow = Record<string, string>;

const normalizeValue = (value: string) => value.trim().toLowerCase();

const parseSide = (value: string) => {
  switch (normalizeValue(value)) {
    case "panna młoda":
    case "bride":
      return "BRIDE" as const;
    case "pan młody":
    case "groom":
      return "GROOM" as const;
    case "rodzina":
    case "family":
      return "FAMILY" as const;
    default:
      return "FRIENDS" as const;
  }
};

const parseDiet = (value: string) => {
  switch (normalizeValue(value)) {
    case "wege":
    case "vegetarian":
      return ["VEGETARIAN"] as const;
    case "wegan":
    case "vegan":
      return ["VEGAN"] as const;
    default:
      return ["NONE"] as const;
  }
};

const parseRsvpStatus = (value: string) => {
  switch (normalizeValue(value)) {
    case "potwierdzono":
    case "attending":
      return "ATTENDING" as const;
    case "odmowa":
    case "declined":
      return "DECLINED" as const;
    default:
      return "PENDING" as const;
  }
};

const parsePaymentCoverage = (value: string) => {
  switch (normalizeValue(value)) {
    case "50%":
    case "half":
      return "HALF" as const;
    default:
      return "FULL" as const;
  }
};

const parseBoolean = (value: string) => {
  switch (normalizeValue(value)) {
    case "true":
    case "tak":
    case "yes":
    case "1":
    case "x":
    case "☑":
    case "✓":
      return true;
    default:
      return false;
  }
};

export const mapPreviewRows = (
  rows: PreviewRow[],
  mapping: Record<string, string>,
) =>
  rows.map((row) => ({
    firstName: row[mapping.firstName] ?? "",
    lastName: row[mapping.lastName] ?? "",
    side: parseSide(row[mapping.side] ?? ""),
    email: row[mapping.email] ?? "",
    phone: row[mapping.phone] ?? "",
    dietaryRestrictions: parseDiet(row[mapping.dietaryRestrictions] ?? ""),
    rsvpStatus: parseRsvpStatus(row[mapping.rsvpStatus] ?? ""),
    invitationReceived: parseBoolean(row[mapping.invitationReceived] ?? ""),
    paymentCoverage: parsePaymentCoverage(row[mapping.paymentCoverage] ?? ""),
    transportToVenue: parseBoolean(row[mapping.transportToVenue] ?? ""),
    transportFromVenue: parseBoolean(row[mapping.transportFromVenue] ?? ""),
    notes: row[mapping.notes] ?? "",
  }));
