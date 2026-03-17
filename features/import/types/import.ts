import { z } from "zod";

import type { ImportGuestRow } from "@/lib/planner-domain";

export const IMPORT_TEMPLATE_HEADERS = [
  "Imię",
  "Nazwisko",
  "Strona",
  "Email",
  "Telefon",
  "Dieta",
  "Notatki",
  "RSVP",
  "Zaproszenie doręczone",
  "Płatność",
  "Transport na salę",
  "Transport powrotny",
] as const;

export const LEGACY_IMPORT_TEMPLATE_HEADERS = [
  "FirstName",
  "LastName",
  "Side",
  "Email",
  "Phone",
  "DietaryRestrictions",
  "Notes",
  "RSVP",
  "InvitationReceived",
  "PaymentCoverage",
  "TransportToVenue",
  "TransportFromVenue",
] as const;

export const IMPORT_FIELD_ALIASES = {
  firstName: ["Imię", "FirstName"],
  lastName: ["Nazwisko", "LastName"],
  side: ["Strona", "Side"],
  email: ["Email"],
  phone: ["Telefon", "Phone"],
  dietaryRestrictions: ["Dieta", "DietaryRestrictions"],
  notes: ["Notatki", "Notes"],
  rsvpStatus: ["RSVP"],
  invitationReceived: ["Zaproszenie doręczone", "InvitationReceived"],
  paymentCoverage: ["Płatność", "PaymentCoverage"],
  transportToVenue: ["Transport na salę", "TransportToVenue"],
  transportFromVenue: ["Transport powrotny", "TransportFromVenue"],
} as const;

const matchesTemplate = (headers: string[], template: readonly string[]) =>
  headers.length === template.length &&
  template.every((header) => headers.includes(header));

export const hasValidImportHeaders = (headers: string[]) =>
  matchesTemplate(headers, IMPORT_TEMPLATE_HEADERS) ||
  matchesTemplate(headers, LEGACY_IMPORT_TEMPLATE_HEADERS);

export const isBlankImportRow = (row: Record<string, string>) =>
  Object.values(row).every((value) => value.trim().length === 0);

export const importRowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  side: z.enum(["BRIDE", "GROOM", "FAMILY", "FRIENDS"]),
  email: z.string().email().or(z.literal("")),
  phone: z.string().min(6).or(z.literal("")),
  dietaryRestrictions: z
    .array(z.enum(["NONE", "VEGETARIAN", "VEGAN"]))
    .default(["NONE"]),
  rsvpStatus: z.enum(["PENDING", "ATTENDING", "DECLINED"]).optional(),
  invitationReceived: z.boolean().optional(),
  paymentCoverage: z.enum(["FULL", "HALF"]).optional(),
  transportToVenue: z.boolean().optional(),
  transportFromVenue: z.boolean().optional(),
  notes: z.string().default(""),
});

export const importPayloadSchema = z.object({
  rows: z.array(importRowSchema).min(1),
});

export type ImportPayload = z.infer<typeof importPayloadSchema>;
export type { ImportGuestRow };
