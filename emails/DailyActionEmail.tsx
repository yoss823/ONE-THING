import { buildTrackingUrl } from "@/lib/email/tracking-links";
import { getDailyEmailStrings } from "@/lib/i18n/daily-email";
import { normalizeSiteLocale } from "@/lib/i18n/locale";

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
  locale?: string | null;
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
  labels: { done: string; skip: string },
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
    `<a href="${escapeHtml(links.doneUrl)}" style="color:#111111;text-decoration:underline">${escapeHtml(labels.done)}</a>`,
    "  |  ",
    `<a href="${escapeHtml(links.skipUrl)}" style="color:#111111;text-decoration:underline">${escapeHtml(labels.skip)}</a>`,
    "</p>",
    divider,
    "</div>",
  ].join("");
}

export function generateDailyActionHtml(props: DailyActionEmailProps): string {
  const copy = getDailyEmailStrings(normalizeSiteLocale(props.locale));
  const accountUrl = new URL(
    `/account?userId=${encodeURIComponent(props.userId)}`,
    props.trackingBaseUrl,
  ).toString();
  const unsubscribeUrl = buildAccountUrl(props.trackingBaseUrl, "/unsubscribe");
  const categorySections = props.categories
    .map((category, index) =>
      renderCategorySection(props, category, index, { done: copy.done, skip: copy.skip }),
    )
    .join("");

  return [
    "<!DOCTYPE html>",
    '<html><body style="margin:0;background-color:#ffffff;color:#111111;font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">',
    '<div style="max-width:480px;margin:0 auto;padding:32px 20px;line-height:1.55;font-size:15px">',
    `<p style="margin:0 0 16px">${escapeHtml(props.date)}</p>`,
    '<p style="margin:0 0 24px;color:#666666">---</p>',
    categorySections,
    '<p style="margin:0 0 24px;color:#666666">---</p>',
    `<p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#444444">${escapeHtml(copy.reminderLine)}</p>`,
    '<p style="margin:0 0 24px;color:#666666">---</p>',
    `<p style="margin:0 0 8px">${escapeHtml(copy.closingLine)}</p>`,
    `<p style="margin:0 0 24px">${escapeHtml(copy.brand)}</p>`,
    '<p style="margin:0 0 16px;color:#666666">---</p>',
    '<p style="margin:0 0 12px">',
    `<a href="${escapeHtml(accountUrl)}" style="color:#111111;text-decoration:underline;font-weight:600">${escapeHtml(copy.manageDashboard)}</a>`,
    "</p>",
    '<p style="margin:0">',
    `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#111111;text-decoration:underline">${escapeHtml(copy.unsubscribe)}</a>`,
    "</p>",
    "</div></body></html>",
  ].join("");
}

export function generateDailyActionText(
  props: DailyActionEmailProps,
): string {
  const copy = getDailyEmailStrings(normalizeSiteLocale(props.locale));
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
      `${copy.done}: ${links.doneUrl}`,
      `${copy.skip}: ${links.skipUrl}`,
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
    copy.reminderLine,
    "",
    "---",
    "",
    copy.closingLine,
    "",
    copy.brand,
    "",
    "---",
    "",
    `${copy.manageDashboard}: ${accountUrl}`,
    `${copy.unsubscribe}: ${unsubscribeUrl}`,
  ].join("\n");
}
