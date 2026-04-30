import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePage } from "@/components/marketing/HomePage";
import { isSiteLocale, type SiteLocale } from "@/lib/i18n/locale";
import { getLocalizedHomeMetadata } from "@/lib/seo/home-metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): Array<{ locale: SiteLocale }> {
  return [{ locale: "en" }, { locale: "fr" }, { locale: "es" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isSiteLocale(raw)) {
    notFound();
  }
  return getLocalizedHomeMetadata(raw);
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isSiteLocale(raw)) {
    notFound();
  }
  return <HomePage locale={raw} />;
}
