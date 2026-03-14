import {
  createTimelineEvent,
  deleteTimelineEvent,
  listTimelineEvents,
  updateTimelineEvent,
} from "@/services/timeline-service";

describe("timeline-service", () => {
  it("creates, updates, and deletes a timeline event", async () => {
    const created = await createTimelineEvent({
      title: "Late night bites",
      description: "Mini desserts for the dance floor break.",
      startsAt: "2026-09-19T21:30:00.000Z",
      location: "Dessert station",
      visibleToGuests: true,
    });

    expect(created.title).toBe("Late night bites");

    const updated = await updateTimelineEvent(created.id, {
      location: "Glasshouse lounge",
    });
    expect(updated.location).toBe("Glasshouse lounge");

    await deleteTimelineEvent(created.id);
    await expect(listTimelineEvents()).resolves.toHaveLength(3);
  });

  it("throws when updating a missing event", async () => {
    await expect(
      updateTimelineEvent("missing", { title: "Ghost event" }),
    ).rejects.toThrow("Timeline event not found");
  });
});
