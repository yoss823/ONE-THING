import type { Metadata } from "next";

import type { SiteLocale } from "@/lib/i18n/locale";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

const SEO_TITLE: Record<SiteLocale, string> = {
  en: "ONE THING — one morning action, tailored to your life",
  fr: "ONE THING — une action du matin, adaptée à ta vie",
  es: "ONE THING — una acción matutina, adaptada a tu vida",
};

const SEO_DESCRIPTION: Record<SiteLocale, string> = {
  en: "Pick your focus areas and get one clear daily action by email, a weekly recap, and a monthly clarity check. Built for busy people who want progress without overwhelm.",
  fr: "Choisis tes axes et reçois une action claire chaque matin par email, un résumé hebdo et un bilan mensuel. Pour avancer sans te noyer.",
  es: "Elige tus focos y recibe una acción clara cada mañana por email, un resumen semanal y un chequeo mensual. Progreso sin agobio.",
};

function getBaseUrl(): URL {
  const raw = tryResolvePublicBaseUrl() ?? "https://one-thing-nu.vercel.app";
  return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
}

export function getLocalizedHomeMetadata(locale: SiteLocale): Metadata {
  const base = getBaseUrl();
  const path = `/l/${locale}`;
  const url = new URL(path, base).toString();

  const languages: Record<string, string> = {
    en: new URL("/l/en", base).toString(),
    fr: new URL("/l/fr", base).toString(),
    es: new URL("/l/es", base).toString(),
    "x-default": new URL("/l/en", base).toString(),
  };

  return {
    title: SEO_TITLE[locale],
    description: SEO_DESCRIPTION[locale],
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: SEO_TITLE[locale],
      description: SEO_DESCRIPTION[locale],
      url,
      siteName: "ONE THING",
      locale: locale === "en" ? "en_US" : locale === "fr" ? "fr_FR" : "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SEO_TITLE[locale],
      description: SEO_DESCRIPTION[locale],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
