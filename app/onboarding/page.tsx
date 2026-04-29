import { cookies } from "next/headers";

import { OnboardingClient } from "@/app/onboarding/onboarding-client";
import type { SiteLocale } from "@/lib/i18n/locale";
import { normalizeSiteLocale } from "@/lib/i18n/locale";

type Search = { [key: string]: string | string[] | undefined };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const langFromUrl = typeof sp.lang === "string" ? sp.lang : undefined;
  const cookieStore = await cookies();
  const siteLocale: SiteLocale = normalizeSiteLocale(
    langFromUrl ?? cookieStore.get("onestep_locale")?.value,
  );

  return <OnboardingClient siteLocale={siteLocale} />;
}
