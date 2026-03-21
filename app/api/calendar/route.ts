import { getRequiredSession } from "@/lib/require-auth";
import { getPlannerCalendarIcs } from "@/services/calendar-service";

export const GET = async () => {
  await getRequiredSession();

  return new Response(await getPlannerCalendarIcs(), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wedding-planner.ics"',
    },
  });
};
