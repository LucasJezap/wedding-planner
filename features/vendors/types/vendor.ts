import { z } from "zod";

import type { VendorView } from "@/lib/planner-domain";

export const vendorInputSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  cost: z.number().min(0),
  status: z.enum([
    "RESEARCH",
    "CONTACTED",
    "OFFER_RECEIVED",
    "NEGOTIATING",
    "BOOKED",
    "REJECTED",
  ]),
  owner: z.string().default(""),
  bookingDate: z.string().optional().default(""),
  followUpDate: z.string().optional().default(""),
  depositAmount: z.number().min(0).default(0),
  offerUrl: z.string().url().or(z.literal("")),
  websiteUrl: z.string().url().or(z.literal("")),
  instagramUrl: z.string().url().or(z.literal("")),
  contactEmail: z.string().email().or(z.literal("")),
  contactPhone: z.string().min(6).or(z.literal("")),
  notes: z.string().default(""),
});

export type VendorInput = z.infer<typeof vendorInputSchema>;
export type { VendorView };
