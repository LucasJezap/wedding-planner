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
    expect(view.logistics.length).toBeGreaterThan(0);
    expect(view.logistics.some((item) => item.id === "parking")).toBe(true);
    expect(new Date(view.rsvpDeadline).getTime()).toBeLessThan(
      new Date(view.ceremonyDate).getTime(),
    );
    expect(view.recommendedArrivalTime).toBeDefined();
  });

  it("looks up and updates a guest RSVP by token", async () => {
    const guest = (await listGuests())[0]!;
    const lookup = await lookupPublicGuest({ token: guest.rsvpToken });
    expect(lookup.guest.name).toBe(guest.fullName);
    expect(lookup.guest.guestCount).toBe(2);
    expect(lookup.invitationGroup?.name).toBe(guest.groupName);
    expect(lookup.invitationGroup?.members).toHaveLength(2);

    const updated = await submitPublicRsvp({
      token: guest.rsvpToken,
      status: "DECLINED",
      guestCount: 2,
      attendingChildren: 1,
      plusOneName: "Alex Hart",
      mealChoice: "Vegetarian tasting menu",
      dietaryNotes: "No peanuts please.",
      needsAccommodation: true,
      transportToVenue: true,
      transportFromVenue: true,
      message: "We are excited to celebrate with you.",
    });

    expect(updated.guest.status).toBe("DECLINED");
    expect(updated.guest.guestCount).toBe(2);
    expect(updated.guest.attendingChildren).toBe(1);
    expect(updated.guest.plusOneName).toBe("Alex Hart");
    expect(updated.guest.needsAccommodation).toBe(true);
    expect(updated.guest.transportToVenue).toBe(true);
    expect(updated.guest.message).toContain("excited");
    expect(
      updated.invitationGroup?.members.every(
        (member) => member.status === "DECLINED",
      ),
    ).toBe(true);
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
        attendingChildren: 0,
        plusOneName: "",
        mealChoice: "",
        dietaryNotes: "",
        needsAccommodation: false,
        transportToVenue: false,
        transportFromVenue: false,
        message: "",
      }),
    ).rejects.toThrow("Guest not found");
  });
});
