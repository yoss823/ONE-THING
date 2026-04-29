import { Resend } from "resend";

import {
  generateWelcomeEmailHtml,
  WELCOME_EMAIL_SUBJECT,
  WELCOME_EMAIL_TEXT,
} from "@/emails/WelcomeEmail";
import { getEmailFrom } from "@/lib/email/sender";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

export async function sendWelcomeEmail(
  toEmail: string,
  toName?: string,
  userId?: string,
): Promise<void> {
  try {
    const baseUrl = tryResolvePublicBaseUrl();
    const manageUrl =
      baseUrl && userId
        ? new URL(`/account?userId=${encodeURIComponent(userId)}`, baseUrl).toString()
        : undefined;
    const text = manageUrl
      ? `${WELCOME_EMAIL_TEXT}\n\nManage your themes: ${manageUrl}`
      : WELCOME_EMAIL_TEXT;
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: getEmailFrom(),
      to: toEmail,
      subject: WELCOME_EMAIL_SUBJECT,
      html: generateWelcomeEmailHtml({
        toName: toName?.trim() || undefined,
        manageUrl,
      }),
      text,
    });

    if (result.error) {
      console.error("Failed to send welcome email:", result.error);
    }
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}
