import Link from "next/link";
import GuidedChoice from "@/components/GuidedChoice";

const categories = [
  "Mental clarity",
  "Organization",
  "Health / Energy",
  "Work / Business",
  "Personal projects",
  "Relationships",
];

const plans = [
  { label: "1 category", price: "$4.99", period: "/month" },
  { label: "2 categories", price: "$7.99", period: "/month" },
  { label: "3 categories", price: "$9.99", period: "/month" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#111]">
      {/* Hero */}
      <section className="px-6 pt-24 pb-20 max-w-2xl mx-auto">
        <h1
          className="font-[var(--font-display)] text-4xl sm:text-5xl leading-[1.05] md:text-6xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          ONE THING — Stop deciding. Start doing.
        </h1>
        <p className="mt-6 text-lg text-[#555] leading-relaxed">
          One concrete action per morning. Per category you choose. Nothing
          else.
        </p>
        <div className="mt-10">
          <p className="text-sm text-stone-400 text-center mb-2">Not sure this is for you?</p>
          <GuidedChoice />
          <p className="text-sm text-stone-500 text-center mb-3">One decision. Tomorrow morning is handled.</p>
          <Link
            href="/onboarding"
            className="inline-block bg-stone-900 text-white font-semibold px-8 py-4 text-lg rounded-none border border-stone-800 shadow-md hover:bg-stone-800 hover:text-white transition-colors duration-150"
          >
            Start tomorrow at 8:00 AM
          </Link>
          <p className="mt-3 text-sm text-gray-400">One email. One action. No login.</p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* Mini Demo */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <p className="text-xs text-gray-400 mb-6 uppercase tracking-wide">What you receive every morning.</p>
        <div className="email-card border border-gray-200 rounded-sm p-6 max-w-sm mx-auto font-mono text-sm bg-white">
          <p className="email-line-1 text-xs text-gray-400 mb-4">Your one thing for Monday, May 5</p>
          <p className="email-line-2 text-xs uppercase tracking-wide text-gray-500 mb-1">Health / Energy</p>
          <p className="email-line-3 text-base text-gray-900 mb-4 font-serif italic">Do 10 slow deep breaths before opening your laptop.</p>
          <p className="email-line-4 text-sm text-gray-500">✅ Done &nbsp;·&nbsp; ⏸ Skip for today</p>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">That&apos;s it. Every morning at 8:00 AM.</p>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* How it works */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <h2 className="text-xs font-medium uppercase tracking-widest text-[#888] mb-6">
          How it works
        </h2>
        <p className="text-xl leading-relaxed text-[#222]">
          Every morning at 8:00 AM, one email.
          <br />
          One action. 5 to 15 minutes.
          <br />
          Done.
        </p>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* Categories */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <h2 className="text-xs font-medium uppercase tracking-widest text-[#888] mb-8">
          Categories
        </h2>
        <ul className="space-y-3">
          {categories.map((cat) => (
            <li key={cat} className="text-lg text-[#222]">
              {cat}
            </li>
          ))}
        </ul>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* Pricing */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <h2 className="text-xs font-medium uppercase tracking-widest text-[#888] mb-8">
          Pricing
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.label}
              className="border border-[#e5e5e5] rounded-2xl p-6"
            >
              <p className="text-sm text-[#555]">{plan.label}</p>
              <p className="mt-3 font-[var(--font-display)] text-4xl leading-none">
                {plan.price}
                <span className="text-base font-normal text-[#888]">
                  {plan.period}
                </span>
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <p className="text-sm text-stone-500 text-center mb-3">One decision. Tomorrow morning is handled.</p>
          <Link
            href="/onboarding"
            className="inline-block bg-stone-900 text-white font-semibold px-8 py-4 text-lg rounded-none border border-stone-800 shadow-md hover:bg-stone-800 hover:text-white transition-colors duration-150"
          >
            Start tomorrow at 8:00 AM
          </Link>
          <p className="mt-3 text-sm text-gray-400">One email. One action. No login.</p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* Footer */}
      <footer className="px-6 py-10 max-w-2xl mx-auto">
        <p className="text-sm text-gray-400">ONE THING</p>
      </footer>
    </main>
  );
}
