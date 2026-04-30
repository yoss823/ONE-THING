"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TrackedContent() {
  const searchParams = useSearchParams();
  const response = searchParams.get("response");

  const isDone = response === "done";
  const isSkip = response === "skip";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-16 text-[#121212]">
      <div className="w-full max-w-md rounded-2xl border border-[#e7e7e7] bg-white px-8 py-10 text-center shadow-sm">
        <p className="text-4xl leading-none" aria-hidden>
          {isDone ? "✅" : isSkip ? "⏸" : "📬"}
        </p>
        <p className="mt-6 font-[var(--font-display)] text-xl tracking-tight text-[#151515]">
          {isDone ? "Marked as done." : isSkip ? "Skipped for today." : "Response recorded."}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#666]">
          {isDone ? "See you tomorrow." : isSkip ? "We'll adjust over time." : "Thanks for letting us know."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-[#121212] underline underline-offset-4 hover:text-[#444]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

export default function TrackedPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6">
          <p className="text-sm text-[#888]">Loading…</p>
        </main>
      }
    >
      <TrackedContent />
    </Suspense>
  );
}
