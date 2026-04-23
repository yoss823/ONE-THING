import { createElement } from "react";
import { Resend } from "resend";

import WelcomeEmail, {
  WELCOME_EMAIL_SUBJECT,
  WELCOME_EMAIL_TEXT,
} from "@/emails/WelcomeEmail";
import { EMAIL_FROM } from "@/lib/email/sender";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function getWelcomeEmailFrom(): string {
  return process.env.RESEND_FROM?.trim() || process.env.EMAIL_FROM?.trim() || EMAIL_FROM;
}

export async function sendWelcomeEmail(
  toEmail: string,
  toName?: string,
): Promise<void> {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: getWelcomeEmailFrom(),
      to: toEmail,
      subject: WELCOME_EMAIL_SUBJECT,
      react: createElement(WelcomeEmail, {
        toName: toName?.trim() || undefined,
      }),
      text: WELCOME_EMAIL_TEXT,
    });

    if (result.error) {
      console.error("Failed to send welcome email:", result.error);
    }
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}
