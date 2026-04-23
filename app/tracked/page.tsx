"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TrackedContent() {
  const searchParams = useSearchParams();
  const response = searchParams.get("response");

  const isDone = response === "done";
  const isSkip = response === "skip";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1.5rem",
        color: "#111",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "1rem",
          border: "1px solid #e5e5e5",
          borderRadius: "2rem",
          backgroundColor: "#faf8f2",
          padding: "3rem 2rem",
          boxShadow: "0 18px 60px rgba(17,17,17,0.08)",
        }}
      >
        <p style={{ fontSize: "3rem", lineHeight: 1 }}>
          {isDone ? "✅" : isSkip ? "⏸" : "📬"}
        </p>
        <div>
          <p style={{ fontSize: "1.25rem", fontWeight: 500, color: "#111", marginBottom: "0.5rem" }}>
            {isDone
              ? "Marked as done."
              : isSkip
              ? "Skipped for today."
              : "Response recorded."}
          </p>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "#4d4d4d" }}>
            {isDone
              ? "See you tomorrow."
              : isSkip
              ? "We'll adjust over time."
              : "Thanks for letting us know."}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function TrackedPage() {
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
      <TrackedContent />
    </Suspense>
  );
}
