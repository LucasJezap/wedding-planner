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

    render(<AccessManager initialUsers={seed.users} initialInvitations={[]} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "new-user@example.com");
    await user.click(
      screen.getByRole("button", { name: "Wyślij zaproszenie" }),
    );

    await waitFor(() => expect(apiClient).toHaveBeenCalled());
    expect(screen.getByText("Ostatni link aktywacyjny")).toBeInTheDocument();
    expect(screen.getByText(/activate\?token=token-123/)).toBeInTheDocument();
  });
});
