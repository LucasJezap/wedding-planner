import { z } from "zod";

import type { GuestView } from "@/lib/planner-domain";

export const guestInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  side: z.enum(["BRIDE", "GROOM", "FAMILY", "FRIENDS"]),
  rsvpStatus: z.enum(["PENDING", "ATTENDING", "DECLINED"]),
  dietaryRestrictions: z
    .array(z.enum(["NONE", "VEGETARIAN", "VEGAN"]))
    .default(["NONE"]),
  paymentCoverage: z.enum(["FULL", "HALF"]).default("FULL"),
  invitationReceived: z.boolean().default(false),
  transportToVenue: z.boolean().default(false),
  transportFromVenue: z.boolean().default(false),
  email: z.string().email().or(z.literal("")),
  phone: z.string().min(6).or(z.literal("")),
  notes: z.string().default(""),
});

export type GuestInput = z.input<typeof guestInputSchema>;
export type { GuestView };
