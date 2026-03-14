import { getRepository } from "@/db/repositories";
import type { TimelineEventRecord } from "@/lib/planner-domain";
import {
  timelineEventInputSchema,
  type TimelineEventInput,
} from "@/features/timeline/types/timeline";
import { fromDateTimeLocalValue } from "@/lib/date-time";

export const listTimelineEvents = async (): Promise<TimelineEventRecord[]> => {
  const repository = getRepository();
  const events = await repository.listTimelineEvents();
  return events.sort((left, right) =>
    left.startsAt.localeCompare(right.startsAt),
  );
};

export const createTimelineEvent = async (
  input: TimelineEventInput,
): Promise<TimelineEventRecord> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const data = timelineEventInputSchema.parse(input);
  return repository.createTimelineEvent({
    weddingId: wedding.id,
    title: data.title,
    description: data.description,
    startsAt: fromDateTimeLocalValue(data.startsAt),
    location: data.location,
    visibleToGuests: data.visibleToGuests,
  });
};

export const updateTimelineEvent = async (
  eventId: string,
  input: Partial<TimelineEventInput>,
): Promise<TimelineEventRecord> => {
  const current = (await listTimelineEvents()).find(
    (candidate) => candidate.id === eventId,
  );
  if (!current) {
    throw new Error("Timeline event not found");
  }

  const data = timelineEventInputSchema.parse({
    ...current,
    ...input,
  });

  const repository = getRepository();
  return repository.updateTimelineEvent(eventId, {
    ...data,
    startsAt: fromDateTimeLocalValue(data.startsAt),
  });
};

export const deleteTimelineEvent = async (eventId: string): Promise<void> => {
  const repository = getRepository();
  await repository.deleteTimelineEvent(eventId);
};
