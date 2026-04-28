import { buildTrackingUrl } from "@/lib/email/tracking-links";

export type DailyActionEmailProps = {
  userEmail: string;
  categories: Array<{
    name: string;
    action: string;
    actionId: string;
  }>;
  date: string;
  trackingBaseUrl: string;
  userId: string;
};

type EmailLinkSet = {
  doneUrl: string;
  skipUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildAccountUrl(trackingBaseUrl: string, pathname: string): string {
  return new URL(pathname, trackingBaseUrl).toString();
}

function getCategoryLinks(
  trackingBaseUrl: string,
  userId: string,
  actionId: string,
): EmailLinkSet {
  return {
    doneUrl: buildTrackingUrl(trackingBaseUrl, userId, actionId, "done"),
    skipUrl: buildTrackingUrl(trackingBaseUrl, userId, actionId, "skip"),
  };
}

function renderCategorySection(
  props: DailyActionEmailProps,
  category: DailyActionEmailProps["categories"][number],
  index: number,
): string {
  const links = getCategoryLinks(
    props.trackingBaseUrl,
    props.userId,
    category.actionId,
  );
  const divider =
    index < props.categories.length - 1
      ? '<p style="margin:0 0 24px;color:#666666">---</p>'
      : "";

  return [
    "<div>",
    `<p style="margin:0 0 8px;font-size:14px;font-weight:600">${escapeHtml(category.name)}</p>`,
    `<p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-style:italic">${escapeHtml(category.action)}</p>`,
    '<p style="margin:0 0 24px">',
    `<a href="${escapeHtml(links.doneUrl)}" style="color:#111111;text-decoration:underline">✅ Done</a>`,
    "  |  ",
    `<a href="${escapeHtml(links.skipUrl)}" style="color:#111111;text-decoration:underline">⏸ Skip for today</a>`,
    "</p>",
    divider,
    "</div>",
  ].join("");
}

export function generateDailyActionHtml(props: DailyActionEmailProps): string {
  const accountUrl = new URL(
    `/account?userId=${encodeURIComponent(props.userId)}`,
    props.trackingBaseUrl,
  ).toString();
  const unsubscribeUrl = buildAccountUrl(props.trackingBaseUrl, "/unsubscribe");
  const categorySections = props.categories
    .map((category, index) => renderCategorySection(props, category, index))
    .join("");

  return [
    "<!DOCTYPE html>",
    '<html><body style="margin:0;background-color:#ffffff;color:#111111;font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">',
    '<div style="max-width:480px;margin:0 auto;padding:32px 20px;line-height:1.55;font-size:15px">',
    `<p style="margin:0 0 16px">${escapeHtml(props.date)}</p>`,
    '<p style="margin:0 0 24px;color:#666666">---</p>',
    categorySections,
    '<p style="margin:0 0 24px;color:#666666">---</p>',
    "<p style=\"margin:0 0 8px\">That&#39;s it. See you tomorrow.</p>",
    "<p style=\"margin:0 0 24px\">ONE THING</p>",
    '<p style="margin:0 0 16px;color:#666666">---</p>',
    '<p style="margin:0">',
    `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#111111;text-decoration:underline">Unsubscribe</a>`,
    " | ",
    `<a href="${escapeHtml(accountUrl)}" style="color:#111111;text-decoration:underline">Manage preferences</a>`,
    "</p>",
    "</div></body></html>",
  ].join("");
}

export function generateDailyActionText(
  props: DailyActionEmailProps,
): string {
  const accountUrl = new URL(
    `/account?userId=${encodeURIComponent(props.userId)}`,
    props.trackingBaseUrl,
  ).toString();
  const unsubscribeUrl = buildAccountUrl(props.trackingBaseUrl, "/unsubscribe");

  const sections = props.categories.map((category) => {
    const links = getCategoryLinks(
      props.trackingBaseUrl,
      props.userId,
      category.actionId,
    );

    return [
      category.name,
      category.action,
      "",
      `✅ Done: ${links.doneUrl}`,
      `⏸ Skip for today: ${links.skipUrl}`,
    ].join("\n");
  });

  return [
    props.date,
    "",
    "---",
    "",
    sections.join("\n\n---\n\n"),
    "",
    "---",
    "",
    "That's it. See you tomorrow.",
    "",
    "ONE THING",
    "",
    "---",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
    `Manage preferences: ${accountUrl}`,
  ].join("\n");
}
