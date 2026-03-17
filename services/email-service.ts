import nodemailer from "nodemailer";

import type { UserRole } from "@/lib/planner-domain";

type InvitationEmailInput = {
  email: string;
  role: UserRole;
  activationUrl: string;
  coupleNames: string;
  expiresAt: string;
};

const getMailerConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME ?? "Wedding Planner";

  if (!host || !user || !pass || !fromEmail || Number.isNaN(port)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invitation email is not configured");
    }
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    from: `${fromName} <${fromEmail}>`,
  };
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrator",
  WITNESS: "Świadek",
  READ_ONLY: "Podgląd",
};

export const sendAccountInvitationEmail = async (
  input: InvitationEmailInput,
) => {
  if (process.env.INVITATION_EMAIL_MODE === "skip") {
    return;
  }
  const config = getMailerConfig();
  if (!config) {
    return;
  }
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    connectionTimeout: 3000,
    greetingTimeout: 3000,
    socketTimeout: 5000,
  });
  const subject = `${input.coupleNames} zapraszają Cię do Wedding Plannera`;

  try {
    await transporter.sendMail({
      from: config.from,
      to: input.email,
      subject,
      text: [
        `Cześć,`,
        ``,
        `${input.coupleNames} zapraszają Cię do planera ślubnego jako: ${roleLabels[input.role]}.`,
        `Kliknij link, aby potwierdzić konto i ustawić hasło:`,
        input.activationUrl,
        ``,
        `Link jest ważny do ${new Date(input.expiresAt).toLocaleString("pl-PL")}.`,
      ].join("\n"),
      html: `
        <div style="margin:0;padding:32px 16px;background:#f9f1ec;font-family:Georgia,'Times New Roman',serif;color:#49363e;">
          <table role="presentation" style="max-width:640px;width:100%;margin:0 auto;border-spacing:0;background:#fffaf7;border:1px solid #efd8cf;border-radius:28px;overflow:hidden;">
            <tr>
              <td style="padding:40px 40px 24px;background:linear-gradient(135deg,#fff7f2,#f6ebe5);">
                <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:#b27988;">Zaproszenie do planera</p>
                <h1 style="margin:0;font-size:38px;line-height:1.15;font-weight:500;">Dołącz do organizacji ślubu</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 40px;">
                <p style="margin:0 0 16px;font-size:17px;line-height:1.7;">Cześć,</p>
                <p style="margin:0 0 16px;font-size:17px;line-height:1.7;">
                  <strong>${input.coupleNames}</strong> zapraszają Cię do Wedding Plannera jako <strong>${roleLabels[input.role]}</strong>.
                </p>
                <p style="margin:0 0 24px;font-size:17px;line-height:1.7;">
                  Kliknij poniższy przycisk, aby potwierdzić konto i ustawić własne hasło.
                </p>
                <div style="margin:0 0 24px;">
                  <a href="${input.activationUrl}" style="display:inline-block;padding:15px 28px;border-radius:999px;background:#c68495;color:#fffaf7;text-decoration:none;font-size:15px;font-weight:600;">
                    Potwierdź konto
                  </a>
                </div>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#7a6269;">
                  Jeśli przycisk nie działa, skopiuj ten adres do przeglądarki:
                </p>
                <p style="margin:0 0 24px;word-break:break-word;font-size:14px;line-height:1.7;color:#7a6269;">
                  <a href="${input.activationUrl}" style="color:#9b5a74;text-decoration:none;">${input.activationUrl}</a>
                </p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#7a6269;">
                  Link jest ważny do <strong>${new Date(input.expiresAt).toLocaleString("pl-PL")}</strong>.
                </p>
              </td>
            </tr>
          </table>
        </div>
      `,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
};
