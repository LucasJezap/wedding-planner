import { mapPreviewRows } from "@/features/import/hooks/use-import-preview";

describe("mapPreviewRows", () => {
  it("maps raw rows into import payloads", () => {
    const rows = mapPreviewRows(
      [
        {
          First: "Jane",
          Last: "Doe",
          Side: "Panna Młoda",
          Email: "jane@example.com",
          Phone: "123456",
          Diet: "Wege",
          Notes: "Hello",
          RSVP: "Potwierdzono",
          InvitationReceived: "☑",
          Payment: "50%",
          TransportToVenue: "Tak",
          TransportFromVenue: "☐",
        },
      ],
      {
        firstName: "First",
        lastName: "Last",
        side: "Side",
        email: "Email",
        phone: "Phone",
        dietaryRestrictions: "Diet",
        notes: "Notes",
        rsvpStatus: "RSVP",
        invitationReceived: "InvitationReceived",
        paymentCoverage: "Payment",
        transportToVenue: "TransportToVenue",
        transportFromVenue: "TransportFromVenue",
      },
    );

    expect(rows[0]?.firstName).toBe("Jane");
    expect(rows[0]?.side).toBe("BRIDE");
    expect(rows[0]?.dietaryRestrictions).toEqual(["VEGETARIAN"]);
    expect(rows[0]?.rsvpStatus).toBe("ATTENDING");
    expect(rows[0]?.invitationReceived).toBe(true);
    expect(rows[0]?.paymentCoverage).toBe("HALF");
    expect(rows[0]?.transportToVenue).toBe(true);
  });

  it("falls back to empty values when columns are missing", () => {
    const rows = mapPreviewRows(
      [
        {
          Unknown: "value",
        },
      ],
      {
        firstName: "First",
        lastName: "Last",
        side: "Side",
        email: "Email",
        phone: "Phone",
        dietaryRestrictions: "Diet",
        notes: "Notes",
        rsvpStatus: "RSVP",
        invitationReceived: "InvitationReceived",
        paymentCoverage: "Payment",
        transportToVenue: "TransportToVenue",
        transportFromVenue: "TransportFromVenue",
      },
    );

    expect(rows[0]).toMatchObject({
      firstName: "",
      lastName: "",
      side: "FRIENDS",
      email: "",
      phone: "",
      dietaryRestrictions: ["NONE"],
      rsvpStatus: "PENDING",
      paymentCoverage: "FULL",
      notes: "",
    });
  });

  it("maps alternative enum variants and unchecked booleans", () => {
    const rows = mapPreviewRows(
      [
        {
          Side: "Rodzina",
          Diet: "Wegan",
          RSVP: "Odmowa",
          Payment: "100%",
          InvitationReceived: "Nie",
          TransportToVenue: "0",
          TransportFromVenue: "☐",
        },
        {
          Side: "Pan Młody",
          Diet: "Brak",
          RSVP: "Oczekuje",
          Payment: "50%",
          InvitationReceived: "Tak",
          TransportToVenue: "☑",
          TransportFromVenue: "Tak",
        },
      ],
      {
        firstName: "First",
        lastName: "Last",
        side: "Side",
        email: "Email",
        phone: "Phone",
        dietaryRestrictions: "Diet",
        notes: "Notes",
        rsvpStatus: "RSVP",
        invitationReceived: "InvitationReceived",
        paymentCoverage: "Payment",
        transportToVenue: "TransportToVenue",
        transportFromVenue: "TransportFromVenue",
      },
    );

    expect(rows[0]).toMatchObject({
      side: "FAMILY",
      dietaryRestrictions: ["VEGAN"],
      rsvpStatus: "DECLINED",
      invitationReceived: false,
      transportToVenue: false,
      transportFromVenue: false,
    });
    expect(rows[1]).toMatchObject({
      side: "GROOM",
      dietaryRestrictions: ["NONE"],
      rsvpStatus: "PENDING",
      paymentCoverage: "HALF",
      invitationReceived: true,
      transportToVenue: true,
      transportFromVenue: true,
    });
  });
});
