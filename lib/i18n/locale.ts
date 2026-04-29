export type SiteLocale = "en" | "fr" | "es";

const SITE_LOCALES: SiteLocale[] = ["en", "fr", "es"];

export function normalizeSiteLocale(raw: string | null | undefined): SiteLocale {
  const value = raw?.trim().toLowerCase();

  if (value === "fr" || value === "es" || value === "en") {
    return value;
  }

  return "en";
}

export function isSiteLocale(value: string): value is SiteLocale {
  return SITE_LOCALES.includes(value as SiteLocale);
}
