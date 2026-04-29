import Link from "next/link";
import { cookies } from "next/headers";

import { getCheckoutSuccessCopy } from "@/lib/i18n/checkout-success-page";
import type { SiteLocale } from "@/lib/i18n/locale";
import { normalizeSiteLocale } from "@/lib/i18n/locale";

type Search = { [key: string]: string | string[] | undefined };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const langParam = typeof sp.lang === "string" ? sp.lang : undefined;
  const cookieStore = await cookies();
  const locale: SiteLocale = normalizeSiteLocale(
    langParam ?? cookieStore.get("onestep_locale")?.value,
  );
  const successPage = getCheckoutSuccessCopy(locale);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center">
        <section className="grid w-full gap-4 lg:grid-cols-[1.04fr_0.96fr]">
          <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
              {successPage.eyebrow}
            </p>
            <h1 className="mt-4 max-w-2xl font-[var(--font-display)] text-5xl leading-none md:text-6xl">
              {successPage.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--foreground-soft)]">
              {successPage.body}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[#213329]"
                href={successPage.primaryCta.href}
              >
                {successPage.primaryCta.label}
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,249,240,0.84)] px-6 py-3 text-sm font-semibold transition hover:border-[rgba(24,38,29,0.3)]"
                href={successPage.secondaryCta.href}
              >
                {successPage.secondaryCta.label}
              </Link>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[rgba(24,38,29,0.08)] bg-[rgba(255,249,240,0.88)] p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">{successPage.nextSteps}</p>
            <div className="mt-5 space-y-4">
              {successPage.checklist.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-[rgba(24,38,29,0.08)] bg-[rgba(255,255,255,0.5)] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                    {successPage.stepLabel(index + 1)}
                  </p>
                  <p className="mt-3 text-base leading-7 text-[var(--foreground)]">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
