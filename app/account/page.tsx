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

const ENERGY_OPTIONS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
];

const TIME_OPTIONS = [5, 10, 15];

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
];

const DB_THEME_TO_OPTION: Record<string, string> = {
  MENTAL_CLARITY: "mental_clarity",
  ORGANIZATION: "organization",
  HEALTH_ENERGY: "health_energy",
  WORK_BUSINESS: "work_business",
  PERSONAL_PROJECTS: "personal_projects",
  RELATIONSHIPS: "relationships",
};

function AccountContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const [email, setEmail] = useState("");
  const [isResolvingAccess, setIsResolvingAccess] = useState(false);
  const [overview, setOverview] = useState<{
    planLabel: string;
    planThemeLimit: number;
    changesRemainingThisMonth: number;
    currentThemes: string[];
    progress: {
      sentCount: number;
      completedCount: number;
      skippedCount: number;
      completionRate: number;
    };
    currentSettings: {
      energyLevel: number;
      availableMinutes: number;
      locale: string;
    };
    monthlyMessage: string;
    todayObjective: Array<{
      actionText: string;
      categoryLabel: string;
      status: string;
    }>;
    latestCheckin: {
      mood: string;
      note?: string | null;
      createdAt: string;
    } | null;
    recentActions: Array<{
      sentAt: string;
      status: string;
      actionText: string;
      categoryLabel: string;
    }>;
  } | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<number>(2);
  const [availableMinutes, setAvailableMinutes] = useState<number>(10);
  const [locale, setLocale] = useState<string>("en");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [checkinMood, setCheckinMood] = useState<string>("right");
  const [checkinNote, setCheckinNote] = useState("");
  const [isSavingCheckin, setIsSavingCheckin] = useState(false);
  const [isUpgradingPlan, setIsUpgradingPlan] = useState<number | null>(null);
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

  function handleNotNow() {
    setShowThemeEditor(false);
    setError("");
    setMessage("You're all set. Your current themes stay active.");
  }

  function normalizeThemeValue(theme: string): string {
    return theme.trim().toLowerCase();
  }

  function toThemeOptionValue(theme: string): string {
    const enumKey = theme.trim().toUpperCase();
    return DB_THEME_TO_OPTION[enumKey] ?? normalizeThemeValue(theme);
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
          planThemeLimit?: number;
          changesRemainingThisMonth?: number;
          currentThemes?: string[];
          currentSettings?: {
            energyLevel: number;
            availableMinutes: number;
            locale?: string;
          };
          recentActions?: Array<{
            sentAt: string;
            status: string;
            actionText: string;
            categoryLabel: string;
          }>;
          monthlyMessage?: string;
          todayObjective?: Array<{
            actionText: string;
            categoryLabel: string;
            status: string;
          }>;
          latestCheckin?: {
            mood: string;
            note?: string | null;
            createdAt: string;
          } | null;
          progress?: {
            sentCount: number;
            completedCount: number;
            skippedCount: number;
            completionRate: number;
          };
        };

        if (
          !response.ok ||
          !data.planLabel ||
          typeof data.planThemeLimit !== "number" ||
          !data.progress ||
          !Array.isArray(data.currentThemes) ||
          !data.currentSettings ||
          typeof data.currentSettings.locale !== "string" ||
          !Array.isArray(data.recentActions) ||
          !Array.isArray(data.todayObjective) ||
          typeof data.monthlyMessage !== "string"
        ) {
          if (isMounted) {
            setError(data.error ?? "Unable to load account overview.");
          }
          return;
        }

        if (isMounted) {
          const normalizedThemes = data.currentThemes.map((theme) =>
            toThemeOptionValue(theme),
          );
          setOverview({
            planLabel: data.planLabel,
            planThemeLimit: data.planThemeLimit,
            changesRemainingThisMonth: data.changesRemainingThisMonth ?? 0,
            currentThemes: normalizedThemes,
            progress: data.progress,
            currentSettings: data.currentSettings,
            recentActions: data.recentActions,
            todayObjective: data.todayObjective,
            monthlyMessage: data.monthlyMessage,
            latestCheckin: data.latestCheckin ?? null,
          });
          setSelected(normalizedThemes);
          setEnergyLevel(data.currentSettings.energyLevel);
          setAvailableMinutes(data.currentSettings.availableMinutes);
          setLocale(data.currentSettings.locale);
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

  async function handleSaveSettings() {
    setError("");
    setMessage("");
    setIsSavingSettings(true);

    try {
      const response = await fetch("/api/account/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          energyLevel,
          availableMinutes,
          locale,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        energyLevel?: number;
        availableMinutes?: number;
        locale?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Unable to update settings.");
        return;
      }

      setOverview((prev) =>
        prev
          ? {
              ...prev,
              currentSettings: {
                energyLevel: data.energyLevel ?? energyLevel,
                availableMinutes: data.availableMinutes ?? availableMinutes,
                locale: data.locale ?? locale,
              },
            }
          : prev,
      );
      setMessage("Settings updated.");
    } catch {
      setError("Unable to update settings.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleSaveCheckin() {
    setError("");
    setMessage("");
    setIsSavingCheckin(true);

    try {
      const response = await fetch("/api/account/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          mood: checkinMood,
          note: checkinNote,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to save check-in.");
        return;
      }

      setOverview((prev) =>
        prev
          ? {
              ...prev,
              latestCheckin: {
                mood: checkinMood,
                note: checkinNote || null,
                createdAt: new Date().toISOString(),
              },
            }
          : prev,
      );
      setMessage("Check-in saved. Tomorrow's actions will adapt.");
      setCheckinNote("");
    } catch {
      setError("Unable to save check-in.");
    } finally {
      setIsSavingCheckin(false);
    }
  }

  async function handleUpgradePlan(targetThemeCount: number) {
    setError("");
    setMessage("");
    setIsUpgradingPlan(targetThemeCount);

    try {
      const response = await fetch("/api/account/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, targetThemeCount }),
      });
      const data = (await response.json()) as {
        error?: string;
        planLabel?: string;
        planThemeLimit?: number;
      };

      if (!response.ok || typeof data.planThemeLimit !== "number" || !data.planLabel) {
        setError(data.error ?? "Unable to upgrade plan.");
        return;
      }

      setOverview((prev) =>
        prev
          ? {
              ...prev,
              planLabel: data.planLabel ?? prev.planLabel,
              planThemeLimit: data.planThemeLimit ?? prev.planThemeLimit,
            }
          : prev,
      );
      setMessage(`Plan upgraded to ${data.planLabel}.`);
    } catch {
      setError("Unable to upgrade plan.");
    } finally {
      setIsUpgradingPlan(null);
    }
  }

  function formatRecentStatus(status: string): string {
    if (status === "COMPLETED") return "Completed";
    if (status === "SKIPPED") return "Skipped";
    if (status === "SENT") return "Pending";
    return status;
  }

  function formatMood(mood: string): string {
    if (mood === "too_easy") return "Too easy";
    if (mood === "too_hard") return "Too hard";
    if (mood === "right") return "Just right";
    return mood;
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
            {(overview?.planThemeLimit ?? 1) < 3 ? (
              <div className="mt-4 rounded-xl border border-[#e7e7e7] bg-white p-4">
                <p className="text-sm text-[#222]">
                  Need more themes? Upgrade your plan without re-entering your card.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(overview?.planThemeLimit ?? 1) < 2 ? (
                    <button
                      onClick={() => handleUpgradePlan(2)}
                      disabled={isUpgradingPlan !== null}
                      className="bg-[#111] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isUpgradingPlan === 2 ? "Upgrading..." : "Upgrade to 2 themes"}
                    </button>
                  ) : null}
                  {(overview?.planThemeLimit ?? 1) < 3 ? (
                    <button
                      onClick={() => handleUpgradePlan(3)}
                      disabled={isUpgradingPlan !== null}
                      className="bg-[#111] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isUpgradingPlan === 3 ? "Upgrading..." : "Upgrade to 3 themes"}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">Today's objective</p>
              <div className="mt-3 space-y-2">
                {overview?.todayObjective.length ? (
                  overview.todayObjective.map((entry, index) => (
                    <div key={`${entry.actionText}-${index}`} className="border border-[#efefef] rounded-lg px-3 py-2">
                      <p className="text-xs uppercase tracking-wide text-[#8b8b8b]">
                        {entry.categoryLabel}
                      </p>
                      <p className="text-sm text-[#111]">{entry.actionText}</p>
                      <p className="mt-1 text-xs text-[#777]">{formatRecentStatus(entry.status)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#777]">No objective sent yet today.</p>
                )}
              </div>
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">Monthly recap</p>
              <p className="mt-2 text-sm text-[#444]">{overview?.monthlyMessage ?? "Keep going."}</p>
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">Difficulty and time</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8b8b8b] mb-2">Difficulty</p>
                  <div className="flex gap-2">
                    {ENERGY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setEnergyLevel(option.value)}
                        className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                          energyLevel === option.value
                            ? "bg-[#111] text-white border-[#111]"
                            : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8b8b8b] mb-2">Time</p>
                  <div className="flex gap-2">
                    {TIME_OPTIONS.map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => setAvailableMinutes(minutes)}
                        className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                          availableMinutes === minutes
                            ? "bg-[#111] text-white border-[#111]"
                            : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                        }`}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wide text-[#8b8b8b] mb-2">Language (emails)</p>
                <div className="flex flex-wrap gap-2">
                  {LOCALE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLocale(option.value)}
                      className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                        locale === option.value
                          ? "bg-[#111] text-white border-[#111]"
                          : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#888]">
                  Daily emails use this language for buttons and footer. Site copy stays English for now.
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="mt-4 bg-[#111] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSavingSettings ? "Saving..." : "Save settings"}
              </button>
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">Coach check-in</p>
              <p className="mt-2 text-xs text-[#777]">How did today's actions feel?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { value: "too_easy", label: "Too easy" },
                  { value: "right", label: "Just right" },
                  { value: "too_hard", label: "Too hard" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCheckinMood(option.value)}
                    className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                      checkinMood === option.value
                        ? "bg-[#111] text-white border-[#111]"
                        : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <textarea
                value={checkinNote}
                onChange={(event) => setCheckinNote(event.target.value)}
                placeholder="Optional note (what to prioritize or avoid tomorrow)"
                className="mt-3 w-full border border-[#ddd] rounded-xl px-4 py-3 text-sm text-[#111] placeholder-[#aaa] outline-none focus:border-[#999] transition-colors"
                rows={3}
              />
              <button
                onClick={handleSaveCheckin}
                disabled={isSavingCheckin}
                className="mt-3 bg-[#111] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSavingCheckin ? "Saving..." : "Save check-in"}
              </button>
              {overview?.latestCheckin ? (
                <p className="mt-3 text-xs text-[#666]">
                  Last check-in: {formatMood(overview.latestCheckin.mood)}
                </p>
              ) : null}
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">Recent actions</p>
              <div className="mt-4 space-y-2">
                {overview?.recentActions.length ? (
                  overview.recentActions.map((entry, index) => (
                    <div
                      key={`${entry.sentAt}-${index}`}
                      className="border border-[#efefef] rounded-lg px-3 py-2"
                    >
                      <p className="text-xs uppercase tracking-wide text-[#8b8b8b]">
                        {entry.categoryLabel}
                      </p>
                      <p className="text-sm text-[#111]">{entry.actionText}</p>
                      <p className="mt-1 text-xs text-[#777]">
                        {new Date(entry.sentAt).toLocaleDateString()} ·{" "}
                        {formatRecentStatus(entry.status)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#777]">No recent actions yet.</p>
                )}
              </div>
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">Would you like to change your themes?</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowThemeEditor(true)}
                  className={`px-5 py-2.5 text-sm rounded-full border transition-colors ${
                    showThemeEditor
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                  }`}
                >
                  Yes, change themes
                </button>
                <button
                  onClick={handleNotNow}
                  className={`px-5 py-2.5 text-sm rounded-full border transition-colors ${
                    !showThemeEditor
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                  }`}
                >
                  Not now
                </button>
              </div>
            </div>

            {showThemeEditor ? (
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
              </>
            ) : null}

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
