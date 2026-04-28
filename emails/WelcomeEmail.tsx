export interface WelcomeEmailProps {
  toName?: string;
}

export const WELCOME_EMAIL_SUBJECT = "You're in.";

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

export function generateWelcomeEmailHtml({ toName }: WelcomeEmailProps): string {
  const previewText = toName?.trim()
    ? `Thanks for joining ONE THING, ${toName.trim()}.`
    : "Thanks for joining ONE THING.";

  return [
    "<!DOCTYPE html>",
    "<html><head>",
    `<meta name="description" content="${escapeHtml(previewText)}">`,
    "</head>",
    '<body style="margin:0;background-color:#ffffff;color:#111111;font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;">',
    '<div style="max-width:480px;margin:0 auto;padding:32px 20px;">',
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#111111;">Thanks for joining ONE THING.</p>',
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#111111;">Tomorrow at 8:00 AM, you&#39;ll receive your first single action.</p>',
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#111111;">One thing. That&#39;s all.</p>',
    '<p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">You&#39;re set.</p>',
    "</div></body></html>",
  ].join("");
}
