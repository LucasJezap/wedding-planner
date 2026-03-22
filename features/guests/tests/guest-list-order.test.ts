import { sortGuestsForList } from "@/features/guests/lib/guest-list-order";
import type { GuestView } from "@/lib/planner-domain";

const createGuest = (
  id: string,
  fullName: string,
  groupName: string,
): GuestView => {
  const [firstName, lastName] = fullName.split(" ");

  return {
    id,
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    fullName,
    side: "FAMILY",
    rsvpStatus: "PENDING",
    rsvpToken: `token-${id}`,
    dietaryRestrictions: ["NONE"],
    paymentCoverage: "FULL",
    invitationReceived: false,
    transportToVenue: false,
    transportFromVenue: false,
    email: "",
    phone: "",
    notes: "",
    groupName,
    invitedGuestCount: 2,
    allowsPlusOne: false,
    groupNotes: "",
  };
};

describe("sortGuestsForList", () => {
  it("sorts numeric group names in natural order", () => {
    const sorted = sortGuestsForList([
      createGuest("g10", "Jan Dziesiaty", "Grupa 10"),
      createGuest("g2", "Jan Drugi", "Grupa 2"),
      createGuest("g1", "Jan Pierwszy", "Grupa 1"),
      createGuest("g3", "Jan Trzeci", "Grupa 3"),
    ]);

    expect(sorted.map((guest) => guest.groupName)).toEqual([
      "Grupa 1",
      "Grupa 2",
      "Grupa 3",
      "Grupa 10",
    ]);
  });
});
