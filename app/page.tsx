import Link from "next/link";

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
          <Link
            href="/onboarding"
            className="inline-block bg-[#111] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#333] transition-colors"
          >
            Pick your one thing
          </Link>
        </div>
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
          <Link
            href="/onboarding"
            className="inline-block bg-[#111] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#333] transition-colors"
          >
            Pick your one thing
          </Link>
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
