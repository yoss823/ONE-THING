import { Resend } from "resend";

import {
  DailyActionEmailProps,
  generateDailyActionHtml,
  generateDailyActionText,
} from "@/emails/DailyActionEmail";

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
  const subject = `Your one thing for ${params.date}`;
  const resend = getResendClient();

  await resend.emails.send({
    from: "ONE THING <hello@onething.so>",
    to: params.userEmail,
    subject,
    html: generateDailyActionHtml(params),
    text: generateDailyActionText(params),
  });
}
