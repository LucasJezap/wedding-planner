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
  status: z.enum(["PENDING", "ATTENDING", "DECLINED"]),
  guestCount: z.number().int().min(1).max(4),
});

export type PublicGuestLookupInput = z.infer<typeof publicGuestLookupSchema>;
export type PublicRsvpInput = z.infer<typeof publicRsvpSchema>;
export type { PublicGuestLookupView, PublicWeddingView };
