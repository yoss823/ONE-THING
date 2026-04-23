export interface WelcomeEmailProps {
  email: string;
  categories: string[];
  firstEmailDate: string;
  unsubscribeUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getBaseUrl(): string | null {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() || process.env.APP_URL?.trim();

  return baseUrl || null;
}

function buildAccountUrl(): string {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    return "/account";
  }

  return new URL("/account", baseUrl).toString();
}

function buildUnsubscribeFallback(email: string): string {
  const baseUrl = getBaseUrl();
  const pathname = `/unsubscribe?email=${encodeURIComponent(email)}`;

  if (!baseUrl) {
    return pathname;
  }

  return new URL(pathname, baseUrl).toString();
}

function getUnsubscribeUrl(props: WelcomeEmailProps): string {
  return props.unsubscribeUrl || buildUnsubscribeFallback(props.email);
}

export function generateWelcomeEmailHtml(props: WelcomeEmailProps): string {
  const unsubscribeUrl = getUnsubscribeUrl(props);
  const accountUrl = buildAccountUrl();
  const categoryRows = props.categories
    .map(
      (category) =>
        `<p style="margin:0 0 4px">· ${escapeHtml(category)}</p>`,
    )
    .join("");

  return [
    "<!DOCTYPE html>",
    '<html><body style="margin:0;background-color:#ffffff;color:#111111;font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">',
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">',
    escapeHtml(
      `Your first ONE THING email arrives ${props.firstEmailDate} at 8:00 AM.`,
    ),
    "</div>",
    '<div style="max-width:480px;margin:0 auto;padding:32px 20px;line-height:1.55;font-size:15px">',
    "<p style=\"margin:0 0 24px\">You&#39;re in.</p>",
    "<p style=\"margin:0 0 24px\">Your first ONE THING email arrives tomorrow at 8:00 AM.</p>",
    "<p style=\"margin:0 0 24px\">One action. One category. 5 to 15 minutes.</p>",
    '<p style="margin:0 0 24px;color:#666666">───</p>',
    "<p style=\"margin:0 0 12px\">Your setup:</p>",
    categoryRows,
    '<p style="margin:20px 0 24px;color:#666666">───</p>',
    "<p style=\"margin:0 0 24px\">That&#39;s it. Just open the email tomorrow morning.</p>",
    "<p style=\"margin:0 0 24px\">No app to download. No account to create. No decisions to make.</p>",
    "<p style=\"margin:0 0 24px\">— ONE THING</p>",
    '<p style="margin:0 0 16px;color:#666666">───</p>',
    '<p style="margin:0">',
    `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#111111;text-decoration:underline">Unsubscribe</a>`,
    " | ",
    `<a href="${escapeHtml(accountUrl)}" style="color:#111111;text-decoration:underline">Manage preferences</a>`,
    "</p>",
    "</div></body></html>",
  ].join("");
}

export function generateWelcomeEmailText(props: WelcomeEmailProps): string {
  const unsubscribeUrl = getUnsubscribeUrl(props);
  const accountUrl = buildAccountUrl();

  return [
    "You're in.",
    "",
    "Your first ONE THING email arrives tomorrow at 8:00 AM.",
    "",
    "One action. One category. 5 to 15 minutes.",
    "",
    "───",
    "",
    "Your setup:",
    ...props.categories.map((category) => `· ${category}`),
    "",
    "───",
    "",
    "That's it. Just open the email tomorrow morning.",
    "",
    "No app to download. No account to create. No decisions to make.",
    "",
    "— ONE THING",
    "",
    "───",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
    `Manage preferences: ${accountUrl}`,
  ].join("\n");
}
