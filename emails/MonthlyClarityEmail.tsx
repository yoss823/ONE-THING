export interface MonthlyClarityEmailProps {
  userName?: string;
  monthName: string;
  completedCount: number;
  skippedCount: number;
  topCategory: string;
  currentCategories: string[];
  upgradeUrl?: string;
  unsubscribeUrl: string;
  isFirstMonth?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function generateMonthlyClarityHtml(
  props: MonthlyClarityEmailProps,
): string {
  const heading = props.isFirstMonth === false ? "Another month." : "One month in.";
  const greeting = props.userName
    ? `<p style="margin:0 0 16px;">${escapeHtml(props.userName)},</p>`
    : "";
  const upgrade = props.upgradeUrl
    ? `<p style="margin:0 0 24px;"><a href="${escapeHtml(props.upgradeUrl)}" style="color:#111111;text-decoration:underline;">Ready to add another area? → Upgrade your plan</a></p>`
    : "";

  return [
    "<!DOCTYPE html>",
    '<html><body style="margin:0;background-color:#ffffff;color:#111111;font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;">',
    '<div style="max-width:480px;margin:0 auto;padding:32px 20px;line-height:1.55;font-size:15px;">',
    greeting,
    `<p style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-style:italic;">${escapeHtml(heading)}</p>`,
    `<p style="margin:0 0 16px;">You completed ${props.completedCount} actions in ${escapeHtml(props.monthName)}. Skipped ${props.skippedCount}.</p>`,
    `<p style="margin:0 0 16px;">Your strongest area: ${escapeHtml(props.topCategory)}.</p>`,
    `<p style="margin:0 0 16px;">Current focus: ${escapeHtml(props.currentCategories.join(", "))}.</p>`,
    "<p style=\"margin:0 0 8px;\">Same categories for next month, or time to shift focus?</p>",
    "<p style=\"margin:0 0 24px;\">Reply to this email if you'd like to make a change.</p>",
    upgrade,
    "<p style=\"margin:0 0 24px;\">Back tomorrow with your next action.</p>",
    '<p style="margin:0 0 16px;color:#666666;">---</p>',
    `<p style="margin:0;"><a href="${escapeHtml(props.unsubscribeUrl)}" style="color:#111111;text-decoration:underline;">Unsubscribe</a></p>`,
    "</div></body></html>",
  ].join("");
}

export function generateMonthlyClarityText(
  props: MonthlyClarityEmailProps,
): string {
  return [
    props.userName ? `${props.userName},` : null,
    props.isFirstMonth === false ? "Another month." : "One month in.",
    "",
    `You completed ${props.completedCount} actions in ${props.monthName}. Skipped ${props.skippedCount}.`,
    `Your strongest area: ${props.topCategory}.`,
    `Current focus: ${props.currentCategories.join(", ")}.`,
    "",
    "Same categories for next month, or time to shift focus?",
    "Reply to this email if you'd like to make a change.",
    props.upgradeUrl
      ? `Ready to add another area? → Upgrade your plan: ${props.upgradeUrl}`
      : null,
    "",
    "Back tomorrow with your next action.",
    "",
    `Unsubscribe: ${props.unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}
