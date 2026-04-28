export interface WeeklySummaryEmailProps {
  userName?: string;
  weekActions: Array<{
    date: string;
    actionTitle: string;
    status: "completed" | "skipped" | "pending";
  }>;
  completedCount: number;
  skippedCount: number;
  currentStreak: number;
  unsubscribeUrl: string;
}

const statusIconByStatus: Record<WeeklySummaryEmailProps["weekActions"][number]["status"], string> = {
  completed: "✅",
  skipped: "⏸",
  pending: "○",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderWeekActions(weekActions: WeeklySummaryEmailProps["weekActions"]): string {
  return weekActions
    .map((action, index) => {
      const topBorder = index === 0 ? "border-top:1px solid #e5e5e5;" : "";
      return [
        `<div style="padding:12px 0;${topBorder}border-bottom:1px solid #e5e5e5;">`,
        `<p style="margin:0 0 4px;font-size:13px;line-height:1.4;color:#666666;text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(action.date)}</p>`,
        `<p style="margin:0;font-size:15px;line-height:1.6;">${escapeHtml(statusIconByStatus[action.status])} ${escapeHtml(action.actionTitle)}</p>`,
        "</div>",
      ].join("");
    })
    .join("");
}

export function generateWeeklySummaryHtml(props: WeeklySummaryEmailProps): string {
  const previewText = props.userName
    ? `${props.userName}, here is your week in one email.`
    : "Your week in one email.";
  const summaryLine = `✅ ${props.completedCount} completed · ⏸ ${props.skippedCount} skipped · 🔥 ${props.currentStreak}-day streak`;

  return [
    "<!DOCTYPE html>",
    '<html lang="en"><head>',
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "</head>",
    "<body style=\"margin:0;padding:0;background-color:#ffffff;color:#111111;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;\">",
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;line-height:1px;color:transparent;">${escapeHtml(previewText)}</div>`,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-collapse:collapse;"><tr><td align="center" style="padding:32px 20px;">',
    '<div style="max-width:480px;margin:0 auto;">',
    '<h1 style="margin:0 0 16px;font-size:32px;line-height:1.15;font-weight:700;">Your week.</h1>',
    `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${escapeHtml(summaryLine)}</p>`,
    `<div style="margin:0 0 24px;">${renderWeekActions(props.weekActions)}</div>`,
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Keep going. One thing at a time.</p>',
    `<p style="margin:0;font-size:14px;line-height:1.6;"><a href="${escapeHtml(props.unsubscribeUrl)}" style="color:#111111;text-decoration:underline;">Unsubscribe</a></p>`,
    "</div>",
    "</td></tr></table>",
    "</body></html>",
  ].join("");
}

export function generateWeeklySummaryText(
  props: WeeklySummaryEmailProps,
): string {
  const rows = props.weekActions.map((action) => {
    return `${statusIconByStatus[action.status]} ${action.date}: ${action.actionTitle}`;
  });

  return [
    "Your week.",
    "",
    `✅ ${props.completedCount} completed · ⏸ ${props.skippedCount} skipped · 🔥 ${props.currentStreak}-day streak`,
    "",
    rows.join("\n"),
    "",
    "Keep going. One thing at a time.",
    "",
    `Unsubscribe: ${props.unsubscribeUrl}`,
  ].join("\n");
}
