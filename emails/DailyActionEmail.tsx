import { renderToStaticMarkup } from "react-dom/server";

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

function DailyActionEmail({
  categories,
  date,
  trackingBaseUrl,
  userId,
}: DailyActionEmailProps) {
  const accountUrl = buildAccountUrl(trackingBaseUrl, "/account");
  const unsubscribeUrl = buildAccountUrl(trackingBaseUrl, "/unsubscribe");

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
          <p style={{ margin: "0 0 16px" }}>{date}</p>
          <p style={{ margin: "0 0 24px", color: "#666666" }}>---</p>

          {categories.map((category, index) => {
            const links = getCategoryLinks(
              trackingBaseUrl,
              userId,
              category.actionId,
            );

            return (
              <div key={category.actionId}>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {category.name}
                </p>
                <p
                  style={{
                    margin: "0 0 16px",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "18px",
                    fontStyle: "italic",
                  }}
                >
                  {category.action}
                </p>
                <p style={{ margin: "0 0 24px" }}>
                  <a
                    href={links.doneUrl}
                    style={{ color: "#111111", textDecoration: "underline" }}
                  >
                    ✅ Done
                  </a>
                  {"  |  "}
                  <a
                    href={links.skipUrl}
                    style={{ color: "#111111", textDecoration: "underline" }}
                  >
                    ⏸ Skip for today
                  </a>
                </p>

                {index < categories.length - 1 ? (
                  <p style={{ margin: "0 0 24px", color: "#666666" }}>---</p>
                ) : null}
              </div>
            );
          })}

          <p style={{ margin: "0 0 24px", color: "#666666" }}>---</p>
          <p style={{ margin: "0 0 8px" }}>That&apos;s it. See you tomorrow.</p>
          <p style={{ margin: "0 0 24px" }}>— ONE THING</p>
          <p style={{ margin: "0 0 16px", color: "#666666" }}>---</p>
          <p style={{ margin: 0 }}>
            <a
              href={unsubscribeUrl}
              style={{ color: "#111111", textDecoration: "underline" }}
            >
              Unsubscribe
            </a>
            {" | "}
            <a
              href={accountUrl}
              style={{ color: "#111111", textDecoration: "underline" }}
            >
              Manage preferences
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}

export function generateDailyActionHtml(
  props: DailyActionEmailProps,
): string {
  return `<!DOCTYPE html>${renderToStaticMarkup(
    <DailyActionEmail {...props} />,
  )}`;
}

export function generateDailyActionText(
  props: DailyActionEmailProps,
): string {
  const accountUrl = buildAccountUrl(props.trackingBaseUrl, "/account");
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
    "— ONE THING",
    "",
    "---",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
    `Manage preferences: ${accountUrl}`,
  ].join("\n");
}

export default DailyActionEmail;
