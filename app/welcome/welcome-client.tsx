"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";

import { writeLangCommittedCookie } from "@/lib/browser/lang-commitment";
import { writeSiteLocaleCookie } from "@/lib/browser/site-locale-cookie";
import { getCategoryLabelForOnboarding } from "@/lib/i18n/onboarding";
import type { SiteLocale } from "@/lib/i18n/locale";
import { getWelcomeScreenCopy } from "@/lib/i18n/welcome-screen";

type OnboardingAnswers = {
  categories: string[];
  energy: string;
  time: string;
};

function readOnboardingAnswers(): OnboardingAnswers | null {
  try {
    const raw = localStorage.getItem("onboarding_answers");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingAnswers;
    if (!parsed || !Array.isArray(parsed.categories)) return null;
    return parsed;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

function onboardingAnswersSnapshot(): OnboardingAnswers | null {
  if (typeof window === "undefined") {
    return null;
  }
  return readOnboardingAnswers();
}

export function WelcomeClient({
  locale,
  hasCheckoutSession,
}: {
  locale: SiteLocale;
  hasCheckoutSession: boolean;
}) {
  const copy = useMemo(() => getWelcomeScreenCopy(locale), [locale]);
  const onboarding = useSyncExternalStore(noopSubscribe, onboardingAnswersSnapshot, () => null);

  useEffect(() => {
    writeSiteLocaleCookie(locale);
    if (hasCheckoutSession) {
      writeLangCommittedCookie();
    }
  }, [locale, hasCheckoutSession]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[480px]">
        <h1
          className="text-4xl md:text-5xl font-bold tracking-tight text-[#111] mb-6"
          style={{ letterSpacing: "-0.03em", lineHeight: 1 }}
        >
          {copy.title}
        </h1>

        <p className="text-base leading-7 text-[#555] mb-4">{copy.lead1}</p>
        <p className="text-base leading-7 text-[#555] mb-8">{copy.lead2}</p>

        {onboarding && onboarding.categories.length > 0 ? (
          <div className="border border-[#e5e5e5] rounded-2xl bg-[#faf8f2] px-5 py-5 text-sm leading-7 text-[#555] mb-8">
            <p className="font-medium text-[#333] mb-2">{copy.recapTitle}</p>
            <p>
              {copy.categoriesPrefix}{" "}
              {onboarding.categories
                .map((slug) => getCategoryLabelForOnboarding(locale, slug))
                .join(", ")}
            </p>
            {onboarding.energy ? (
              <p className="mt-1">
                {copy.energyPrefix}{" "}
                {copy.energyLabels[onboarding.energy.toLowerCase()] ?? onboarding.energy}
              </p>
            ) : null}
            {onboarding.time != null && onboarding.time !== "" ? (
              <p className="mt-1">
                {copy.timePrefix} {onboarding.time} min
              </p>
            ) : null}
          </div>
        ) : null}

        <p className="text-sm text-[#888]">
          {copy.manageLine}{" "}
          <Link
            href={`/account?lang=${locale}`}
            className="text-[#111] underline underline-offset-2"
          >
            {copy.manageLink}
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
