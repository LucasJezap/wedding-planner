import type { TimelineEventInput } from "@/features/timeline/types/timeline";
import {
  createTimelineEvent,
  deleteTimelineEvent,
  listTimelineEvents,
  updateTimelineEvent,
} from "@/services/timeline-service";

export const getTimelineHandler = async () => listTimelineEvents();
export const createTimelineHandler = async (input: TimelineEventInput) =>
  createTimelineEvent(input);
export const updateTimelineHandler = async (
  eventId: string,
  input: Partial<TimelineEventInput>,
) => updateTimelineEvent(eventId, input);
export const deleteTimelineHandler = async (eventId: string) =>
  deleteTimelineEvent(eventId);
