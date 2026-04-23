import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

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

export default function WelcomeEmail({ toName }: WelcomeEmailProps) {
  const previewText = toName?.trim()
    ? `Thanks for joining ONE THING, ${toName.trim()}.`
    : "Thanks for joining ONE THING.";

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
          <Section>
            <Text style={paragraphStyle}>Thanks for joining ONE THING.</Text>
            <Text style={paragraphStyle}>
              Tomorrow at 8:00 AM, you&apos;ll receive your first single action.
            </Text>
            <Text style={paragraphStyle}>One thing. That&apos;s all.</Text>
            <Text style={closingStyle}>You&apos;re set.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const paragraphStyle = {
  margin: "0 0 24px",
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#111111",
} as const;

const closingStyle = {
  ...paragraphStyle,
  margin: 0,
  color: "#475569",
} as const;
