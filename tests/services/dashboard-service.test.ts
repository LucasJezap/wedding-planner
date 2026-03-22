import { vi } from "vitest";

import { getDashboardData } from "@/services/dashboard-service";
import * as timelineService from "@/services/timeline-service";

describe("dashboard-service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("builds dashboard summaries", async () => {
    const data = await getDashboardData();
    expect(data.countdownDays).toBeGreaterThan(0);
    expect(data.countdownHours).toBeGreaterThanOrEqual(0);
    expect(data.guestStats.total).toBe(6);
    expect(data.categorySpend).toHaveLength(4);
    expect(data.upcomingTasks.length).toBeGreaterThan(0);
    expect(data.expenseHighlights[0]?.planned).toBeGreaterThan(0);
    expect(data.pendingRsvps.length).toBeGreaterThan(0);
    expect(data.unseatedGuests.length).toBeGreaterThan(0);
    expect(data.vendorFollowUps.length).toBeGreaterThan(0);
    expect(data.vendorsMissingContact.length).toBeGreaterThan(0);
    expect(data.paymentAlerts.length).toBeGreaterThan(0);
    expect(data.upcomingPayments.length).toBeGreaterThan(0);
    expect(data.overdueTasks.length).toBeGreaterThan(0);
    expect(data.attentionStats.missingRsvp).toBeGreaterThan(0);
    expect(data.attentionStats.unseatedGuests).toBeGreaterThan(0);
    expect(data.attentionStats.overdueTasks).toBeGreaterThan(0);
    expect(data.attentionStats.vendorFollowUps).toBeGreaterThan(0);
    expect(data.attentionStats.overdueExpenses).toBeGreaterThanOrEqual(0);
    expect(data.decisionQueue.length).toBeGreaterThan(0);
    expect(data.quickActions.length).toBeGreaterThan(0);
    expect(data.responsibilityOptions.map((option) => option.id)).toEqual(
      expect.arrayContaining([
        "ALL",
        "TASK:BRIDE",
        "TASK:COUPLE",
        "TASK:WITNESSES",
      ]),
    );
    expect(data.vendorsMissingContact[0]?.name).toBe("Northlight Stories");
    expect(
      new Date(data.upcomingPayments[0]!.dueDate).getTime(),
    ).toBeGreaterThan(new Date("2026-04-10T12:00:00.000Z").getTime());
    expect(
      data.decisionQueue.some((item) => item.href.startsWith("/tasks#")),
    ).toBe(true);
    expect(data.overdueTasks[0]?.title).toBe("Approve invitation proof");
    expect(
      data.categorySpend.every(
        (category) =>
          typeof category.remaining === "number" &&
          typeof category.color === "string",
      ),
    ).toBe(true);
  });

  it("limits witness dashboard tasks to witness assignee", async () => {
    const data = await getDashboardData({ viewerRole: "WITNESS" });
    expect(data.viewerRole).toBe("WITNESS");
    expect(
      data.upcomingTasks.every((task) => task.assignee === "WITNESSES"),
    ).toBe(true);
    expect(
      data.todayFocus.tasks.every((task) => task.href.startsWith("/tasks")),
    ).toBe(true);
  });

  it("hides dashboard tasks for read-only accounts", async () => {
    const data = await getDashboardData({ viewerRole: "READ_ONLY" });
    expect(data.taskStats.total).toBe(0);
    expect(data.upcomingTasks).toHaveLength(0);
    expect(data.attentionTasks).toHaveLength(0);
  });

  it("falls back to the ceremony date when the timeline is empty", async () => {
    vi.spyOn(timelineService, "listTimelineEvents").mockResolvedValueOnce([]);
    const data = await getDashboardData();
    expect(data.countdownDays).toBeGreaterThanOrEqual(0);
  });
});
