import { Resend } from "resend";

import {
  MonthlyClarityEmailProps,
  generateMonthlyClarityHtml,
  generateMonthlyClarityText,
} from "@/emails/MonthlyClarityEmail";
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
  const subject = params.isFirstMonth === false ? "Another month." : "One month in.";
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined;
  const resend = getResendClient();

  await resend.emails.send({
    from: getEmailFrom(),
    to: params.userEmail,
    subject,
    html: generateMonthlyClarityHtml(params),
    text: generateMonthlyClarityText(params),
    replyTo,
  });
}
