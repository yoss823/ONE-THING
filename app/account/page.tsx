"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const THEME_OPTIONS = [
  { value: "mental_clarity", label: "Mental clarity" },
  { value: "organization", label: "Organization" },
  { value: "health_energy", label: "Health / Energy" },
  { value: "work_business", label: "Work / Business" },
  { value: "personal_projects", label: "Personal projects" },
  { value: "relationships", label: "Relationships" },
];

function AccountContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const [email, setEmail] = useState("");
  const [isResolvingAccess, setIsResolvingAccess] = useState(false);
  const [overview, setOverview] = useState<{
    planLabel: string;
    changesRemainingThisMonth: number;
    progress: {
      sentCount: number;
      completedCount: number;
      skippedCount: number;
      completionRate: number;
    };
  } | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      if (!userId) {
        setOverview(null);
        return;
      }

      setIsLoadingOverview(true);

      try {
        const response = await fetch(
          `/api/account/overview?userId=${encodeURIComponent(userId)}`,
        );
        const data = (await response.json()) as {
          error?: string;
          planLabel?: string;
          changesRemainingThisMonth?: number;
          progress?: {
            sentCount: number;
            completedCount: number;
            skippedCount: number;
            completionRate: number;
          };
        };

        if (!response.ok || !data.planLabel || !data.progress) {
          if (isMounted) {
            setError(data.error ?? "Unable to load account overview.");
          }
          return;
        }

        if (isMounted) {
          setOverview({
            planLabel: data.planLabel,
            changesRemainingThisMonth: data.changesRemainingThisMonth ?? 0,
            progress: data.progress,
          });
        }
      } catch {
        if (isMounted) {
          setError("Unable to load account overview.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingOverview(false);
        }
      }
    }

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  async function handleAccessLookup() {
    setError("");
    setMessage("");
    setIsResolvingAccess(true);

    try {
      const response = await fetch("/api/account/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { error?: string; accountUrl?: string };

      if (!response.ok || !data.accountUrl) {
        setError(data.error ?? "Unable to find your account.");
        return;
      }

      window.location.assign(data.accountUrl);
    } catch {
      setError("Unable to find your account.");
    } finally {
      setIsResolvingAccess(false);
    }
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

      setOverview((prev) =>
        prev
          ? {
              ...prev,
              changesRemainingThisMonth: data.changesRemainingThisMonth ?? 0,
            }
          : prev,
      );
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
          <>
            <p className="mt-6 text-sm text-[#666]">
              Enter your subscription email to open your account.
            </p>
            <div className="mt-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#ddd] rounded-xl px-5 py-4 text-sm text-[#111] placeholder-[#bbb] outline-none focus:border-[#999] transition-colors"
              />
            </div>
            <button
              onClick={handleAccessLookup}
              disabled={!email || isResolvingAccess}
              className="mt-4 bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isResolvingAccess ? "Opening..." : "Open my account"}
            </button>
          </>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border border-[#e7e7e7] rounded-xl p-4 bg-white">
                <p className="text-xs uppercase tracking-wide text-[#8b8b8b]">Plan</p>
                <p className="mt-2 text-lg text-[#121212]">
                  {isLoadingOverview ? "Loading..." : overview?.planLabel ?? "—"}
                </p>
              </div>
              <div className="border border-[#e7e7e7] rounded-xl p-4 bg-white">
                <p className="text-xs uppercase tracking-wide text-[#8b8b8b]">Completed</p>
                <p className="mt-2 text-lg text-[#121212]">
                  {isLoadingOverview ? "…" : overview?.progress.completedCount ?? 0}
                </p>
              </div>
              <div className="border border-[#e7e7e7] rounded-xl p-4 bg-white">
                <p className="text-xs uppercase tracking-wide text-[#8b8b8b]">Completion rate</p>
                <p className="mt-2 text-lg text-[#121212]">
                  {isLoadingOverview ? "…" : `${overview?.progress.completionRate ?? 0}%`}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#666]">
              Changes remaining this month:{" "}
              <span className="font-medium text-[#111]">
                {isLoadingOverview ? "…" : overview?.changesRemainingThisMonth ?? 0}
              </span>
            </p>

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

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white text-[#111] px-6 py-12">
          <div className="max-w-xl mx-auto">
            <p className="text-sm text-[#666]">Loading account...</p>
          </div>
        </main>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
