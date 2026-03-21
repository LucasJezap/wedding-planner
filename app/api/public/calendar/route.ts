import { getPublicCalendarIcs } from "@/services/calendar-service";

export const GET = async () => {
  return new Response(await getPublicCalendarIcs(), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wedding-schedule.ics"',
    },
  });
};
