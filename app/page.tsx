import { cookies } from "next/headers";
import Link from "next/link";
import GuidedChoice from "@/components/GuidedChoice";
import { getHomePageCopy } from "@/lib/i18n/home-page";
import { normalizeSiteLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("onestep_locale")?.value;
  const locale = normalizeSiteLocale(cookieLocale);
  const home = getHomePageCopy(locale);
  const onboardingHref = `/onboarding?lang=${locale}`;

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#121212]">
      {/* Hero */}
      <section className="px-6 pt-24 pb-24 max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.22em] text-[#8a8a8a] mb-8">{home.heroEyebrow}</p>
        <h1
          className="font-[var(--font-display)] text-5xl sm:text-6xl leading-[1.01] md:text-7xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          {home.heroLine1}
          <br />
          {home.heroLine2}
          <br />
          {home.heroLine3}
        </h1>
        <p className="mt-8 text-xl text-[#4f4f4f] leading-relaxed max-w-2xl">{home.heroLead}</p>
        <div className="mt-12">
          <p className="text-sm text-[#7c7c7c] text-center mb-3">{home.notSure}</p>
          <GuidedChoice
            onboardingHref={onboardingHref}
            copy={{
              intro: home.guidedIntro,
              choices: home.guidedChoices,
              ctaPrimary: home.ctaPrimary,
              ctaFootnote: home.ctaFootnote,
            }}
          />
          <p className="text-sm text-[#636363] text-center mb-4">{home.oneDecision}</p>
          <Link
            href={onboardingHref}
            className="inline-block bg-[#121212] text-white border border-[#121212] text-base font-medium px-8 py-4 rounded-full hover:bg-[#2a2a2a] transition-colors duration-200 cursor-pointer"
          >
            {home.ctaPrimary}
          </Link>
          <p className="mt-3 text-sm text-[#8c8c8c]">{home.ctaFootnote}</p>
        </div>

        <div className="mt-14 rounded-2xl border border-[#e7e7e7] bg-white px-6 py-6 max-w-xl">
          <p className="text-sm font-medium text-[#1a1a1a]">{home.subscriber.title}</p>
          <p className="mt-2 text-sm text-[#666] leading-relaxed">{home.subscriber.description}</p>
          <Link
            href="/account"
            className="mt-4 inline-block text-sm font-medium text-[#121212] underline underline-offset-4 hover:text-[#444]"
          >
            {home.subscriber.linkLabel}
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e7e7e7]" />

      {/* Mini Demo */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <p className="text-xs text-[#8b8b8b] mb-7 uppercase tracking-[0.18em]">{home.demoTitle}</p>
        <div className="email-card border border-[#e7e7e7] rounded-2xl p-7 max-w-md mx-auto font-mono text-sm bg-white">
          <p className="email-line-1 text-xs text-[#8a8a8a] mb-4">{home.demoSubject}</p>
          <p className="email-line-2 text-xs uppercase tracking-widest text-[#666] mb-1">
            {home.demoCategory}
          </p>
          <p className="email-line-3 text-base text-[#151515] mb-4 font-serif italic">{home.demoAction}</p>
          <p className="email-line-4 text-sm text-[#676767]">{home.demoFooter}</p>
        </div>
        <p className="text-xs text-[#8a8a8a] mt-5 text-center">{home.demoCaption}</p>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e7e7e7]" />

      {/* How it works */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b8b8b] mb-7">
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
      </section>

      {/* Divider */}
      <div className="border-t border-[#e7e7e7]" />

      {/* Categories */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b8b8b] mb-8">
          {home.categoriesTitle}
        </h2>
        <ul className="space-y-4">
          {home.categories.map((cat) => (
            <li key={cat} className="text-xl text-[#232323]">
              {cat}
            </li>
          ))}
        </ul>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e7e7e7]" />

      {/* Pricing */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b8b8b] mb-8">
          {home.pricingTitle}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {home.plans.map((plan) => (
            <div
              key={plan.label}
              className="border border-[#e7e7e7] bg-white rounded-2xl p-6"
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
          <p className="text-sm text-[#636363] text-center mb-4">{home.oneDecision}</p>
          <Link
            href={onboardingHref}
            className="inline-block bg-[#121212] text-white border border-[#121212] text-base font-medium px-8 py-4 rounded-full hover:bg-[#2a2a2a] transition-colors duration-200 cursor-pointer"
          >
            {home.ctaPrimary}
          </Link>
          <p className="mt-3 text-sm text-[#8c8c8c]">{home.ctaFootnote}</p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e7e7e7]" />

      {/* Footer */}
      <footer className="px-6 py-12 max-w-3xl mx-auto">
        <p className="text-sm text-[#8a8a8a]">{home.footerBrand}</p>
      </footer>
    </main>
  );
}
