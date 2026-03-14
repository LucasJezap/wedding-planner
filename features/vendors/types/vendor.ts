import { z } from "zod";

import type { VendorView } from "@/lib/planner-domain";

export const vendorInputSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  cost: z.number().min(0),
  contactEmail: z.string().email().or(z.literal("")),
  contactPhone: z.string().min(6).or(z.literal("")),
  notes: z.string().default(""),
});

export type VendorInput = z.infer<typeof vendorInputSchema>;
export type { VendorView };
