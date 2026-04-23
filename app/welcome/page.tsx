"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

type OnboardingData = {
  categories: string[];
  energyLevel: string;
  availableMinutes: number;
};

function readOnboardingData(): OnboardingData | null {
  try {
    const raw = localStorage.getItem("onboarding");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingData;
    if (!parsed || !Array.isArray(parsed.categories)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function WelcomeContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  let onboarding: OnboardingData | null = null;
  if (typeof window !== "undefined") {
    onboarding = readOnboardingData();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "#111",
            marginBottom: "1.5rem",
          }}
        >
          You&apos;re in.
        </h1>

        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "#555",
            marginBottom: "1rem",
          }}
        >
          Your first email arrives tomorrow at 8:00 AM. One thing. That&apos;s it.
        </p>

        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "#555",
            marginBottom: "2rem",
          }}
        >
          We&apos;ll track what you complete and quietly adjust over time. No login
          needed. Just open the email.
        </p>

        {onboarding && onboarding.categories.length > 0 && (
          <div
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: "1rem",
              backgroundColor: "#faf8f2",
              padding: "1.25rem 1.5rem",
              fontSize: "0.875rem",
              lineHeight: 1.75,
              color: "#555",
              marginBottom: "2rem",
            }}
          >
            <p>Your categories: {onboarding.categories.join(", ")}</p>
            {onboarding.energyLevel && (
              <p>Energy level: {onboarding.energyLevel}</p>
            )}
            {onboarding.availableMinutes != null && (
              <p>Time available: {onboarding.availableMinutes} minutes</p>
            )}
          </div>
        )}

        {sessionId && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "#aaa",
              marginBottom: "1.5rem",
            }}
          >
            Session: {sessionId}
          </p>
        )}

        <p style={{ fontSize: "0.875rem", color: "#888" }}>
          <a
            href="/account"
            style={{ color: "#555", textDecoration: "none" }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "#111")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "#555")
            }
          >
            Manage your subscription →
          </a>
        </p>
      </div>
    </main>
  );
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "#888", fontSize: "0.875rem" }}>Loading…</p>
        </main>
      }
    >
      <WelcomeContent />
    </Suspense>
  );
}
