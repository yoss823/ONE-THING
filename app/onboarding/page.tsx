"use client";

import { useState } from "react";

import { getPlanForCategoryCount } from "@/lib/billing/plans";

const CATEGORIES = [
  "Mental clarity",
  "Organization",
  "Health / Energy",
  "Work / Business",
  "Personal projects",
  "Relationships",
];

const ENERGY_OPTIONS = [
  { value: "low", label: "🔋 Low", description: "I need gentle, easy actions" },
  { value: "medium", label: "⚡ Medium", description: "I can do most things" },
  { value: "high", label: "🚀 High", description: "Give me something real" },
];

const TIME_OPTIONS = [
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
];

const PRICE_MAP: Record<number, string> = {
  1: "$4.99/month",
  2: "$7.99/month",
  3: "$9.99/month",
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [energy, setEnergy] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const totalSteps = 4;

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.filter((c) => c !== cat);
      }
      if (prev.length >= 3) return prev; // silently block 4th
      return [...prev, cat];
    });
  }

  function handleContinue() {
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    const selectedPlan = getPlanForCategoryCount(selectedCategories.length);

    if (!selectedPlan) {
      setSubmissionError("Choose 1 to 3 categories before continuing.");
      return;
    }

    const [, plan] = selectedPlan;

    // Store answers in localStorage
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
        }),
      });

      const data = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !data.url) {
        setSubmissionError(data.error ?? "Unable to start Stripe checkout.");
        setIsSubmitting(false);
        return;
      }

      window.location.assign(data.url);
    } catch {
      setSubmissionError("Unable to start Stripe checkout.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#111] flex flex-col">
      {/* Step indicator */}
      <div className="px-6 pt-10 max-w-xl mx-auto w-full">
        <p className="text-xs font-medium uppercase tracking-widest text-[#999]">
          {step} / {totalSteps}
        </p>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 pt-12 pb-20 max-w-xl mx-auto w-full">
        {step === 1 && (
          <Step1
            selected={selectedCategories}
            onToggle={toggleCategory}
            onContinue={handleContinue}
          />
        )}
        {step === 2 && (
          <Step2
            value={energy}
            onChange={setEnergy}
            onContinue={handleContinue}
          />
        )}
        {step === 3 && (
          <Step3
            value={time}
            onChange={setTime}
            onContinue={handleContinue}
          />
        )}
        {step === 4 && (
          <Step4
            email={email}
            onChange={setEmail}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={submissionError}
          />
        )}
      </div>
    </main>
  );
}

// ─── Step 1: Category selection ───────────────────────────────────────────────

function Step1({
  selected,
  onToggle,
  onContinue,
}: {
  selected: string[];
  onToggle: (cat: string) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h1
        className="text-3xl md:text-4xl leading-tight"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
      >
        What do you want ONE THING to help with?
      </h1>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className={`
                text-left px-5 py-4 border rounded-xl text-sm font-medium transition-colors
                ${
                  isSelected
                    ? "bg-[#111] text-white border-[#111]"
                    : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                }
              `}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="mt-6 text-sm text-[#555]">
          {selected.length} selected →{" "}
          <span className="font-medium text-[#111]">
            {PRICE_MAP[selected.length]}
          </span>
        </p>
      )}

      <div className="mt-10">
        <button
          onClick={onContinue}
          disabled={selected.length === 0}
          className="bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Energy level ─────────────────────────────────────────────────────

function Step2({
  value,
  onChange,
  onContinue,
}: {
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
        How do you usually feel in the morning?
      </h1>

      <div className="mt-10 flex flex-col gap-3">
        {ENERGY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
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
          onClick={onContinue}
          disabled={!value}
          className="bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Available time ───────────────────────────────────────────────────

function Step3({
  value,
  onChange,
  onContinue,
}: {
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
        How much time do you have each morning?
      </h1>

      <div className="mt-10 flex flex-col gap-3">
        {TIME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
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
          onClick={onContinue}
          disabled={!value}
          className="bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Email ────────────────────────────────────────────────────────────

function Step4({
  email,
  onChange,
  onSubmit,
  isSubmitting,
  error,
}: {
  email: string;
  onChange: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting: boolean;
  error: string;
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && isValid && !isSubmitting) {
      onSubmit();
    }
  }

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div>
      <h1
        className="text-3xl md:text-4xl leading-tight"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
      >
        Where should we send your daily action?
      </h1>

      <div className="mt-10">
        <input
          type="email"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="you@example.com"
          autoFocus
          className="w-full border border-[#ddd] rounded-xl px-5 py-4 text-sm text-[#111] placeholder-[#bbb] outline-none focus:border-[#999] transition-colors"
        />
      </div>

      <div className="mt-8">
        <button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Starting checkout..." : "Continue to payment"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-[#b42318]">{error}</p> : null}
    </div>
  );
}
