"use client";

import type { TimelineEventRecord } from "@/lib/planner-domain";

export const useTimelineAgenda = (events: TimelineEventRecord[]) =>
  [...events].sort((left, right) =>
    left.startsAt.localeCompare(right.startsAt),
  );
