import type { Metadata } from "next";
import { cookies } from "next/headers";

import { HomePage } from "@/components/marketing/HomePage";
import { normalizeSiteLocale } from "@/lib/i18n/locale";
import { getLocalizedHomeMetadata } from "@/lib/seo/home-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeSiteLocale(cookieStore.get("onestep_locale")?.value);
  return getLocalizedHomeMetadata(locale);
}

export default async function Home() {
  const cookieStore = await cookies();
  const locale = normalizeSiteLocale(cookieStore.get("onestep_locale")?.value);
  return <HomePage locale={locale} />;
}
