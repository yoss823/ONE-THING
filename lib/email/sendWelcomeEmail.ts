import { Resend } from "resend";

import { generateWelcomeEmailHtml, generateWelcomeEmailText } from "@/emails/WelcomeEmail";
import { getEmailFrom } from "@/lib/email/sender";
import type { SiteLocale } from "@/lib/i18n/locale";
import { normalizeSiteLocale } from "@/lib/i18n/locale";
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
  locale?: SiteLocale | string | null,
): Promise<void> {
  try {
    const baseUrl = tryResolvePublicBaseUrl();
    const manageUrl =
      baseUrl && userId
        ? new URL(`/account?userId=${encodeURIComponent(userId)}`, baseUrl).toString()
        : undefined;
    const siteLocale = normalizeSiteLocale(typeof locale === "string" ? locale : undefined);
    const { subject, text } = generateWelcomeEmailText({
      toName: toName?.trim() || undefined,
      manageUrl,
      locale: siteLocale,
    });
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: getEmailFrom(),
      to: toEmail,
      subject,
      html: generateWelcomeEmailHtml({
        toName: toName?.trim() || undefined,
        manageUrl,
        locale: siteLocale,
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
