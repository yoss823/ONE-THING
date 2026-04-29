export const EMAIL_FROM = "ONE THING <hello@onething.so>";

export function getEmailFrom(): string {
  return process.env.RESEND_FROM?.trim() || process.env.EMAIL_FROM?.trim() || EMAIL_FROM;
}
