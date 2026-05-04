import { Resend } from "resend";

import type { MonthlyClarityEmailProps } from "@/lib/i18n/monthly-clarity-email";
import {
  generateMonthlyClarityHtml,
  generateMonthlyClarityText,
  getMonthlyClaritySubject,
} from "@/lib/i18n/monthly-clarity-email";
import { getEmailFrom } from "@/lib/email/sender";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

export async function sendMonthlyClarityEmail(
  params: MonthlyClarityEmailProps & { userEmail: string },
): Promise<void> {
  const subject = getMonthlyClaritySubject(params.locale, params.isFirstMonth);
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined;
  const resend = getResendClient();

  const result = await resend.emails.send({
    from: getEmailFrom(),
    to: params.userEmail,
    subject,
    html: generateMonthlyClarityHtml(params),
    text: generateMonthlyClarityText(params),
    replyTo,
  });

  if (result.error) {
    throw new Error(result.error.message ?? "Resend rejected the monthly clarity email.");
  }
}
