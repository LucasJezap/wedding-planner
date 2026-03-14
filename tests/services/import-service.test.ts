import { importGuests } from "@/services/import-service";
import { listGuests } from "@/services/guest-service";

describe("import-service", () => {
  it("imports validated guest rows", async () => {
    const guests = await importGuests({
      rows: [
        {
          firstName: "Mia",
          lastName: "Fox",
          side: "FRIENDS",
          email: "mia@example.com",
          phone: "+48 123 456 789",
          dietaryRestrictions: [],
          invitationReceived: true,
          notes: "From university",
        },
      ],
    });

    expect(guests.some((guest) => guest.fullName === "Mia Fox")).toBe(true);
    expect(
      guests.find((guest) => guest.fullName === "Mia Fox")?.invitationReceived,
    ).toBe(true);
    await expect(listGuests()).resolves.toHaveLength(7);
  });

  it("applies defaults for optional import columns", async () => {
    const guests = await importGuests({
      rows: [
        {
          firstName: "Ola",
          lastName: "Sky",
          side: "FRIENDS",
          email: "ola@example.com",
          phone: "+48 555 111 222",
          dietaryRestrictions: [],
          notes: "",
        },
      ],
    });

    const guest = guests.find((candidate) => candidate.fullName === "Ola Sky");
    expect(guest?.invitationReceived).toBe(false);
    expect(guest?.paymentCoverage).toBe("FULL");
  });
});
