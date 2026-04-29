"use client";

import { useRouter } from "next/navigation";

import type { SiteLocale } from "@/lib/i18n/locale";

const OPTIONS: Array<{ value: SiteLocale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
  { value: "es", label: "ES" },
];

export function LanguageBar() {
  const router = useRouter();

  function pickLocale(next: SiteLocale) {
    document.cookie = `onestep_locale=${next};path=/;max-age=31536000;SameSite=Lax`;
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
