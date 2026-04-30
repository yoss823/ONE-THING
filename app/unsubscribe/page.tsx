"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-12 text-[#121212]">
      <div className="w-full max-w-md rounded-2xl border border-[#e7e7e7] bg-white px-8 py-10 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-[#8a8a8a]">Email</p>
        <h1 className="mt-3 font-[var(--font-display)] text-2xl tracking-tight sm:text-3xl">
          You&apos;ve been unsubscribed.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#555]">
          You won&apos;t receive any more emails from ONE THING.
        </p>
        {email ? <p className="mt-6 text-xs text-[#8a8a8a]">{email}</p> : null}
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

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6">
          <p className="text-sm text-[#888]">Loading…</p>
        </main>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
