import {
  createGuest,
  deleteGuest,
  listGuests,
  updateGuest,
} from "@/services/guest-service";

describe("guest-service", () => {
  it("lists seeded guests", async () => {
    await expect(listGuests()).resolves.toHaveLength(6);
  });

  it("creates, updates, and deletes guests", async () => {
    const created = await createGuest({
      firstName: "Amelia",
      lastName: "Stone",
      side: "FRIENDS",
      rsvpStatus: "PENDING",
      dietaryRestrictions: ["VEGETARIAN"],
      paymentCoverage: "HALF",
      invitationReceived: false,
      transportToVenue: true,
      transportFromVenue: false,
      email: "amelia@example.com",
      phone: "+48 500 999 999",
      notes: "Childhood friend",
    });

    expect(created.fullName).toBe("Amelia Stone");

    const updated = await updateGuest(created.id, {
      rsvpStatus: "ATTENDING",
      invitationReceived: true,
      notes: "Now attending with joy",
    });

    expect(updated.rsvpStatus).toBe("ATTENDING");
    expect(updated.invitationReceived).toBe(true);
    expect(updated.notes).toContain("joy");

    await deleteGuest(created.id);
    await expect(listGuests()).resolves.toHaveLength(6);
  });

  it("rejects invalid guest input", async () => {
    await expect(
      createGuest({
        firstName: "",
        lastName: "Stone",
        side: "FRIENDS",
        rsvpStatus: "PENDING",
        dietaryRestrictions: [],
        paymentCoverage: "FULL",
        transportToVenue: false,
        transportFromVenue: false,
        email: "bad-email",
        phone: "",
        notes: "",
      }),
    ).rejects.toThrow();
  });

  it("throws when updating a missing guest", async () => {
    await expect(updateGuest("missing", { firstName: "Nope" })).rejects.toThrow(
      "Guest not found",
    );
  });
});
