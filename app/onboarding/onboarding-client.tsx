"use client";

import { useMemo, useState } from "react";

import { getPlanForCategoryCount } from "@/lib/billing/plans";
import {
  getCategoryLabelForOnboarding,
  getOnboardingCopy,
  ONBOARDING_CATEGORY_SLUGS,
  selectionSummaryForCount,
} from "@/lib/i18n/onboarding";
import type { SiteLocale } from "@/lib/i18n/locale";

export function OnboardingClient({ siteLocale }: { siteLocale: SiteLocale }) {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [energy, setEnergy] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const copy = useMemo(() => getOnboardingCopy(siteLocale), [siteLocale]);

  const totalSteps = 4;

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((c) => c !== slug);
      }
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  }

  function handleContinue() {
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    const selectedPlan = getPlanForCategoryCount(selectedCategories.length);

    if (!selectedPlan) {
      setSubmissionError(copy.errChooseCategories);
      return;
    }

    const [, plan] = selectedPlan;

    const answers = {
      categories: selectedCategories,
      energy,
      time,
    };
    try {
      localStorage.setItem("onboarding_answers", JSON.stringify(answers));
    } catch {
      // ignore storage errors
    }

    setSubmissionError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          email,
          categories: selectedCategories,
          energyLevel: energy,
          availableMinutes: Number(time),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        }),
      });

      const data = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !data.url) {
        setSubmissionError(data.error ?? copy.errCheckout);
        setIsSubmitting(false);
        return;
      }

      window.location.assign(data.url);
    } catch {
      setSubmissionError(copy.errCheckout);
      setIsSubmitting(false);
    }
  }

  const selectionSummary =
    selectedCategories.length > 0
      ? selectionSummaryForCount(siteLocale, selectedCategories.length as 1 | 2 | 3)
      : null;

  return (
    <main className="min-h-screen bg-white text-[#111] flex flex-col">
      <div className="px-6 pt-10 max-w-xl mx-auto w-full">
        <p className="text-xs font-medium uppercase tracking-widest text-[#999]">
          {step} / {totalSteps}
        </p>
      </div>

      <div className="flex-1 px-6 pt-12 pb-20 max-w-xl mx-auto w-full">
        {step === 1 ? (
          <Step1
            copy={copy}
            siteLocale={siteLocale}
            selected={selectedCategories}
            onToggle={toggleCategory}
            onContinue={handleContinue}
            selectionSummary={selectionSummary}
          />
        ) : null}
        {step === 2 ? (
          <Step2 copy={copy} value={energy} onChange={setEnergy} onContinue={handleContinue} />
        ) : null}
        {step === 3 ? (
          <Step3 copy={copy} value={time} onChange={setTime} onContinue={handleContinue} />
        ) : null}
        {step === 4 ? (
          <Step4
            copy={copy}
            email={email}
            onChange={setEmail}
            onSubmit={() => void handleSubmit()}
            isSubmitting={isSubmitting}
            error={submissionError}
          />
        ) : null}
      </div>
    </main>
  );
}

function Step1({
  copy,
  siteLocale,
  selected,
  onToggle,
  onContinue,
  selectionSummary,
}: {
  copy: ReturnType<typeof getOnboardingCopy>;
  siteLocale: SiteLocale;
  selected: string[];
  onToggle: (slug: string) => void;
  onContinue: () => void;
  selectionSummary: string | null;
}) {
  return (
    <div>
      <h1
        className="text-3xl md:text-4xl leading-tight"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
      >
        {copy.step1Title}
      </h1>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ONBOARDING_CATEGORY_SLUGS.map((slug) => {
          const isSelected = selected.includes(slug);
          const label = getCategoryLabelForOnboarding(siteLocale, slug);
          return (
            <button
              key={slug}
              type="button"
              onClick={() => onToggle(slug)}
              className={`
                text-left px-5 py-4 border rounded-xl text-sm font-medium transition-colors
                ${
                  isSelected
                    ? "bg-[#111] text-white border-[#111]"
                    : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {selectionSummary ? (
        <p className="mt-6 text-sm text-[#555]">{selectionSummary}</p>
      ) : null}

      <div className="mt-10">
        <button
          type="button"
          onClick={onContinue}
          disabled={selected.length === 0}
          className="bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {copy.continue}
        </button>
      </div>
    </div>
  );
}

function Step2({
  copy,
  value,
  onChange,
  onContinue,
}: {
  copy: ReturnType<typeof getOnboardingCopy>;
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h1
        className="text-3xl md:text-4xl leading-tight"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
      >
        {copy.step2Title}
      </h1>

      <div className="mt-10 flex flex-col gap-3">
        {copy.energyOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              text-left px-5 py-4 border rounded-xl transition-colors
              ${
                value === opt.value
                  ? "bg-[#111] text-white border-[#111]"
                  : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
              }
            `}
          >
            <span className="text-sm font-medium">{opt.label}</span>
            <span
              className={`block text-xs mt-0.5 ${value === opt.value ? "text-[#aaa]" : "text-[#888]"}`}
            >
              {opt.description}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={onContinue}
          disabled={!value}
          className="bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {copy.continue}
        </button>
      </div>
    </div>
  );
}

function Step3({
  copy,
  value,
  onChange,
  onContinue,
}: {
  copy: ReturnType<typeof getOnboardingCopy>;
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h1
        className="text-3xl md:text-4xl leading-tight"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
      >
        {copy.step3Title}
      </h1>

      <div className="mt-10 flex flex-col gap-3">
        {copy.timeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              text-left px-5 py-4 border rounded-xl text-sm font-medium transition-colors
              ${
                value === opt.value
                  ? "bg-[#111] text-white border-[#111]"
                  : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={onContinue}
          disabled={!value}
          className="bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {copy.continue}
        </button>
      </div>
    </div>
  );
}

function Step4({
  copy,
  email,
  onChange,
  onSubmit,
  isSubmitting,
  error,
}: {
  copy: ReturnType<typeof getOnboardingCopy>;
  email: string;
  onChange: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting: boolean;
  error: string;
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && isValid && !isSubmitting) {
      void onSubmit();
    }
  }

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div>
      <h1
        className="text-3xl md:text-4xl leading-tight"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
      >
        {copy.step4Title}
      </h1>

      <div className="mt-10">
        <input
          type="email"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={copy.emailPlaceholder}
          autoFocus
          className="w-full border border-[#ddd] rounded-xl px-5 py-4 text-sm text-[#111] placeholder-[#bbb] outline-none focus:border-[#999] transition-colors"
        />
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={!isValid || isSubmitting}
          className="bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isSubmitting ? copy.startingCheckout : copy.continueToPayment}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-[#b42318]">{error}</p> : null}
    </div>
  );
}
