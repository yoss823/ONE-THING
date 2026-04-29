"use client";

import { useState } from "react";
import Link from "next/link";

import type { HomeGuidedChoice } from "@/lib/i18n/home-page";

export type GuidedChoiceCopy = {
  intro: string;
  choices: HomeGuidedChoice[];
  ctaPrimary: string;
  ctaFootnote: string;
};

export default function GuidedChoice({ copy }: { copy: GuidedChoiceCopy }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="w-full mb-4">
      <p className="text-sm text-gray-400 mb-4">{copy.intro}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {copy.choices.map((choice, i) => (
          <button
            key={choice.label}
            type="button"
            onClick={() => setSelected(i)}
            className={`px-5 py-2.5 text-sm rounded-xl cursor-pointer transition-colors ${
              selected === i
                ? "border border-black bg-gray-100 text-[#111]"
                : "border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>

      {selected !== null ? (
        <div className="mt-8">
          <p className="text-base text-[#222] leading-relaxed">{copy.choices[selected].response}</p>
          <div className="mt-6">
            <Link
              href="/onboarding"
              className="inline-block bg-[#121212] text-white border border-[#121212] text-base font-medium px-8 py-4 rounded-full hover:bg-[#2a2a2a] transition-colors"
            >
              {copy.ctaPrimary}
            </Link>
            <p className="mt-3 text-sm text-gray-400">{copy.ctaFootnote}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
