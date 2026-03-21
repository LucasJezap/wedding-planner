import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { GuestManager } from "@/features/guests/components/guest-manager";
import { apiClient } from "@/lib/api-client";
import { listGuests, listInvitationGroups } from "@/services/guest-service";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

describe("GuestManager", () => {
  it("renders guests and creates a new one", async () => {
    const guests = await listGuests();
    const groups = await listInvitationGroups();
    vi.mocked(apiClient).mockResolvedValueOnce({
      ...guests[0]!,
      id: "new-guest",
      firstName: "Ruby",
      lastName: "Lane",
      fullName: "Ruby Lane",
      invitationReceived: false,
      email: "ruby@example.com",
      phone: "+48 500 500 500",
      notes: "New guest",
      groupName: "Lane Household",
      invitedGuestCount: 2,
      allowsPlusOne: true,
      groupNotes: "Family invite",
    });
    vi.mocked(apiClient).mockResolvedValueOnce(groups);

    render(
      <GuestManager
        initialGuests={guests}
        initialGroups={groups}
        viewerRole="ADMIN"
      />,
    );

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Imię"), "Ruby");
    await user.type(screen.getByPlaceholderText("Nazwisko"), "Lane");
    await user.type(screen.getByPlaceholderText("Email"), "ruby@example.com");
    await user.type(screen.getByPlaceholderText("Telefon"), "+48 500 500 500");
    await user.type(screen.getByPlaceholderText("Grupa"), "Lane Household");
    await user.click(screen.getByRole("button", { name: "Utwórz gościa" }));

    await waitFor(() =>
      expect(apiClient).toHaveBeenCalledWith(
        "/api/guests",
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(screen.getByText("Ruby Lane")).toBeInTheDocument();
    expect(screen.getAllByText("Zaproszenie doręczone").length).toBeGreaterThan(
      0,
    );
  }, 10000);

  it("hides guest editing controls for read-only roles", async () => {
    render(
      <GuestManager
        initialGuests={await listGuests()}
        initialGroups={await listInvitationGroups()}
        viewerRole="READ_ONLY"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Edytuj" }),
    ).not.toBeInTheDocument();
  });
});
