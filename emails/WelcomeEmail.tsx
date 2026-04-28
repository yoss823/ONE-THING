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
    '<html lang="en"><head>',
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "</head>",
    '<body style="margin:0;padding:0;background-color:#ffffff;color:#111111;font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">',
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;line-height:1px;color:transparent;">${escapeHtml(previewText)}</div>`,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-collapse:collapse;"><tr><td align="center" style="padding:32px 20px;">',
    '<div style="max-width:480px;margin:0 auto;">',
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#111111;">Thanks for joining ONE THING.</p>',
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#111111;">Tomorrow at 8:00 AM, you&#39;ll receive your first single action.</p>',
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#111111;">One thing. That&#39;s all.</p>',
    '<p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">You&#39;re set.</p>',
    "</div>",
    "</td></tr></table>",
    "</body></html>",
  ].join("");
}
