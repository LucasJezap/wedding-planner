import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { PublicSite } from "@/features/public/components/public-site";
import { apiClient } from "@/lib/api-client";
import { getPublicWeddingView } from "@/services/public-site-service";
import { listGuests } from "@/services/guest-service";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("PublicSite", () => {
  it("renders schedule and submits RSVP after token lookup", async () => {
    const data = await getPublicWeddingView();
    const guest = (await listGuests())[0]!;
    vi.mocked(apiClient)
      .mockResolvedValueOnce({
        guest: {
          id: guest.id,
          name: guest.fullName,
          status: "ATTENDING",
          guestCount: 2,
          attendingChildren: 1,
          plusOneName: "",
          mealChoice: "",
          dietaryNotes: "",
          needsAccommodation: false,
          dietaryRestrictions: guest.dietaryRestrictions,
          transportToVenue: guest.transportToVenue,
          transportFromVenue: guest.transportFromVenue,
          message: "",
        },
        invitationGroup: {
          id: "group-hart",
          name: "Hart Family",
          invitedGuestCount: 2,
          allowsPlusOne: false,
          sharedResponse: true,
          members: [
            { id: guest.id, name: guest.fullName, status: guest.rsvpStatus },
            { id: "guest-2", name: "Liam Hart", status: guest.rsvpStatus },
          ],
        },
        message: "ok",
      })
      .mockResolvedValueOnce({
        guest: {
          id: guest.id,
          name: guest.fullName,
          status: "ATTENDING",
          guestCount: 2,
          attendingChildren: 1,
          plusOneName: "Alex Hart",
          mealChoice: "Vegetarian tasting menu",
          dietaryNotes: "No peanuts",
          needsAccommodation: true,
          dietaryRestrictions: guest.dietaryRestrictions,
          transportToVenue: true,
          transportFromVenue: true,
          message: "See you soon",
        },
        invitationGroup: {
          id: "group-hart",
          name: "Hart Family",
          invitedGuestCount: 2,
          allowsPlusOne: false,
          sharedResponse: true,
          members: [
            { id: guest.id, name: guest.fullName, status: "ATTENDING" },
            { id: "guest-2", name: "Liam Hart", status: "ATTENDING" },
          ],
        },
        message: "ok",
      });
    render(
      <PublicSite
        initialData={data}
        adminHref="/login"
        adminLabel="Panel admina"
      />,
    );

    expect(screen.getByText("Plan dnia")).toBeInTheDocument();
    expect(screen.getByText("Informacje organizacyjne")).toBeInTheDocument();
    expect(screen.getAllByText("Parking").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "Dodaj do kalendarza" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Panel admina" }),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("Wpisz token RSVP"),
      guest.rsvpToken,
    );
    await user.click(screen.getByRole("button", { name: "Pokaż moje RSVP" }));
    expect(screen.getByText("Grupa zaproszenia")).toBeInTheDocument();
    expect(
      screen.getByText(
        "To RSVP zapisze wspólną odpowiedź dla 2 osób przypisanych do tego zaproszenia.",
      ),
    ).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText(
        "Np. menu klasyczne, wegetariańskie lub dziecięce",
      ),
      "Vegetarian tasting menu",
    );
    await user.type(
      screen.getByPlaceholderText(
        "Opisz alergie, ograniczenia lub dodatkowe potrzeby żywieniowe",
      ),
      "No peanuts",
    );
    await user.click(
      screen.getByLabelText("Potrzebuję informacji o noclegu / noclegu"),
    );
    await user.click(screen.getByLabelText("Potrzebuję transportu na miejsce"));
    await user.click(screen.getByLabelText("Potrzebuję transportu powrotnego"));
    await user.type(
      screen.getByPlaceholderText(
        "Dodaj krótką wiadomość, pytanie lub ważną informację",
      ),
      "See you soon",
    );
    expect(screen.getByText("Potwierdzasz: 2 osoby.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Wyślij RSVP" }));

    await waitFor(() => expect(apiClient).toHaveBeenCalled());
    expect(vi.mocked(apiClient).mock.calls[1]?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        token: guest.rsvpToken,
        status: "ATTENDING",
        guestCount: 2,
        attendingChildren: 1,
        plusOneName: "",
        mealChoice: "Vegetarian tasting menu",
        dietaryNotes: "No peanuts",
        needsAccommodation: true,
        transportToVenue: true,
        transportFromVenue: true,
        message: "See you soon",
      }),
    });
    expect(
      screen.getByText("Dziękujemy, odpowiedź RSVP została zapisana."),
    ).toBeInTheDocument();
    expect(screen.getByText("Hart Family")).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Oczekuje" }),
    ).not.toBeInTheDocument();
  }, 10000);
});
