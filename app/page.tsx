import Link from "next/link";

export default function Home() {
  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow)] backdrop-blur">
        <section className="relative overflow-hidden border-b border-[var(--border)] px-6 py-10 md:px-12 md:py-14">
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,34,23,0.25),transparent)]" />
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium uppercase tracking-[0.22em] text-[var(--foreground-soft)]">
                <span className="rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-1">
                  OneStep
                </span>
                <span>Fastest possible V1 scaffold</span>
              </div>
              <div className="max-w-3xl space-y-5">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">
                  One email. One next move.
                </p>
                <h1 className="font-[var(--font-display)] text-5xl leading-none md:text-7xl">
                  A calmer way to get better before your day accelerates.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[var(--foreground-soft)] md:text-xl">
                  ONE THING sends one clear action per selected category every
                  morning at 8:00am local time. This repo now includes the V1
                  architecture plan, the initial schema scaffold, and the
                  deployable Next.js baseline.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[#1a3425]"
                  href="#v1"
                >
                  See V1 decisions
                </a>
                <Link
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--foreground)]"
                  href="/checkout/success"
                >
                  Open success page
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                ["8:00am local time", "Store the IANA timezone and persist the next UTC send timestamp after each run."],
                ["1-3 categories", "Keep onboarding tight and send exactly one action per selected category."],
                ["Hosted billing", "Use Stripe Checkout and Billing Portal instead of custom subscription UI."],
              ].map(([title, copy]) => (
                <article
                  key={title}
                  className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.26em] text-[var(--accent)]">
                    Core constraint
                  </p>
                  <h2 className="mt-3 font-[var(--font-display)] text-3xl leading-tight">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    {copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="v1"
          className="grid gap-6 px-6 py-8 md:px-12 md:py-10 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.26em] text-[var(--accent)]">
              V1 scope
            </p>
            <h2 className="font-[var(--font-display)] text-4xl leading-tight">
              The smallest reliable system is the right one.
            </h2>
            <p className="max-w-xl text-base leading-8 text-[var(--foreground-soft)]">
              V1 does not need a broad product surface. It needs a clear sales
              page, hosted checkout, timezone-aware onboarding, a durable send
              queue, and an admin escape hatch for exports and failures.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              [
                "Stack",
                "Next.js on Vercel, PostgreSQL as the source of truth, plain SQL migrations, server-rendered pages and route handlers.",
              ],
              [
                "Email",
                "Postmark for transactional delivery and webhook tracking, with all scheduling logic owned by the app.",
              ],
              [
                "Scheduling",
                "A single cron-triggered route runs every 5 minutes and claims due rows from a send queue.",
              ],
              [
                "Portability",
                "Daily exports come from Postgres, not from Stripe or the email vendor, so vendor swaps stay contained.",
              ],
            ].map(([title, copy]) => (
              <article
                key={title}
                className="rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,255,255,0.38)] p-5"
              >
                <h3 className="font-[var(--font-display)] text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border)] px-6 py-8 md:px-12 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--foreground)] p-6 text-[var(--background)]">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent-soft)]">
                Included now
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[rgba(245,239,223,0.84)]">
                <li>Concise V1 technical plan in <code>docs/one-thing-v1-technical-plan.md</code></li>
                <li>Initial SQL migration scaffold in <code>db/migrations/0001_one_thing_v1.sql</code></li>
                <li>Checkout success page and placeholder webhook / cron routes</li>
                <li>Environment contract for Stripe, Postmark, Postgres, and cron secrets</li>
              </ul>
            </article>

            <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent)]">
                Next tasks
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--foreground-soft)]">
                <li>Wire real Stripe Checkout and Billing Portal flows</li>
                <li>Implement onboarding for category selection and timezone capture</li>
                <li>Build the send worker, email renderer, and provider webhooks</li>
                <li>Add admin exports, failure reporting, and nightly backups</li>
              </ul>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
