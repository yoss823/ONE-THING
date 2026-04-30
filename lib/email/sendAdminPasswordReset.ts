import { Resend } from "resend";

import { getEmailFrom } from "@/lib/email/sender";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

export async function sendAdminPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  const resend = getResendClient();
  const base = tryResolvePublicBaseUrl();
  const subject = "Reset your ONE THING admin password";
  const text = [
    "You asked to reset the password for your ONE THING admin account.",
    "",
    `Open this link (valid for one hour): ${resetUrl}`,
    "",
    "If you did not request this, you can ignore this email.",
    base ? `Site: ${base}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await resend.emails.send({
    from: getEmailFrom(),
    to: toEmail,
    subject,
    text,
    html: `<p>You asked to reset the password for your ONE THING admin account.</p><p><a href="${resetUrl}">Set a new password</a></p><p>This link expires in one hour. If you did not request this, ignore this email.</p>`,
  });

  if (result.error) {
    throw new Error(result.error.message || "Resend error");
  }
}
