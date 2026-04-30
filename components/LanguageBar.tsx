"use client";

import { usePathname, useRouter } from "next/navigation";

import { readLangCommittedFromCookie } from "@/lib/browser/lang-commitment";
import { writeSiteLocaleCookie } from "@/lib/browser/site-locale-cookie";
import type { SiteLocale } from "@/lib/i18n/locale";

const OPTIONS: Array<{ value: SiteLocale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
  { value: "es", label: "ES" },
];

const HIDDEN_PREFIXES = [
  "/onboarding",
  "/welcome",
  "/checkout/success",
  "/account",
  "/admin",
  "/unsubscribe",
  "/tracked",
];

function shouldHideLanguageBar(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function LanguageBar() {
  const router = useRouter();
  const pathname = usePathname();
  const langCommitted =
    typeof window !== "undefined" && readLangCommittedFromCookie();

  if (shouldHideLanguageBar(pathname) || langCommitted) {
    return null;
  }

  function pickLocale(next: SiteLocale) {
    writeSiteLocaleCookie(next);
    router.refresh();
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 rounded-full border border-[#e4e4e4] bg-white/90 px-1 py-1 text-xs text-[#333] shadow-sm backdrop-blur">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => pickLocale(option.value)}
          className="rounded-full px-2.5 py-1 font-medium text-[#555] hover:bg-[#f3f3f3] hover:text-[#111]"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
