import Link from "next/link";

type WelcomePageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams?.session_id;

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-[#111]">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-[2rem] border border-[#e5e5e5] bg-[#faf8f2] p-8 shadow-[0_18px_60px_rgba(17,17,17,0.08)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#8b7355]">
          Welcome
        </p>
        <h1
          className="font-[var(--font-display)] text-4xl leading-tight md:text-5xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          You&apos;re in. Your first ONE THING email is being prepared.
        </h1>
        <p className="text-base leading-8 text-[#4d4d4d]">
          Your checkout is complete. We&apos;ll use the details from onboarding
          to set up your daily action emails and the follow-up cadence around
          them.
        </p>

        {sessionId ? (
          <div className="rounded-[1.4rem] border border-[#e5e5e5] bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#8b7355]">
              Session
            </p>
            <p className="mt-2 break-all font-mono text-sm text-[#222]">
              {sessionId}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#111] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#333]"
          >
            Return home
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-full border border-[#d7d7d7] bg-white px-6 py-3 text-sm font-medium text-[#111] transition-colors hover:border-[#999]"
          >
            Review onboarding
          </Link>
        </div>
      </section>
    </main>
  );
}
