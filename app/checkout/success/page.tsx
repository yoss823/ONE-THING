import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow)]">
        <p className="text-sm uppercase tracking-[0.26em] text-[var(--accent)]">
          Checkout complete
        </p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl leading-none">
          You are in. The next step is picking what matters.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-[var(--foreground-soft)]">
          V1 onboarding will collect timezone and 1-3 categories, then queue
          your first 8:00am local-time send. This page is scaffolded now so the
          billing flow has a stable redirect target.
        </p>
        <Link
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[#1a3425]"
          href="/"
        >
          Back to overview
        </Link>
      </div>
    </main>
  );
}
