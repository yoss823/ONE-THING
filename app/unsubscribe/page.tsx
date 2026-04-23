'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        color: "#111111",
        display: "flex",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            margin: "0 0 16px",
          }}
        >
          You&apos;ve been unsubscribed.
        </h1>
        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          You won&apos;t receive any more emails from ONE THING.
        </p>
        {email ? (
          <p
            style={{
              color: "#666666",
              fontSize: "14px",
              margin: "16px 0 0",
            }}
          >
            {email}
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeContent />
    </Suspense>
  );
}
