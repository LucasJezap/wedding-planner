import { vi } from "vitest";

import {
  acceptInvitation,
  authenticateUser,
  createAccountInvitation,
  listAccounts,
  listAccountInvitations,
  updateAccountRole,
} from "@/services/auth-service";
import { DEMO_CREDENTIALS } from "@/lib/planner-seed";

vi.mock("@/services/email-service", () => ({
  sendAccountInvitationEmail: vi.fn().mockResolvedValue(undefined),
}));

const invitationInput = (
  email: string,
  role: "ADMIN" | "WITNESS" | "READ_ONLY",
) => ({
  weddingId: "wedding-luna-fern",
  email,
  role,
  activationOrigin: "http://localhost:3000",
  coupleNames: "Kasia & Łukasz",
});

describe("authenticateUser", () => {
  it("returns the planner when credentials are valid", async () => {
    await expect(
      authenticateUser(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password),
    ).resolves.toMatchObject({
      email: DEMO_CREDENTIALS.email,
      name: DEMO_CREDENTIALS.name,
    });
  });

  it("returns null for a bad password", async () => {
    await expect(
      authenticateUser(DEMO_CREDENTIALS.email, "wrong-password"),
    ).resolves.toBeNull();
  });

  it("returns null for an unknown email", async () => {
    await expect(
      authenticateUser("missing@example.com", DEMO_CREDENTIALS.password),
    ).resolves.toBeNull();
  });

  it("creates and updates managed accounts", async () => {
    const invitation = await createAccountInvitation({
      ...invitationInput("readonly@example.com", "READ_ONLY"),
    });

    expect(invitation.role).toBe("READ_ONLY");
    expect(
      (await listAccountInvitations()).some(
        (item) => item.email === "readonly@example.com",
      ),
    ).toBe(true);

    const created = await acceptInvitation({
      token: invitation.token,
      name: "Read Only Demo",
      password: "Avatar3232!",
      confirmPassword: "Avatar3232!",
    });
    expect(
      (await listAccounts()).some((user) => user.email === created.email),
    ).toBe(true);

    const updated = await updateAccountRole(created.id, "WITNESS");
    expect(updated.role).toBe("WITNESS");
    expect(
      (await listAccountInvitations()).some(
        (item) => item.email === "readonly@example.com",
      ),
    ).toBe(false);
  });

  it("rejects inviting an existing account", async () => {
    await expect(
      createAccountInvitation({
        ...invitationInput(DEMO_CREDENTIALS.email, "ADMIN"),
      }),
    ).rejects.toThrow("Account already exists");
  });

  it("rejects invalid invitation activations", async () => {
    await expect(
      acceptInvitation({
        token: "missing-token",
        name: "Ghost User",
        password: "Avatar3232!",
        confirmPassword: "Avatar3232!",
      }),
    ).rejects.toThrow("Invitation not found");

    const accepted = await createAccountInvitation({
      ...invitationInput("accepted@example.com", "WITNESS"),
    });
    await acceptInvitation({
      token: accepted.token,
      name: "Accepted User",
      password: "Avatar3232!",
      confirmPassword: "Avatar3232!",
    });
    await expect(
      acceptInvitation({
        token: accepted.token,
        name: "Accepted User",
        password: "Avatar3232!",
        confirmPassword: "Avatar3232!",
      }),
    ).rejects.toThrow("Invitation already accepted");

    const expired = await createAccountInvitation({
      ...invitationInput("expired@example.com", "READ_ONLY"),
    });
    const invitations = await listAccountInvitations();
    const expiredInvitation = invitations.find(
      (item) => item.id === expired.id,
    )!;
    expiredInvitation.expiresAt = "2000-01-01T00:00:00.000Z";

    await expect(
      acceptInvitation({
        token: expired.token,
        name: "Expired User",
        password: "Avatar3232!",
        confirmPassword: "Avatar3232!",
      }),
    ).rejects.toThrow("Invitation expired");
  });
});
