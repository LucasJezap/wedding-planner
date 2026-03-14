import {
  getPublicWeddingView,
  lookupPublicGuest,
  submitPublicRsvp,
} from "@/services/public-site-service";
import { listGuests } from "@/services/guest-service";
import { updateTimelineEvent } from "@/services/timeline-service";

describe("public-site-service", () => {
  it("returns public wedding details", async () => {
    const viewBefore = await getPublicWeddingView();
    await updateTimelineEvent(viewBefore.timeline[0]!.id, {
      visibleToGuests: false,
    });
    const view = await getPublicWeddingView();
    expect(view.wedding.title).toBe("Olivia & Daniel");
    expect(view.timeline).toHaveLength(2);
    expect(view.timeline.every((event) => event.visibleToGuests)).toBe(true);
  });

  it("looks up and updates a guest RSVP by token", async () => {
    const guest = (await listGuests())[0]!;
    const lookup = await lookupPublicGuest({ token: guest.rsvpToken });
    expect(lookup.guest.name).toBe(guest.fullName);

    const updated = await submitPublicRsvp({
      token: guest.rsvpToken,
      status: "DECLINED",
      guestCount: 1,
    });

    expect(updated.guest.status).toBe("DECLINED");
  });

  it("throws when a guest token does not exist", async () => {
    await expect(lookupPublicGuest({ token: "MISSING" })).rejects.toThrow(
      "Guest not found",
    );
    await expect(
      submitPublicRsvp({
        token: "MISSING",
        status: "ATTENDING",
        guestCount: 1,
      }),
    ).rejects.toThrow("Guest not found");
  });
});
