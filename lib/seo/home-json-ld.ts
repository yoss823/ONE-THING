import type { SiteLocale } from "@/lib/i18n/locale";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

import { SEO_DESCRIPTION } from "@/lib/seo/home-metadata";

const BCP47: Record<SiteLocale, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
};

/**
 * JSON-LD for the marketing home (Organization + WebSite) — helps search engines
 * understand the brand and the localized landing URL.
 */
export function buildHomePageJsonLd(locale: SiteLocale): Record<string, unknown> {
  const raw = tryResolvePublicBaseUrl() ?? "https://one-thing-nu.vercel.app";
  const origin = new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw).origin;
  const canonical = new URL(`/l/${locale}`, `${origin}/`).toString();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "ONE THING",
        url: `${origin}/`,
        description: SEO_DESCRIPTION[locale],
      },
      {
        "@type": "WebSite",
        "@id": `${canonical}#website`,
        name: "ONE THING",
        url: canonical,
        description: SEO_DESCRIPTION[locale],
        inLanguage: BCP47[locale],
        publisher: { "@id": `${origin}/#organization` },
      },
    ],
  };
}
