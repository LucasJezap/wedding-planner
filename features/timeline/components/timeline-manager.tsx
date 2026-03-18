"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FieldError } from "@/components/field-error";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTimelineAgenda } from "@/features/timeline/hooks/use-timeline-agenda";
import { timelineEventInputSchema } from "@/features/timeline/types/timeline";
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
  const formRef = useRef<HTMLDivElement | null>(null);
  const agenda = useTimelineAgenda(events);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TimelineEventInput>({
    defaultValues: {
      title: "",
      description: "",
      startsAt: toDateTimeLocalValue(new Date().toISOString()),
      location: "",
      visibleToGuests: true,
    },
    resolver: zodResolver(timelineEventInputSchema) as never,
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

  const handleEdit = (event: TimelineEventRecord) => {
    setSelectedEvent(event);
    reset({
      title: event.title,
      description: event.description,
      startsAt: toDateTimeLocalValue(event.startsAt),
      location: event.location,
      visibleToGuests: event.visibleToGuests,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      {canEditTimeline(viewerRole) ? (
        <Card
          className="scroll-mt-40 border-white/70 bg-white/85"
          ref={formRef}
        >
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
                try {
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
                } catch {
                  toast.error(messages.common.actionError);
                }
              })}
            >
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.timeline.eventTitle}</span>
                <Input
                  placeholder={messages.timeline.eventTitle}
                  aria-invalid={!!errors.title}
                  {...register("title")}
                />
                <FieldError error={errors.title} />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.timeline.description}</span>
                <Input
                  placeholder={messages.timeline.description}
                  aria-invalid={!!errors.description}
                  {...register("description")}
                />
                <FieldError error={errors.description} />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.timeline.createEvent}</span>
                <Input
                  type="datetime-local"
                  aria-invalid={!!errors.startsAt}
                  {...register("startsAt")}
                />
                <FieldError error={errors.startsAt} />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.timeline.location}</span>
                <Input
                  placeholder={messages.timeline.location}
                  aria-invalid={!!errors.location}
                  {...register("location")}
                />
                <FieldError error={errors.location} />
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                <input type="checkbox" {...register("visibleToGuests")} />
                {messages.timeline.visibleToGuests}
              </label>
              <div className="flex gap-3">
                <Button
                  className="rounded-full"
                  type="submit"
                  disabled={isSubmitting}
                >
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
        {agenda.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-muted-copy)]">
            {messages.timeline.empty}
          </p>
        ) : null}
        {agenda.map((event) => (
          <Card
            key={event.id}
            id={`timeline-${event.id}`}
            className="scroll-mt-40 border-white/70 bg-white/85"
            onDoubleClick={() => {
              if (!canEditTimeline(viewerRole)) {
                return;
              }
              handleEdit(event);
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
                  <Button variant="outline" onClick={() => handleEdit(event)}>
                    {messages.guests.editButton}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!window.confirm(messages.common.confirmDelete)) {
                        return;
                      }
                      try {
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
                      } catch {
                        toast.error(messages.common.actionError);
                      }
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
