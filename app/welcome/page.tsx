import { Suspense } from "react";
import { cookies } from "next/headers";

import { WelcomeClient } from "@/app/welcome/welcome-client";
import type { SiteLocale } from "@/lib/i18n/locale";
import { normalizeSiteLocale } from "@/lib/i18n/locale";
import { getWelcomeScreenCopy } from "@/lib/i18n/welcome-screen";

type Search = { [key: string]: string | string[] | undefined };

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;
  const langFromStripe = typeof sp.lang === "string" ? sp.lang : undefined;

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get("onestep_locale")?.value;
  const locale: SiteLocale = normalizeSiteLocale(langFromStripe ?? fromCookie);
  const copy = getWelcomeScreenCopy(locale);

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center px-6">
          <p className="text-sm text-[#888]">{copy.loading}</p>
        </main>
      }
    >
      <WelcomeClient locale={locale} hasCheckoutSession={Boolean(sessionId)} />
    </Suspense>
  );
}
