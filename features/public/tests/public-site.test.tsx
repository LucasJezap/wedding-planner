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
          status: guest.rsvpStatus,
          dietaryRestrictions: guest.dietaryRestrictions,
          transportToVenue: guest.transportToVenue,
          transportFromVenue: guest.transportFromVenue,
        },
        message: "ok",
      })
      .mockResolvedValueOnce({
        guest: {
          id: guest.id,
          name: guest.fullName,
          status: "ATTENDING",
          dietaryRestrictions: guest.dietaryRestrictions,
          transportToVenue: guest.transportToVenue,
          transportFromVenue: guest.transportFromVenue,
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
    expect(
      screen.getByRole("link", { name: "Panel admina" }),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("Wpisz token RSVP"),
      guest.rsvpToken,
    );
    await user.click(screen.getByRole("button", { name: "Pokaż moje RSVP" }));
    await user.click(screen.getByRole("button", { name: "Wyślij RSVP" }));

    await waitFor(() => expect(apiClient).toHaveBeenCalled());
    expect(
      screen.getByText("Dziękujemy, odpowiedź RSVP została zapisana."),
    ).toBeInTheDocument();
  });
});
