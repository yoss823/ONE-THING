import { Resend } from "resend";

import {
  generateWelcomeEmailHtml,
  generateWelcomeEmailText,
  WelcomeEmailProps,
} from "@/emails/WelcomeEmail";
import { EMAIL_FROM } from "@/lib/email/sender";

const WELCOME_CATEGORY_LABELS: Record<string, string> = {
  mental_clarity: "Mental clarity",
  organization: "Organization",
  health_energy: "Health / Energy",
  work_business: "Work / Business",
  personal_projects: "Personal projects",
  relationships: "Relationships",
};

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function normalizeCategory(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatWelcomeCategory(category: string): string {
  const normalized = normalizeCategory(category);

  return WELCOME_CATEGORY_LABELS[normalized] ?? category;
}

function getBaseUrl(): string | null {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() || process.env.APP_URL?.trim();

  return baseUrl || null;
}

function buildUnsubscribeUrl(email: string): string {
  const baseUrl = getBaseUrl();
  const pathname = `/unsubscribe?email=${encodeURIComponent(email)}`;

  if (!baseUrl) {
    return pathname;
  }

  return new URL(pathname, baseUrl).toString();
}

function getNextMorningLabel(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return `Tomorrow, ${tomorrow.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })}`;
}

export async function sendWelcomeEmail(params: {
  email: string;
  categories: string[];
}): Promise<void> {
  const firstEmailDate = getNextMorningLabel();
  const resend = getResendClient();
  const templateProps: WelcomeEmailProps = {
    email: params.email,
    categories: params.categories.map(formatWelcomeCategory),
    firstEmailDate,
    unsubscribeUrl: buildUnsubscribeUrl(params.email),
  };

  await resend.emails.send({
    from: EMAIL_FROM,
    to: params.email,
    subject: "You're in. Your first action arrives tomorrow.",
    html: generateWelcomeEmailHtml(templateProps),
    text: generateWelcomeEmailText(templateProps),
  });
}
