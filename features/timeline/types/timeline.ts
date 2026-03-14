import { z } from "zod";

import type { TimelineEventRecord } from "@/lib/planner-domain";

export const timelineEventInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  startsAt: z.string().min(1),
  location: z.string().min(1),
  visibleToGuests: z.boolean().default(true),
});

export type TimelineEventInput = z.infer<typeof timelineEventInputSchema>;
export type { TimelineEventRecord };
