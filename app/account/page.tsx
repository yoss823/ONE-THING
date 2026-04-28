"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const THEME_OPTIONS = [
  { value: "mental_clarity", label: "Mental clarity" },
  { value: "organization", label: "Organization" },
  { value: "health_energy", label: "Health / Energy" },
  { value: "work_business", label: "Work / Business" },
  { value: "personal_projects", label: "Personal projects" },
  { value: "relationships", label: "Relationships" },
];

export default function AccountPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => Boolean(userId) && selected.length >= 1 && selected.length <= 3 && !isSubmitting,
    [isSubmitting, selected.length, userId],
  );

  function toggleTheme(value: string) {
    setSelected((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, value];
    });
  }

  async function handleSubmit() {
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/account/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          categories: selected,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        changesRemainingThisMonth?: number;
      };

      if (!response.ok) {
        setError(data.error ?? "Unable to update themes.");
        return;
      }

      setMessage(
        `Themes updated. Changes remaining this month: ${data.changesRemainingThisMonth ?? 0}.`,
      );
    } catch {
      setError("Unable to update themes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#111] px-6 py-12">
      <div className="max-w-xl mx-auto">
        <h1
          className="text-3xl md:text-4xl leading-tight"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
        >
          Manage themes
        </h1>
        <p className="mt-4 text-sm text-[#666]">
          You can change themes up to 3 times per month. Your plan still defines how many
          themes are allowed (1, 2, or 3).
        </p>

        {!userId ? (
          <p className="mt-6 text-sm text-[#b42318]">
            Missing account link. Open this page from a ONE THING email.
          </p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = selected.includes(theme.value);
                return (
                  <button
                    key={theme.value}
                    onClick={() => toggleTheme(theme.value)}
                    className={`text-left px-5 py-4 border rounded-xl text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-[#111] text-white border-[#111]"
                        : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                    }`}
                  >
                    {theme.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="mt-8 bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save themes"}
            </button>

            {message ? <p className="mt-4 text-sm text-[#166534]">{message}</p> : null}
            {error ? <p className="mt-4 text-sm text-[#b42318]">{error}</p> : null}
          </>
        )}
      </div>
    </main>
  );
}
