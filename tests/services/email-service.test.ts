import { vi } from "vitest";

import { sendAccountInvitationEmail } from "@/services/email-service";

const sendMail = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail,
    })),
  },
}));

describe("email-service", () => {
  beforeEach(() => {
    sendMail.mockReset().mockResolvedValue(undefined);
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "mailer";
    process.env.SMTP_PASS = "secret";
    process.env.SMTP_FROM_EMAIL = "planner@example.com";
    process.env.SMTP_FROM_NAME = "Wedding Planner";
  });

  afterEach(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM_EMAIL;
    delete process.env.SMTP_FROM_NAME;
    vi.unstubAllEnvs();
  });

  it("sends a formatted invitation email", async () => {
    await sendAccountInvitationEmail({
      email: "guest@example.com",
      role: "READ_ONLY",
      activationUrl: "http://localhost:3000/activate?token=abc",
      coupleNames: "Kasia & Łukasz",
      expiresAt: "2026-04-01T12:00:00.000Z",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "guest@example.com",
        subject: expect.stringContaining("Kasia & Łukasz"),
        text: expect.stringContaining("/activate?token=abc"),
        html: expect.stringContaining("Potwierdź konto"),
      }),
    );
  });

  it("throws when SMTP configuration is missing", async () => {
    delete process.env.SMTP_HOST;
    vi.stubEnv("NODE_ENV", "production");

    await expect(
      sendAccountInvitationEmail({
        email: "guest@example.com",
        role: "WITNESS",
        activationUrl: "http://localhost:3000/activate?token=abc",
        coupleNames: "Kasia & Łukasz",
        expiresAt: "2026-04-01T12:00:00.000Z",
      }),
    ).rejects.toThrow("Invitation email is not configured");
  });

  it("skips delivery outside production when SMTP is missing", async () => {
    delete process.env.SMTP_HOST;

    await expect(
      sendAccountInvitationEmail({
        email: "guest@example.com",
        role: "WITNESS",
        activationUrl: "http://localhost:3000/activate?token=abc",
        coupleNames: "Kasia & Łukasz",
        expiresAt: "2026-04-01T12:00:00.000Z",
      }),
    ).resolves.toBeUndefined();
    expect(sendMail).not.toHaveBeenCalled();
  });
});
