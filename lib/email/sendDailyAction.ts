import { Resend } from "resend";

import {
  DailyActionEmailProps,
  generateDailyActionHtml,
  generateDailyActionText,
} from "@/emails/DailyActionEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyActionEmail(
  params: DailyActionEmailProps,
): Promise<void> {
  const subject = `Your one thing for ${params.date}`;

  await resend.emails.send({
    from: "ONE THING <hello@onething.so>",
    to: params.userEmail,
    subject,
    html: generateDailyActionHtml(params),
    text: generateDailyActionText(params),
  });
}
