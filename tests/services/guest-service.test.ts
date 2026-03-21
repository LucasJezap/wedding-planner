import {
  bulkDeleteGuests,
  bulkUpdateGuests,
  createGuest,
  deleteGuest,
  listGuests,
  listInvitationGroups,
  updateGuest,
} from "@/services/guest-service";

describe("guest-service", () => {
  it("lists seeded guests", async () => {
    await expect(listGuests()).resolves.toHaveLength(6);
  });

  it("builds invitation group summaries from seeded data", async () => {
    const groups = await listInvitationGroups();
    const hartFamily = groups.find((group) => group.name === "Hart Family");
    const coleFamily = groups.find((group) => group.name === "Cole Family");

    expect(hartFamily).toMatchObject({
      memberCount: 2,
      attendingCount: 2,
      pendingCount: 0,
      declinedCount: 0,
    });
    expect(hartFamily?.memberNames).toEqual(["Emma Hart", "Liam Hart"]);

    expect(coleFamily).toMatchObject({
      memberCount: 2,
      attendingCount: 0,
      pendingCount: 2,
      declinedCount: 0,
    });
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
      groupName: "Stone Household",
      invitedGuestCount: 2,
      allowsPlusOne: true,
      groupNotes: "Can confirm one guest later.",
    });

    expect(created.fullName).toBe("Amelia Stone");
    expect(created.groupName).toBe("Stone Household");
    expect(created.allowsPlusOne).toBe(true);

    const updated = await updateGuest(created.id, {
      rsvpStatus: "ATTENDING",
      invitationReceived: true,
      notes: "Now attending with joy",
    });

    expect(updated.rsvpStatus).toBe("ATTENDING");
    expect(updated.invitationReceived).toBe(true);
    expect(updated.notes).toContain("joy");

    const groups = await listInvitationGroups();
    expect(
      groups.find((group) => group.name === "Stone Household"),
    ).toBeTruthy();

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

  it("reuses and updates an existing invitation group", async () => {
    const emma = (await listGuests()).find(
      (guest) => guest.fullName === "Emma Hart",
    );
    expect(emma).toBeTruthy();

    const updated = await updateGuest(emma!.id, {
      groupName: "Cole Family",
      invitedGuestCount: 3,
      allowsPlusOne: true,
      groupNotes: "Merged household",
      rsvpStatus: "ATTENDING",
      dietaryRestrictions: ["VEGETARIAN"],
    });

    expect(updated.groupName).toBe("Cole Family");
    expect(updated.invitedGuestCount).toBe(3);
    expect(updated.allowsPlusOne).toBe(true);
    expect(updated.groupNotes).toBe("Merged household");

    const groups = await listInvitationGroups();
    expect(groups.find((group) => group.name === "Hart Family")).toBeTruthy();
    expect(groups.find((group) => group.name === "Cole Family")).toMatchObject({
      invitedGuestCount: 3,
      allowsPlusOne: true,
      notes: "Merged household",
    });
  });

  it("cleans up an invitation group when the last guest leaves it", async () => {
    const created = await createGuest({
      firstName: "Noel",
      lastName: "Ivy",
      side: "FRIENDS",
      rsvpStatus: "PENDING",
      dietaryRestrictions: ["NONE"],
      paymentCoverage: "FULL",
      invitationReceived: false,
      transportToVenue: false,
      transportFromVenue: false,
      email: "noel@example.com",
      phone: "+48 500 300 300",
      notes: "",
      groupName: "Ivy Household",
      invitedGuestCount: 1,
      allowsPlusOne: false,
      groupNotes: "",
    });

    await updateGuest(created.id, {
      groupName: "",
      invitedGuestCount: 1,
      allowsPlusOne: false,
      groupNotes: "",
    });

    const groups = await listInvitationGroups();
    expect(groups.find((group) => group.name === "Ivy Household")).toBeFalsy();
  });

  it("bulk updates guests into a shared group and removes emptied groups", async () => {
    const initialGuests = await listGuests();
    const henry = initialGuests.find(
      (guest) => guest.fullName === "Henry Cole",
    );
    const sofia = initialGuests.find(
      (guest) => guest.fullName === "Sofia Cole",
    );

    expect(henry).toBeTruthy();
    expect(sofia).toBeTruthy();

    const updatedGuests = await bulkUpdateGuests([henry!.id, sofia!.id], {
      rsvpStatus: "ATTENDING",
      groupName: "Mills Household",
      invitedGuestCount: 2,
      allowsPlusOne: false,
      groupNotes: "Moved in bulk",
    });

    expect(
      updatedGuests.filter((guest) => guest.groupName === "Mills Household"),
    ).toHaveLength(2);

    const groups = await listInvitationGroups();
    expect(groups.find((group) => group.name === "Cole Family")).toBeFalsy();
    expect(
      groups.find((group) => group.name === "Mills Household"),
    ).toMatchObject({
      memberCount: 2,
      invitedGuestCount: 2,
      notes: "Moved in bulk",
    });
  });

  it("bulk deletes guests and removes affected empty invitation groups", async () => {
    const createdA = await createGuest({
      firstName: "Ava",
      lastName: "Pine",
      side: "FRIENDS",
      rsvpStatus: "PENDING",
      dietaryRestrictions: ["NONE"],
      paymentCoverage: "FULL",
      invitationReceived: false,
      transportToVenue: false,
      transportFromVenue: false,
      email: "ava@example.com",
      phone: "+48 500 410 410",
      notes: "",
      groupName: "Pine Household",
      invitedGuestCount: 2,
      allowsPlusOne: false,
      groupNotes: "",
    });
    const createdB = await createGuest({
      firstName: "Milo",
      lastName: "Pine",
      side: "FRIENDS",
      rsvpStatus: "PENDING",
      dietaryRestrictions: ["NONE"],
      paymentCoverage: "FULL",
      invitationReceived: false,
      transportToVenue: false,
      transportFromVenue: false,
      email: "milo@example.com",
      phone: "+48 500 420 420",
      notes: "",
      groupName: "Pine Household",
      invitedGuestCount: 2,
      allowsPlusOne: false,
      groupNotes: "",
    });

    await bulkDeleteGuests([createdA.id, createdB.id]);

    const groups = await listInvitationGroups();
    const guests = await listGuests();
    expect(groups.find((group) => group.name === "Pine Household")).toBeFalsy();
    expect(guests.find((guest) => guest.id === createdA.id)).toBeFalsy();
    expect(guests.find((guest) => guest.id === createdB.id)).toBeFalsy();
  });
});
