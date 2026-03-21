import {
  getPlannerCalendarIcs,
  getPublicCalendarIcs,
} from "@/services/calendar-service";

describe("calendar-service", () => {
  it("builds planner calendar export with tasks and timeline", async () => {
    const result = await getPlannerCalendarIcs();

    expect(result).toContain("BEGIN:VCALENDAR");
    expect(result).toContain("SUMMARY:Guest arrival");
    expect(result).toContain("SUMMARY:Task: Confirm final menu tasting");
  });

  it("builds public calendar export without internal tasks", async () => {
    const result = await getPublicCalendarIcs();

    expect(result).toContain("BEGIN:VCALENDAR");
    expect(result).toContain("SUMMARY:Guest arrival");
    expect(result).not.toContain("Task: Confirm final menu tasting");
  });
});
