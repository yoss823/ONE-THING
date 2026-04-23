import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

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

const statusIconByStatus: Record<
  WeeklySummaryEmailProps["weekActions"][number]["status"],
  string
> = {
  completed: "✅",
  skipped: "⏸",
  pending: "○",
};

function WeeklySummaryEmail({
  userName,
  weekActions,
  completedCount,
  skippedCount,
  currentStreak,
  unsubscribeUrl,
}: WeeklySummaryEmailProps) {
  const previewText = userName
    ? `${userName}, here is your week in one email.`
    : "Your week in one email.";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          margin: 0,
          backgroundColor: "#ffffff",
          color: "#111111",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <Container
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            padding: "32px 20px",
          }}
        >
          <Heading
            as="h1"
            style={{
              margin: "0 0 16px",
              fontSize: "32px",
              lineHeight: 1.15,
              fontWeight: 700,
            }}
          >
            Your week.
          </Heading>

          <Text
            style={{
              margin: "0 0 24px",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            {`✅ ${completedCount} completed · ⏸ ${skippedCount} skipped · 🔥 ${currentStreak}-day streak`}
          </Text>

          <Section style={{ margin: "0 0 24px" }}>
            {weekActions.map((action, index) => (
              <Section
                key={`${action.date}-${index}`}
                style={{
                  padding: "12px 0",
                  borderTop: index === 0 ? "1px solid #e5e5e5" : "none",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                <Text
                  style={{
                    margin: "0 0 4px",
                    fontSize: "13px",
                    lineHeight: 1.4,
                    color: "#666666",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {action.date}
                </Text>
                <Text
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ marginRight: "8px" }}>
                    {statusIconByStatus[action.status]}
                  </span>
                  {action.actionTitle}
                </Text>
              </Section>
            ))}
          </Section>

          <Text
            style={{
              margin: "0 0 24px",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Keep going. One thing at a time.
          </Text>

          <Text style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>
            <Link
              href={unsubscribeUrl}
              style={{ color: "#111111", textDecoration: "underline" }}
            >
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function generateWeeklySummaryHtml(
  props: WeeklySummaryEmailProps,
): Promise<string> {
  return render(<WeeklySummaryEmail {...props} />);
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

export default WeeklySummaryEmail;
