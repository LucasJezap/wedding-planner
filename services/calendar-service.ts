import { buildIcsCalendar } from "@/lib/calendar";
import { getRepository } from "@/db/repositories";
import { listTasks } from "@/services/task-service";
import { listTimelineEvents } from "@/services/timeline-service";

export const getPlannerCalendarIcs = async (): Promise<string> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const [timelineEvents, tasks] = await Promise.all([
    listTimelineEvents(),
    listTasks(),
  ]);

  return buildIcsCalendar({
    calendarName: `${wedding.title} Planner`,
    prodId: "-//Wedding Planner//Planner Calendar//EN",
    entries: [
      ...timelineEvents.map((event) => ({
        uid: `timeline-${event.id}@wedding-planner`,
        title: event.title,
        startsAt: event.startsAt,
        description: event.description,
        location: event.location,
      })),
      ...tasks
        .filter((task) => task.status !== "DONE")
        .map((task) => ({
          uid: `task-${task.id}@wedding-planner`,
          title: `Task: ${task.title}`,
          startsAt: task.dueDate,
          description: [
            task.description,
            `Status: ${task.status}`,
            `Priority: ${task.priority}`,
            `Assignee: ${task.assignee}`,
            task.notes ? `Notes: ${task.notes}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        })),
    ],
  });
};

export const getPublicCalendarIcs = async (): Promise<string> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const timelineEvents = (await listTimelineEvents()).filter(
    (event) => event.visibleToGuests,
  );

  return buildIcsCalendar({
    calendarName: `${wedding.title} Guest Schedule`,
    prodId: "-//Wedding Planner//Public Schedule//EN",
    entries: timelineEvents.map((event) => ({
      uid: `public-timeline-${event.id}@wedding-planner`,
      title: event.title,
      startsAt: event.startsAt,
      description: event.description,
      location: event.location,
    })),
  });
};
