import { mapPreviewRows } from "@/features/import/hooks/use-import-preview";

describe("mapPreviewRows", () => {
  it("maps raw rows into import payloads", () => {
    const rows = mapPreviewRows(
      [
        {
          First: "Jane",
          Last: "Doe",
          Side: "BRIDE",
          Email: "jane@example.com",
          Phone: "123456",
          Diet: "Vegetarian",
          Notes: "Hello",
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
      },
    );

    expect(rows[0]?.firstName).toBe("Jane");
    expect(rows[0]?.dietaryRestrictions).toEqual(["Vegetarian"]);
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
      },
    );

    expect(rows[0]).toMatchObject({
      firstName: "",
      lastName: "",
      side: "FRIENDS",
      email: "",
      phone: "",
      dietaryRestrictions: [],
      notes: "",
    });
  });
});
