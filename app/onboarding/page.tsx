import { cookies } from "next/headers";

import { OnboardingClient } from "@/app/onboarding/onboarding-client";
import type { SiteLocale } from "@/lib/i18n/locale";
import { normalizeSiteLocale } from "@/lib/i18n/locale";

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const siteLocale: SiteLocale = normalizeSiteLocale(cookieStore.get("onestep_locale")?.value);

  return <OnboardingClient siteLocale={siteLocale} />;
}
