import Link from "next/link";

import GuidedChoice from "@/components/GuidedChoice";
import { CONTACT_EMAIL } from "@/lib/site/contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHomePageCopy } from "@/lib/i18n/home-page";
import type { SiteLocale } from "@/lib/i18n/locale";
import { buildHomePageJsonLd } from "@/lib/seo/home-json-ld";

type Props = {
  locale: SiteLocale;
};

export function HomePage({ locale }: Props) {
  const home = getHomePageCopy(locale);
  const onboardingHref = `/onboarding?lang=${locale}`;

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#121212]">
      <JsonLd data={buildHomePageJsonLd(locale)} />

      <section className="grid min-h-[min(100dvh,920px)] grid-cols-1 lg:grid-cols-2 lg:min-h-[88vh]">
        <div className="flex flex-col justify-center bg-[#faf9f7] px-6 pb-12 pt-24 sm:px-10 lg:px-14 xl:pl-20 xl:pr-10 lg:pb-24 lg:pt-28">
          <p className="mb-8 text-xs uppercase tracking-[0.22em] text-[#8a8a8a]">{home.heroEyebrow}</p>
          <h1
            className="font-[var(--font-display)] text-5xl leading-[1.01] sm:text-6xl md:text-7xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {home.heroLine1}
            <br />
            {home.heroLine2}
            <br />
            {home.heroLine3}
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-[#4f4f4f]">{home.heroLead}</p>
        </div>

        <div className="flex flex-col justify-center bg-[#9fb393] px-6 pb-20 pt-4 sm:px-10 lg:px-14 lg:py-24">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-white/70 bg-white p-7 shadow-[0_28px_72px_rgba(18,42,24,0.22)] sm:p-8">
              <p className="mb-3 text-center text-sm text-[#7c7c7c] sm:text-left">{home.notSure}</p>
              <GuidedChoice
                onboardingHref={onboardingHref}
                copy={{
                  intro: home.guidedIntro,
                  choices: home.guidedChoices,
                  ctaPrimary: home.ctaPrimary,
                  ctaFootnote: home.ctaFootnote,
                }}
              />
              <p className="mb-4 mt-2 text-center text-sm text-[#636363]">{home.oneDecision}</p>
              <div className="flex justify-center sm:justify-start">
                <Link
                  href={onboardingHref}
                  className="inline-block cursor-pointer rounded-full border border-[#121212] bg-[#121212] px-8 py-4 text-base font-medium text-white transition-colors duration-200 hover:bg-[#2a2a2a]"
                >
                  {home.ctaPrimary}
                </Link>
              </div>
              <p className="mt-3 text-center text-sm text-[#8c8c8c] sm:text-left">{home.ctaFootnote}</p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/50 bg-white/85 px-6 py-6 shadow-[0_12px_40px_rgba(18,42,24,0.12)] backdrop-blur-sm">
              <p className="text-sm font-medium text-[#1a1a1a]">{home.subscriber.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#666]">{home.subscriber.description}</p>
              <Link
                href={`/account?lang=${locale}`}
                className="mt-4 inline-block text-sm font-medium text-[#121212] underline underline-offset-4 hover:text-[#444]"
              >
                {home.subscriber.linkLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="email-previews" className="scroll-mt-8 bg-[#edf2ea] px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="mb-7 text-xs uppercase tracking-[0.18em] text-[#8b8b8b]">{home.demoTitle}</p>
          <div className="email-card mx-auto max-w-md rounded-2xl border border-[#e4e0d8] bg-white p-7 font-mono text-sm shadow-[0_16px_48px_rgba(0,0,0,0.06)]">
            <p className="email-line-1 mb-4 text-xs text-[#8a8a8a]">{home.demoSubject}</p>
            <p className="email-line-2 mb-1 text-xs uppercase tracking-widest text-[#666]">
              {home.demoCategory}
            </p>
            <p className="email-line-3 mb-4 text-base font-serif italic text-[#151515]">{home.demoAction}</p>
            <p className="email-line-4 text-sm text-[#676767]">{home.demoFooter}</p>
          </div>
          <p className="mt-5 text-center text-xs text-[#8a8a8a]">{home.demoCaption}</p>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-7 text-xs font-medium uppercase tracking-[0.18em] text-[#8b8b8b]">
            {home.howTitle}
          </h2>
          <p className="text-2xl leading-relaxed text-[#1f1f1f]">
            {home.howBody.split("\n").map((line, index) => (
              <span key={`how-${index}`}>
                {index > 0 ? (
                  <>
                    <br />
                    <br />
                  </>
                ) : null}
                {line}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="bg-[#eef0eb] px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-xs font-medium uppercase tracking-[0.18em] text-[#8b8b8b]">
            {home.categoriesTitle}
          </h2>
          <ul className="space-y-4">
            {home.categories.map((cat) => (
              <li key={cat} className="text-xl text-[#232323]">
                {cat}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-8 bg-[#dfe8d8] px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-xs font-medium uppercase tracking-[0.18em] text-[#5a5f55]">
            {home.pricingTitle}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {home.plans.map((plan) => (
              <div
                key={plan.label}
                className="rounded-2xl border border-[#cfd9c7] bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-[#666]">{plan.label}</p>
                <p className="mt-3 font-[var(--font-display)] text-4xl leading-none text-[#151515]">
                  {plan.price}
                  <span className="text-base font-normal text-[#8a8a8a]">{plan.period}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <p className="mb-4 text-center text-sm text-[#636363]">{home.oneDecision}</p>
            <div className="flex justify-center">
              <Link
                href={onboardingHref}
                className="inline-block cursor-pointer rounded-full border border-[#121212] bg-[#121212] px-8 py-4 text-base font-medium text-white transition-colors duration-200 hover:bg-[#2a2a2a]"
              >
                {home.ctaPrimary}
              </Link>
            </div>
            <p className="mt-3 text-center text-sm text-[#8c8c8c]">{home.ctaFootnote}</p>
          </div>
        </div>
      </section>

      <footer className="bg-[#8fa886] px-6 py-12 text-white sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-white/85">{home.footerBrand}</p>
          <nav
            className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90"
            aria-label="Legal and help"
          >
            <Link href={`/l/${locale}/faq`} className="underline underline-offset-4 hover:text-white">
              {home.footerFaq}
            </Link>
            <Link href={`/l/${locale}/legal`} className="underline underline-offset-4 hover:text-white">
              {home.footerLegal}
            </Link>
            <Link href={`/l/${locale}/privacy`} className="underline underline-offset-4 hover:text-white">
              {home.footerPrivacy}
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-white">
              {home.footerContact}
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
