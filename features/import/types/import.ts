import { z } from "zod";

import type { ImportGuestRow } from "@/lib/planner-domain";

export const IMPORT_TEMPLATE_HEADERS = [
  "FirstName",
  "LastName",
  "Side",
  "Email",
  "Phone",
  "DietaryRestrictions",
  "Notes",
  "InvitationReceived",
  "PaymentCoverage",
  "TransportToVenue",
  "TransportFromVenue",
] as const;

export const hasValidImportHeaders = (headers: string[]) =>
  headers.length === IMPORT_TEMPLATE_HEADERS.length &&
  IMPORT_TEMPLATE_HEADERS.every((header) => headers.includes(header));

export const importRowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  side: z.enum(["BRIDE", "GROOM", "FAMILY", "FRIENDS"]),
  email: z.email(),
  phone: z.string().min(6),
  dietaryRestrictions: z.array(z.string()).default([]),
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
