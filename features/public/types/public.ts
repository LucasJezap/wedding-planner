import { z } from "zod";

import type {
  PublicGuestLookupView,
  PublicWeddingView,
} from "@/lib/planner-domain";

export const publicGuestLookupSchema = z.object({
  token: z.string().trim().min(6),
});

export const publicRsvpSchema = z.object({
  token: z.string().trim().min(6),
  status: z.enum(["ATTENDING", "DECLINED"]),
  guestCount: z.number().int().min(1).max(6).default(1),
  attendingChildren: z.number().int().min(0).max(4).default(0),
  plusOneName: z.string().trim().max(120).default(""),
  mealChoice: z.string().trim().max(120).default(""),
  dietaryNotes: z.string().trim().max(500).default(""),
  needsAccommodation: z.boolean().default(false),
  transportToVenue: z.boolean().default(false),
  transportFromVenue: z.boolean().default(false),
  message: z.string().trim().max(600).default(""),
});

export type PublicGuestLookupInput = z.infer<typeof publicGuestLookupSchema>;
export type PublicRsvpInput = z.input<typeof publicRsvpSchema>;
export type { PublicGuestLookupView, PublicWeddingView };
