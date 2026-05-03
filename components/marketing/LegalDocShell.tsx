import type { ReactNode } from "react";
import Link from "next/link";

import { SupportingPageNav } from "@/components/marketing/SupportingPageNav";
import { getHomePageCopy } from "@/lib/i18n/home-page";
import type { SiteLocale } from "@/lib/i18n/locale";

type Props = {
  locale: SiteLocale;
  title: string;
  children: ReactNode;
};

export function LegalDocShell({ locale, title, children }: Props) {
  const home = getHomePageCopy(locale);

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#121212]">
      <div className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
        <Link
          href={`/l/${locale}`}
          className="text-sm font-medium text-[#5a5a5a] underline underline-offset-4 hover:text-[#0a0a0a]"
        >
          ← {home.footerBackHome}
        </Link>
        <h1
          className="mt-8 font-[var(--font-display)] text-4xl tracking-tight text-[#151515] sm:text-5xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        <div className="mt-10 space-y-10 rounded-2xl border border-[#e4e0d8] bg-white px-6 py-8 text-[15px] leading-relaxed text-[#333] shadow-sm sm:px-8">
          {children}
        </div>
        <SupportingPageNav locale={locale} />
      </div>
    </main>
  );
}
