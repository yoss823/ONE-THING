import Link from "next/link";

import { emailPreviewContent } from "@/content/one-thing/emails";
import {
  landingPageContent,
  pricingCardCopy,
} from "@/content/one-thing/marketing";
import { onboardingFlowContent } from "@/content/one-thing/onboarding";
import { PLAN_DEFINITIONS, PLAN_KEYS, type PlanKey } from "@/lib/billing/plans";

function formatMoney(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

function getBillingLine(planKey: PlanKey) {
  const plan = PLAN_DEFINITIONS[planKey];

  if (plan.intervalCount === 1) {
    return `${formatMoney(plan.priceCents)} / month`;
  }

  if (plan.intervalCount === 3) {
    return `${formatMoney(plan.priceCents)} every 3 months`;
  }

  return `${formatMoney(plan.priceCents)} / year`;
}

function getMonthlyEquivalent(planKey: PlanKey) {
  const plan = PLAN_DEFINITIONS[planKey];
  const equivalent = formatMoney(plan.priceCents / plan.intervalCount);

  if (plan.intervalCount === 1) {
    return `${equivalent} effective monthly cost`;
  }

  return `${equivalent} effective monthly cost`;
}

export default function Home() {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(215,92,47,0.12),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.35),transparent_42%),linear-gradient(180deg,rgba(255,249,240,0.92),rgba(249,244,234,0.82))]" />
          <div className="absolute inset-y-0 right-[16%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(24,38,29,0.18),transparent)] lg:block" />
          <div className="relative grid gap-10 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:py-12">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-[var(--foreground-soft)]">
                <span className="rounded-full border border-[var(--border)] bg-[rgba(255,249,240,0.78)] px-3 py-1">
                  OneStep
                </span>
                <span>Calm daily guidance by email</span>
              </div>

              <div className="max-w-3xl space-y-5">
                <p className="text-sm uppercase tracking-[0.32em] text-[var(--accent)]">
                  {landingPageContent.hero.eyebrow}
                </p>
                <h1 className="max-w-4xl font-[var(--font-display)] text-[3.3rem] leading-[0.94] md:text-[5.2rem]">
                  {landingPageContent.hero.title}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[var(--foreground-soft)] md:text-lg">
                  {landingPageContent.hero.body}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[#213329]"
                  href={landingPageContent.hero.primaryCta.href}
                >
                  {landingPageContent.hero.primaryCta.label}
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,249,240,0.82)] px-6 py-3 text-sm font-semibold transition hover:border-[rgba(24,38,29,0.34)]"
                  href={landingPageContent.hero.secondaryCta.href}
                >
                  {landingPageContent.hero.secondaryCta.label}
                </a>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {landingPageContent.promisePoints.map((point) => (
                  <article
                    key={point.title}
                    className="rounded-[1.4rem] border border-[var(--border)] bg-[rgba(255,250,242,0.74)] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                      Product rule
                    </p>
                    <h2 className="mt-3 font-[var(--font-display)] text-2xl leading-tight">
                      {point.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                      {point.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[1.8rem] border border-[rgba(24,38,29,0.12)] bg-[rgba(24,38,29,0.94)] p-6 text-[var(--background)] shadow-[0_22px_70px_rgba(24,38,29,0.18)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-[var(--accent-soft)]">
                      Tomorrow at 8:00 AM
                    </p>
                    <h2 className="mt-3 font-[var(--font-display)] text-4xl leading-tight">
                      Daily delivery preview
                    </h2>
                  </div>
                  <span className="rounded-full border border-[rgba(245,239,223,0.18)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[rgba(245,239,223,0.72)]">
                    {onboardingFlowContent.totalSeconds} sec setup
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {emailPreviewContent[0].sections.map((section) => (
                    <div
                      key={section.category}
                      className="rounded-[1.25rem] border border-[rgba(245,239,223,0.12)] bg-[rgba(245,239,223,0.08)] p-4"
                    >
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(255,154,111,0.84)]">
                        {section.category}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold leading-tight">
                        {section.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[rgba(245,239,223,0.78)]">
                        {section.instruction}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-[rgba(245,239,223,0.6)]">
                        <span>{section.minutes}</span>
                        <span>{section.why}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[1.8rem] border border-[var(--border)] bg-[rgba(255,249,240,0.88)] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                  Delivery pattern
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--foreground-soft)]">
                  {landingPageContent.operationalNotes.map((item) => (
                    <li
                      key={item}
                      className="rounded-[1rem] border border-[rgba(24,38,29,0.08)] bg-[rgba(255,255,255,0.42)] px-4 py-3"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
          <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] md:p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
              {landingPageContent.whyItWorks.eyebrow}
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl leading-tight md:text-5xl">
              {landingPageContent.whyItWorks.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--foreground-soft)]">
              {landingPageContent.whyItWorks.body}
            </p>
          </article>

          <article
            id="onboarding"
            className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] md:p-8"
          >
            <div className="grid gap-6 lg:grid-cols-[0.46fr_0.54fr]">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
                  {onboardingFlowContent.eyebrow}
                </p>
                <h2 className="font-[var(--font-display)] text-4xl leading-tight">
                  {onboardingFlowContent.title}
                </h2>
                <p className="text-base leading-8 text-[var(--foreground-soft)]">
                  {onboardingFlowContent.body}
                </p>
                <div className="rounded-[1.5rem] border border-[rgba(24,38,29,0.08)] bg-[rgba(255,255,255,0.44)] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                    Completion state
                  </p>
                  <h3 className="mt-3 font-[var(--font-display)] text-3xl leading-tight">
                    {onboardingFlowContent.completion.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    {onboardingFlowContent.completion.body}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {onboardingFlowContent.steps.map((step) => (
                  <article
                    key={step.step}
                    className="rounded-[1.5rem] border border-[rgba(24,38,29,0.08)] bg-[rgba(255,255,255,0.48)] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                          {step.step} {step.label}
                        </p>
                        <h3 className="mt-3 font-[var(--font-display)] text-3xl leading-tight">
                          {step.title}
                        </h3>
                      </div>
                      <span className="rounded-full border border-[rgba(24,38,29,0.12)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                        {step.seconds}s
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                      {step.body}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {step.fields.map((field) => (
                        <span
                          key={field}
                          className="rounded-full border border-[rgba(24,38,29,0.08)] bg-[rgba(245,239,223,0.9)] px-3 py-1 text-xs uppercase tracking-[0.16em]"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">
                      CTA: {step.cta}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section
          id="email-previews"
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] md:p-8"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
                Email templates
              </p>
              <h2 className="mt-4 font-[var(--font-display)] text-4xl leading-tight md:text-5xl">
                Calm, structured, and usable without opening anything else.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--foreground-soft)]">
              Each template is written to keep the next action visible, the time
              expectation explicit, and the follow-up links close to the task.
            </p>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            {emailPreviewContent.map((email) => (
              <article
                key={email.key}
                className="rounded-[1.7rem] border border-[rgba(24,38,29,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(249,242,230,0.92))] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                      {email.eyebrow}
                    </p>
                    <h3 className="mt-3 font-[var(--font-display)] text-3xl leading-tight">
                      {email.title}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[rgba(24,38,29,0.1)] bg-[rgba(255,249,240,0.84)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                    {email.sendTime}
                  </span>
                </div>

                <div className="mt-5 rounded-[1.4rem] border border-[rgba(24,38,29,0.08)] bg-[rgba(255,250,244,0.82)] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                    Subject
                  </p>
                  <p className="mt-2 text-base font-semibold">{email.subject}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    {email.preheader}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
                    {email.intro}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {email.sections.map((section) => (
                    <div
                      key={`${email.key}-${section.title}`}
                      className="rounded-[1.25rem] border border-[rgba(24,38,29,0.08)] bg-[rgba(255,255,255,0.48)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                          {section.category}
                        </p>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                          {section.minutes}
                        </span>
                      </div>
                      <h4 className="mt-2 text-xl font-semibold leading-tight">
                        {section.title}
                      </h4>
                      <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
                        {section.instruction}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                        Why: {section.why}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
                  {email.footer}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="pricing"
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] md:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[0.52fr_0.48fr]">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
                {landingPageContent.pricing.eyebrow}
              </p>
              <h2 className="font-[var(--font-display)] text-4xl leading-tight md:text-5xl">
                {landingPageContent.pricing.title}
              </h2>
              <p className="max-w-xl text-base leading-8 text-[var(--foreground-soft)]">
                {landingPageContent.pricing.body}
              </p>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">
                {landingPageContent.pricing.footnote}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {PLAN_KEYS.map((planKey) => {
                const plan = PLAN_DEFINITIONS[planKey];
                const copy = pricingCardCopy[planKey];

                return (
                  <article
                    key={planKey}
                    className={`rounded-[1.6rem] border p-5 ${
                      copy.featured
                        ? "border-[rgba(215,92,47,0.38)] bg-[rgba(255,246,237,0.95)]"
                        : "border-[rgba(24,38,29,0.08)] bg-[rgba(255,255,255,0.5)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                          {copy.label}
                        </p>
                        <h3 className="mt-3 font-[var(--font-display)] text-4xl leading-none">
                          {formatMoney(plan.priceCents)}
                        </h3>
                      </div>
                      {copy.featured ? (
                        <span className="rounded-full border border-[rgba(215,92,47,0.26)] bg-[rgba(215,92,47,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
                          Balanced
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                      {getBillingLine(planKey)}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
                      {copy.billingNote}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
                      {copy.comparisonNote}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--foreground-soft)]">
                      {getMonthlyEquivalent(planKey)}
                    </p>

                    <a
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[#213329]"
                      href={copy.href}
                    >
                      {copy.ctaLabel}
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] md:p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
              Questions
            </p>
            <div className="mt-5 space-y-4">
              {landingPageContent.faq.map((item) => (
                <article
                  key={item.question}
                  className="rounded-[1.35rem] border border-[rgba(24,38,29,0.08)] bg-[rgba(255,255,255,0.48)] p-5"
                >
                  <h2 className="font-[var(--font-display)] text-2xl leading-tight">
                    {item.question}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--border)] bg-[rgba(24,38,29,0.96)] p-6 text-[var(--background)] shadow-[0_24px_90px_rgba(24,38,29,0.2)] md:p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent-soft)]">
              Confirmation
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl leading-tight">
              After checkout, the instructions stay short.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[rgba(245,239,223,0.76)]">
              Confirmation messaging does not try to sell again. It confirms the
              plan, points to setup, and tells the user when the first email
              will arrive.
            </p>

            <div className="mt-6 rounded-[1.5rem] border border-[rgba(245,239,223,0.12)] bg-[rgba(245,239,223,0.08)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-soft)]">
                Confirmation email
              </p>
              <p className="mt-3 text-xl font-semibold">
                ONE THING is scheduled
              </p>
              <p className="mt-3 text-sm leading-7 text-[rgba(245,239,223,0.76)]">
                Confirm your setup so the first email arrives at 8:00 AM local
                time.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[var(--background)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[#fff4df]"
                href="/checkout/success"
              >
                Open confirmation page
              </Link>
              <a
                className="inline-flex items-center justify-center rounded-full border border-[rgba(245,239,223,0.16)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition hover:border-[rgba(245,239,223,0.34)]"
                href="#onboarding"
              >
                Review onboarding
              </a>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
