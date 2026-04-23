"use client";

import { useState } from "react";
import Link from "next/link";

const choices = [
  {
    label: "Overwhelmed",
    response: "ONE THING removes the decision. One action, chosen for you.",
  },
  {
    label: "Stuck in my head",
    response: "Action breaks the loop. You just have to do one thing.",
  },
  {
    label: "Inconsistent lately",
    response: "Consistency without pressure. Same time, every morning.",
  },
];

export default function GuidedChoice() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="w-full mb-4">
      <p className="text-sm text-gray-400 mb-4">This works best if you feel...</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {choices.map((choice, i) => (
          <button
            key={choice.label}
            onClick={() => setSelected(i)}
            className={`px-5 py-2.5 text-sm rounded-none cursor-pointer transition-colors ${
              selected === i
                ? "border border-black bg-gray-100 text-[#111]"
                : "border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="mt-8">
          <p className="text-base text-[#222] leading-relaxed">
            {choices[selected].response}
          </p>
          <div className="mt-6">
            <Link
              href="/onboarding"
              className="inline-block bg-black text-white font-semibold px-8 py-4 text-base rounded-none hover:bg-gray-900 transition-colors"
            >
              Start tomorrow at 8:00 AM
            </Link>
            <p className="mt-3 text-sm text-gray-400">One email. One action. No login.</p>
          </div>
        </div>
      )}
    </div>
  );
}
