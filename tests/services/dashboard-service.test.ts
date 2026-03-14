import { vi } from "vitest";

import { getDashboardData } from "@/services/dashboard-service";
import * as timelineService from "@/services/timeline-service";

describe("dashboard-service", () => {
  it("builds dashboard summaries", async () => {
    const data = await getDashboardData();
    expect(data.countdownDays).toBeGreaterThan(0);
    expect(data.countdownHours).toBeGreaterThanOrEqual(0);
    expect(data.guestStats.total).toBe(6);
    expect(data.categorySpend).toHaveLength(4);
    expect(data.upcomingTasks.length).toBeGreaterThan(0);
    expect(data.expenseHighlights[0]?.planned).toBeGreaterThan(0);
    expect(
      data.categorySpend.every(
        (category) => typeof category.remaining === "number",
      ),
    ).toBe(true);
  });

  it("limits witness dashboard tasks to witness assignee", async () => {
    const data = await getDashboardData({ viewerRole: "WITNESS" });
    expect(data.viewerRole).toBe("WITNESS");
    expect(
      data.upcomingTasks.every((task) => task.assignee === "WITNESSES"),
    ).toBe(true);
  });

  it("falls back to the ceremony date when the timeline is empty", async () => {
    vi.spyOn(timelineService, "listTimelineEvents").mockResolvedValueOnce([]);
    const data = await getDashboardData();
    expect(data.countdownDays).toBeGreaterThanOrEqual(0);
  });
});
