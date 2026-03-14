"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTimelineAgenda } from "@/features/timeline/hooks/use-timeline-agenda";
import type { TimelineEventInput } from "@/features/timeline/types/timeline";
import { canEditTimeline } from "@/lib/access-control";
import type { TimelineEventRecord, UserRole } from "@/lib/planner-domain";
import { apiClient } from "@/lib/api-client";
import { toDateTimeLocalValue } from "@/lib/date-time";
import { formatDateTime } from "@/lib/format";

export const TimelineManager = ({
  initialEvents,
  viewerRole,
}: {
  initialEvents: TimelineEventRecord[];
  viewerRole: UserRole;
}) => {
  const { locale, messages } = useLocale();
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] =
    useState<TimelineEventRecord | null>(null);
  const agenda = useTimelineAgenda(events);
  const { register, handleSubmit, reset } = useForm<TimelineEventInput>({
    defaultValues: {
      title: "",
      description: "",
      startsAt: toDateTimeLocalValue(new Date().toISOString()),
      location: "",
      visibleToGuests: true,
    },
  });

  const resetForm = () => {
    setSelectedEvent(null);
    reset({
      title: "",
      description: "",
      startsAt: toDateTimeLocalValue(new Date().toISOString()),
      location: "",
      visibleToGuests: true,
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      {canEditTimeline(viewerRole) ? (
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {selectedEvent
                ? messages.timeline.editEvent
                : messages.timeline.addEvent}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={handleSubmit(async (values) => {
                const endpoint = selectedEvent
                  ? `/api/timeline/${selectedEvent.id}`
                  : "/api/timeline";
                const method = selectedEvent ? "PATCH" : "POST";
                const response = await apiClient<TimelineEventRecord>(
                  endpoint,
                  {
                    method,
                    body: JSON.stringify(values),
                  },
                );
                setEvents((current) => {
                  const exists = current.some(
                    (candidate) => candidate.id === response.id,
                  );
                  return exists
                    ? current.map((candidate) =>
                        candidate.id === response.id ? response : candidate,
                      )
                    : [...current, response];
                });
                resetForm();
              })}
            >
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.timeline.eventTitle}</span>
                <Input
                  placeholder={messages.timeline.eventTitle}
                  {...register("title")}
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.timeline.description}</span>
                <Input
                  placeholder={messages.timeline.description}
                  {...register("description")}
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.timeline.createEvent}</span>
                <Input type="datetime-local" {...register("startsAt")} />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.timeline.location}</span>
                <Input
                  placeholder={messages.timeline.location}
                  {...register("location")}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                <input type="checkbox" {...register("visibleToGuests")} />
                {messages.timeline.visibleToGuests}
              </label>
              <div className="flex gap-3">
                <Button className="rounded-full" type="submit">
                  {selectedEvent
                    ? messages.timeline.saveEvent
                    : messages.timeline.createEvent}
                </Button>
                {selectedEvent ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {messages.guests.cancel}
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="space-y-4">
        {agenda.map((event) => (
          <Card
            key={event.id}
            className="border-white/70 bg-white/85"
            onDoubleClick={() => {
              if (!canEditTimeline(viewerRole)) {
                return;
              }
              setSelectedEvent(event);
              reset({
                title: event.title,
                description: event.description,
                startsAt: toDateTimeLocalValue(event.startsAt),
                location: event.location,
                visibleToGuests: event.visibleToGuests,
              });
            }}
          >
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                  {formatDateTime(event.startsAt, locale)}
                </p>
                <h3 className="font-display text-3xl text-[var(--color-ink)]">
                  {event.title}
                </h3>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {event.location}
                </p>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {event.visibleToGuests
                    ? messages.timeline.visibleToGuests
                    : messages.timeline.hiddenFromGuests}
                </p>
              </div>
              {canEditTimeline(viewerRole) ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedEvent(event);
                      reset({
                        title: event.title,
                        description: event.description,
                        startsAt: toDateTimeLocalValue(event.startsAt),
                        location: event.location,
                        visibleToGuests: event.visibleToGuests,
                      });
                    }}
                  >
                    {messages.guests.editButton}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!window.confirm(messages.common.confirmDelete)) {
                        return;
                      }
                      await apiClient<{ eventId: string }>(
                        `/api/timeline/${event.id}`,
                        {
                          method: "DELETE",
                        },
                      );
                      setEvents((current) =>
                        current.filter(
                          (candidate) => candidate.id !== event.id,
                        ),
                      );
                    }}
                  >
                    {messages.timeline.delete}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
