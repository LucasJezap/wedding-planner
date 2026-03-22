import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { AccessManager } from "@/features/access/components/access-manager";
import { apiClient } from "@/lib/api-client";
import { createPlannerSeed } from "@/lib/planner-seed";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

describe("AccessManager", () => {
  it("creates an invitation and shows the activation link", async () => {
    const seed = createPlannerSeed();
    vi.mocked(apiClient).mockResolvedValueOnce({
      id: "invitation-1",
      weddingId: seed.wedding.id,
      email: "new-user@example.com",
      role: "WITNESS",
      token: "token-123",
      expiresAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activationUrl: "http://localhost:3000/activate?token=token-123",
    });

    render(
      <AccessManager
        initialUsers={seed.users}
        initialInvitations={[]}
        currentUserId={seed.users[0]!.id}
        viewerRole="ADMIN"
        canManageAccess
      />,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "new-user@example.com");
    await user.click(
      screen.getByRole("button", { name: "Wyślij zaproszenie" }),
    );

    await waitFor(() => expect(apiClient).toHaveBeenCalled());
    expect(screen.getByText("Ostatni link aktywacyjny")).toBeInTheDocument();
    expect(screen.getByText(/activate\?token=token-123/)).toBeInTheDocument();
  });

  it("edits an existing user", async () => {
    const seed = createPlannerSeed();
    const targetUser = seed.users[1]!;
    vi.mocked(apiClient).mockResolvedValueOnce({
      ...targetUser,
      name: "Nowy Swiadek",
      email: "witness-updated@example.com",
    });

    render(
      <AccessManager
        initialUsers={seed.users}
        initialInvitations={[]}
        currentUserId={targetUser.id}
        viewerRole="WITNESS"
        canManageAccess={false}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Edytuj konto" }));
    await user.clear(screen.getByDisplayValue(targetUser.name));
    await user.type(screen.getByLabelText("Imię i nazwisko"), "Nowy Swiadek");
    await user.clear(screen.getByDisplayValue(targetUser.email));
    await user.type(
      screen.getByLabelText("Email"),
      "witness-updated@example.com",
    );
    await user.type(screen.getByLabelText("Hasło"), "newpassword");
    await user.type(screen.getByLabelText("Powtórz hasło"), "newpassword");
    await user.click(screen.getByRole("button", { name: "Zapisz konto" }));

    await waitFor(() =>
      expect(apiClient).toHaveBeenCalledWith(
        `/api/access/${targetUser.id}`,
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining('"name":"Nowy Swiadek"'),
        }),
      ),
    );
    expect(screen.getByText("Nowy Swiadek")).toBeInTheDocument();
  });
});
