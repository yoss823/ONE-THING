import { Resend } from "resend";

import {
  default as MonthlyClarityEmail,
  MonthlyClarityEmailProps,
  generateMonthlyClarityText,
} from "@/emails/MonthlyClarityEmail";

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
  const from = process.env.EMAIL_FROM ?? "ONE THING <hello@onething.so>";
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined;
  const resend = getResendClient();

  await resend.emails.send({
    from,
    to: params.userEmail,
    subject,
    react: <MonthlyClarityEmail {...params} />,
    text: generateMonthlyClarityText(params),
    replyTo,
  });
}
