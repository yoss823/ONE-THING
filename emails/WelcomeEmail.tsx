import { getWelcomeEmailCopy } from "@/lib/i18n/welcome-email";
import { normalizeSiteLocale, type SiteLocale } from "@/lib/i18n/locale";

export interface WelcomeEmailProps {
  toName?: string;
  manageUrl?: string;
  /** Email content language (defaults to English). */
  locale?: SiteLocale;
}

/** @deprecated Use generateWelcomeEmailText with locale */
export const WELCOME_EMAIL_SUBJECT = "You're in.";

/** @deprecated Use generateWelcomeEmailText with locale */
export const WELCOME_EMAIL_TEXT = [
  "Thanks for joining ONE THING.",
  "",
  "Tomorrow at 8:00 AM, you'll receive your first single action.",
  "",
  "One thing. That's all.",
  "",
  "You're set.",
].join("\n");

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function generateWelcomeEmailText({ toName, manageUrl, locale }: WelcomeEmailProps): {
  subject: string;
  text: string;
} {
  const loc = normalizeSiteLocale(locale);
  const copy = getWelcomeEmailCopy(loc);
  const lines = [...copy.textLines];
  if (toName?.trim()) {
    lines[0] = `${copy.textLines[0]} ${toName.trim()}`;
  }
  if (manageUrl) {
    lines.push("", `${copy.manageLink}: ${manageUrl}`);
  }
  return {
    subject: copy.subject,
    text: lines.join("\n"),
  };
}

export function generateWelcomeEmailHtml({ toName, manageUrl, locale }: WelcomeEmailProps): string {
  const loc = normalizeSiteLocale(locale);
  const copy = getWelcomeEmailCopy(loc);
  const previewText = toName?.trim()
    ? `${copy.htmlThanks} ${escapeHtml(toName.trim())}.`
    : copy.htmlThanks;

  const manageLine = manageUrl
    ? `<p style="margin:24px 0 0;font-size:15px;line-height:1.7;"><a href="${escapeHtml(manageUrl)}" style="color:#111111;text-decoration:underline;">${escapeHtml(copy.manageLink)}</a></p>`
    : "";

  return [
    "<!DOCTYPE html>",
    `<html lang="${loc}"><head>`,
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "</head>",
    '<body style="margin:0;padding:0;background-color:#ffffff;color:#111111;font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">',
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;line-height:1px;color:transparent;">${escapeHtml(previewText)}</div>`,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-collapse:collapse;"><tr><td align="center" style="padding:32px 20px;">',
    '<div style="max-width:480px;margin:0 auto;">',
    `<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#111111;">${copy.htmlThanks}</p>`,
    `<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#111111;">${copy.htmlTomorrow}</p>`,
    `<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#111111;">${copy.htmlOneThing}</p>`,
    `<p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">${copy.htmlSet}</p>`,
    manageLine,
    "</div>",
    "</td></tr></table>",
    "</body></html>",
  ].join("");
}
