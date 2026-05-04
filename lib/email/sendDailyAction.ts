import { Resend } from "resend";

import {
  DailyActionEmailProps,
  generateDailyActionHtml,
  generateDailyActionText,
} from "@/emails/DailyActionEmail";
import { getDailyEmailStrings } from "@/lib/i18n/daily-email";
import { normalizeSiteLocale } from "@/lib/i18n/locale";
import { getEmailFrom } from "@/lib/email/sender";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

export async function sendDailyActionEmail(
  params: DailyActionEmailProps,
): Promise<void> {
  const copy = getDailyEmailStrings(normalizeSiteLocale(params.locale));
  const subject = `${copy.subjectPrefix} ${params.date}`;
  const resend = getResendClient();

  const result = await resend.emails.send({
    from: getEmailFrom(),
    to: params.userEmail,
    subject,
    html: generateDailyActionHtml(params),
    text: generateDailyActionText(params),
  });

  if (result.error) {
    throw new Error(result.error.message ?? "Resend rejected the daily action email.");
  }
}
