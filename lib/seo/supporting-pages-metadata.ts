import type { Metadata } from "next";

import type { SiteLocale } from "@/lib/i18n/locale";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

export type SupportingSlug = "faq" | "legal" | "privacy";

function getBaseUrl(): URL {
  const raw = tryResolvePublicBaseUrl() ?? "https://one-thing-nu.vercel.app";
  return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
}

function hreflangAlternates(
  base: URL,
  slug: SupportingSlug,
): Record<string, string> {
  return {
    en: new URL(`/l/en/${slug}`, base).toString(),
    fr: new URL(`/l/fr/${slug}`, base).toString(),
    es: new URL(`/l/es/${slug}`, base).toString(),
    "x-default": new URL(`/l/en/${slug}`, base).toString(),
  };
}

export function getSupportingPageMetadata(
  locale: SiteLocale,
  slug: SupportingSlug,
  title: string,
  description: string,
): Metadata {
  const base = getBaseUrl();
  const path = `/l/${locale}/${slug}`;
  const url = new URL(path, base).toString();

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: hreflangAlternates(base, slug),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "ONE THING",
      locale: locale === "en" ? "en_US" : locale === "fr" ? "fr_FR" : "es_ES",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const FAQ_TITLE: Record<SiteLocale, string> = {
  en: "FAQ — ONE THING",
  fr: "FAQ — ONE THING",
  es: "Preguntas frecuentes — ONE THING",
};

const FAQ_DESCRIPTION: Record<SiteLocale, string> = {
  en: "Answers about daily emails, billing, timezone, language, and unsubscribing for ONE THING.",
  fr: "Réponses sur les e-mails quotidiens, la facturation, le fuseau, la langue et la désinscription pour ONE THING.",
  es: "Respuestas sobre correos diarios, facturación, zona horaria, idioma y bajas para ONE THING.",
};

const LEGAL_TITLE: Record<SiteLocale, string> = {
  en: "Legal notice — ONE THING",
  fr: "Mentions légales — ONE THING",
  es: "Aviso legal — ONE THING",
};

const LEGAL_DESCRIPTION: Record<SiteLocale, string> = {
  en: "Publisher, hosting, and contact information for the ONE THING website and service.",
  fr: "Éditeur, hébergement et contact pour le site et le service ONE THING.",
  es: "Editor, alojamiento y contacto del sitio y del servicio ONE THING.",
};

const PRIVACY_TITLE: Record<SiteLocale, string> = {
  en: "Privacy policy — ONE THING",
  fr: "Politique de confidentialité — ONE THING",
  es: "Política de privacidad — ONE THING",
};

const PRIVACY_DESCRIPTION: Record<SiteLocale, string> = {
  en: "How ONE THING collects and uses personal data, retention, your rights, and cookies.",
  fr: "Comment ONE THING traite les données personnelles, durées, droits et cookies.",
  es: "Cómo ONE THING trata los datos personales, plazos, derechos y cookies.",
};

export function getFaqMetadata(locale: SiteLocale): Metadata {
  return getSupportingPageMetadata(locale, "faq", FAQ_TITLE[locale], FAQ_DESCRIPTION[locale]);
}

export function getLegalMetadata(locale: SiteLocale): Metadata {
  return getSupportingPageMetadata(locale, "legal", LEGAL_TITLE[locale], LEGAL_DESCRIPTION[locale]);
}

export function getPrivacyMetadata(locale: SiteLocale): Metadata {
  return getSupportingPageMetadata(
    locale,
    "privacy",
    PRIVACY_TITLE[locale],
    PRIVACY_DESCRIPTION[locale],
  );
}
