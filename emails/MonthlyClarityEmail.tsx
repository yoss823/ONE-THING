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

function MonthlyClarityEmail({
  userName,
  monthName,
  completedCount,
  skippedCount,
  topCategory,
  currentCategories,
  upgradeUrl,
  unsubscribeUrl,
  isFirstMonth = true,
}: MonthlyClarityEmailProps) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          backgroundColor: "#ffffff",
          color: "#111111",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            padding: "32px 20px",
            lineHeight: 1.55,
            fontSize: "15px",
          }}
        >
          {userName ? <p style={{ margin: "0 0 16px" }}>{userName},</p> : null}
          <p
            style={{
              margin: "0 0 24px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "28px",
              fontStyle: "italic",
            }}
          >
            {isFirstMonth ? "One month in." : "Another month."}
          </p>
          <p style={{ margin: "0 0 16px" }}>
            You completed {completedCount} actions in {monthName}. Skipped{" "}
            {skippedCount}.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            Your strongest area: {topCategory}.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            Current focus: {currentCategories.join(", ")}.
          </p>
          <p style={{ margin: "0 0 8px" }}>
            Same categories for next month, or time to shift focus?
          </p>
          <p style={{ margin: "0 0 24px" }}>
            Reply to this email if you&apos;d like to make a change.
          </p>
          {upgradeUrl ? (
            <p style={{ margin: "0 0 24px" }}>
              <a
                href={upgradeUrl}
                style={{ color: "#111111", textDecoration: "underline" }}
              >
                Ready to add another area? → Upgrade your plan
              </a>
            </p>
          ) : null}
          <p style={{ margin: "0 0 24px" }}>
            Back tomorrow with your next action.
          </p>
          <p style={{ margin: "0 0 16px", color: "#666666" }}>---</p>
          <p style={{ margin: 0 }}>
            <a
              href={unsubscribeUrl}
              style={{ color: "#111111", textDecoration: "underline" }}
            >
              Unsubscribe
            </a>
          </p>
        </div>
      </body>
    </html>
  );
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

export default MonthlyClarityEmail;
