"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getAccountUiCopy, type AccountUiCopy } from "@/lib/i18n/account-ui";
import type { SiteLocale } from "@/lib/i18n/locale";

const THEME_OPTION_VALUES = [
  "mental_clarity",
  "organization",
  "health_energy",
  "work_business",
  "personal_projects",
  "relationships",
] as const;

const ENERGY_VALUES = [1, 2, 3] as const;

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

function toThemeOptionValue(theme: string): string {
  const enumKey = theme.trim().toUpperCase();
  return DB_THEME_TO_OPTION[enumKey] ?? theme.trim().toLowerCase();
}

function formatRecentStatus(status: string, ui: AccountUiCopy): string {
  if (status === "COMPLETED") return ui.statusCompleted;
  if (status === "SKIPPED") return ui.statusSkipped;
  if (status === "SENT") return ui.statusPending;
  return status;
}

function formatMood(mood: string, ui: AccountUiCopy): string {
  if (mood === "too_easy") return ui.moodTooEasy;
  if (mood === "too_hard") return ui.moodTooHard;
  if (mood === "right") return ui.moodJustRight;
  return mood;
}

function energyLabel(value: number, ui: AccountUiCopy): string {
  if (value === 1) return ui.energyLow;
  if (value === 2) return ui.energyMedium;
  return ui.energyHigh;
}

export function AccountClient({ siteLocale }: { siteLocale: SiteLocale }) {
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
  const [isOpeningBillingPortal, setIsOpeningBillingPortal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const ui = useMemo(() => getAccountUiCopy(siteLocale), [siteLocale]);

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
    setMessage(ui.allSetThemes);
  }

  useEffect(() => {
    let isMounted = true;
    const overviewUi = getAccountUiCopy(siteLocale);

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
            setError(data.error ?? overviewUi.errLoadOverview);
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
            currentSettings: data.currentSettings as {
              energyLevel: number;
              availableMinutes: number;
              locale: string;
            },
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
          setError(overviewUi.errLoadOverview);
        }
      } finally {
        if (isMounted) {
          setIsLoadingOverview(false);
        }
      }
    }

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, [userId, siteLocale]);

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
        setError(data.error ?? ui.errFindAccount);
        return;
      }

      window.location.assign(data.accountUrl);
    } catch {
      setError(ui.errFindAccount);
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
        setError(data.error ?? ui.errUpdateSettings);
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
      setMessage(ui.msgSettingsUpdated);
    } catch {
      setError(ui.errUpdateSettings);
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
        setError(data.error ?? ui.errSaveCheckin);
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
      setMessage(ui.msgCheckinSaved);
      setCheckinNote("");
    } catch {
      setError(ui.errSaveCheckin);
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
        setError(data.error ?? ui.errUpgradePlan);
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
      setMessage(ui.msgPlanUpgraded(data.planLabel));
    } catch {
      setError(ui.errUpgradePlan);
    } finally {
      setIsUpgradingPlan(null);
    }
  }

  async function handleOpenBillingPortal() {
    setError("");
    setMessage("");
    setIsOpeningBillingPortal(true);

    try {
      const response = await fetch("/api/account/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || typeof data.url !== "string" || !data.url) {
        setError(data.error ?? ui.errOpenBilling);
        return;
      }

      window.location.assign(data.url);
    } catch {
      setError(ui.errOpenBilling);
    } finally {
      setIsOpeningBillingPortal(false);
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
        setError(data.error ?? ui.errUpdateThemes);
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
      setMessage(ui.msgThemesUpdated(data.changesRemainingThisMonth ?? 0));
    } catch {
      setError(ui.errUpdateThemes);
    } finally {
      setIsSubmitting(false);
    }
  }

  const checkinMoodOptions = [
    { value: "too_easy", label: ui.moodTooEasy },
    { value: "right", label: ui.moodJustRight },
    { value: "too_hard", label: ui.moodTooHard },
  ];

  return (
    <main className="min-h-screen bg-white text-[#111] px-6 py-12">
      <div className="max-w-xl mx-auto">
        <h1
          className="text-3xl md:text-4xl leading-tight"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
        >
          {ui.manageTitle}
        </h1>
        <p className="mt-4 text-sm text-[#666]">{ui.manageIntro}</p>

        {!userId ? (
          <>
            <p className="mt-6 text-sm text-[#666]">{ui.enterEmailPrompt}</p>
            <div className="mt-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={ui.emailPlaceholder}
                className="w-full border border-[#ddd] rounded-xl px-5 py-4 text-sm text-[#111] placeholder-[#bbb] outline-none focus:border-[#999] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleAccessLookup()}
              disabled={!email || isResolvingAccess}
              className="mt-4 bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isResolvingAccess ? ui.openingAccount : ui.openAccount}
            </button>
          </>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border border-[#e7e7e7] rounded-xl p-4 bg-white">
                <p className="text-xs uppercase tracking-wide text-[#8b8b8b]">{ui.statPlan}</p>
                <p className="mt-2 text-lg text-[#121212]">
                  {isLoadingOverview ? ui.loading : overview?.planLabel ?? ui.dash}
                </p>
              </div>
              <div className="border border-[#e7e7e7] rounded-xl p-4 bg-white">
                <p className="text-xs uppercase tracking-wide text-[#8b8b8b]">{ui.statCompleted}</p>
                <p className="mt-2 text-lg text-[#121212]">
                  {isLoadingOverview ? "…" : overview?.progress.completedCount ?? 0}
                </p>
              </div>
              <div className="border border-[#e7e7e7] rounded-xl p-4 bg-white">
                <p className="text-xs uppercase tracking-wide text-[#8b8b8b]">
                  {ui.statCompletionRate}
                </p>
                <p className="mt-2 text-lg text-[#121212]">
                  {isLoadingOverview ? "…" : `${overview?.progress.completionRate ?? 0}%`}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#666]">
              {ui.changesRemaining}{" "}
              <span className="font-medium text-[#111]">
                {isLoadingOverview ? "…" : overview?.changesRemainingThisMonth ?? 0}
              </span>
            </p>
            {(overview?.planThemeLimit ?? 1) < 3 ? (
              <div className="mt-4 rounded-xl border border-[#e7e7e7] bg-white p-4">
                <p className="text-sm text-[#222]">{ui.needMoreThemes}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(overview?.planThemeLimit ?? 1) < 2 ? (
                    <button
                      type="button"
                      onClick={() => void handleUpgradePlan(2)}
                      disabled={isUpgradingPlan !== null || isOpeningBillingPortal}
                      className="bg-[#111] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isUpgradingPlan === 2 ? ui.upgrading : ui.upgradeTo2}
                    </button>
                  ) : null}
                  {(overview?.planThemeLimit ?? 1) < 3 ? (
                    <button
                      type="button"
                      onClick={() => void handleUpgradePlan(3)}
                      disabled={isUpgradingPlan !== null || isOpeningBillingPortal}
                      className="bg-[#111] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isUpgradingPlan === 3 ? ui.upgrading : ui.upgradeTo3}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">{ui.todayObjective}</p>
              <div className="mt-3 space-y-2">
                {overview?.todayObjective.length ? (
                  overview.todayObjective.map((entry, index) => (
                    <div key={`${entry.actionText}-${index}`} className="border border-[#efefef] rounded-lg px-3 py-2">
                      <p className="text-xs uppercase tracking-wide text-[#8b8b8b]">
                        {entry.categoryLabel}
                      </p>
                      <p className="text-sm text-[#111]">{entry.actionText}</p>
                      <p className="mt-1 text-xs text-[#777]">
                        {formatRecentStatus(entry.status, ui)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#777]">{ui.noObjectiveToday}</p>
                )}
              </div>
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">{ui.monthlyRecap}</p>
              <p className="mt-2 text-sm text-[#444]">{overview?.monthlyMessage ?? ui.keepGoing}</p>
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">{ui.difficultyTime}</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8b8b8b] mb-2">{ui.difficulty}</p>
                  <div className="flex gap-2">
                    {ENERGY_VALUES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setEnergyLevel(value)}
                        className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                          energyLevel === value
                            ? "bg-[#111] text-white border-[#111]"
                            : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                        }`}
                      >
                        {energyLabel(value, ui)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8b8b8b] mb-2">{ui.time}</p>
                  <div className="flex gap-2">
                    {TIME_OPTIONS.map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => setAvailableMinutes(minutes)}
                        className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                          availableMinutes === minutes
                            ? "bg-[#111] text-white border-[#111]"
                            : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                        }`}
                      >
                        {minutes} {ui.min}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wide text-[#8b8b8b] mb-2">{ui.languageEmails}</p>
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
                <p className="mt-2 text-xs text-[#888]">{ui.languageHint}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleSaveSettings()}
                disabled={isSavingSettings}
                className="mt-4 bg-[#111] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSavingSettings ? ui.saving : ui.saveSettings}
              </button>
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">{ui.coachCheckin}</p>
              <p className="mt-2 text-xs text-[#777]">{ui.howFeelToday}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {checkinMoodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
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
                placeholder={ui.checkinPlaceholder}
                className="mt-3 w-full border border-[#ddd] rounded-xl px-4 py-3 text-sm text-[#111] placeholder-[#aaa] outline-none focus:border-[#999] transition-colors"
                rows={3}
              />
              <button
                type="button"
                onClick={() => void handleSaveCheckin()}
                disabled={isSavingCheckin}
                className="mt-3 bg-[#111] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSavingCheckin ? ui.saving : ui.saveCheckin}
              </button>
              {overview?.latestCheckin ? (
                <p className="mt-3 text-xs text-[#666]">
                  {ui.lastCheckin} {formatMood(overview.latestCheckin.mood, ui)}
                </p>
              ) : null}
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">{ui.recentActions}</p>
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
                        {formatRecentStatus(entry.status, ui)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#777]">{ui.noRecentActions}</p>
                )}
              </div>
            </div>

            <div className="mt-8 border border-[#e7e7e7] rounded-xl p-4 bg-white">
              <p className="text-sm text-[#222]">{ui.changeThemesQuestion}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowThemeEditor(true)}
                  className={`px-5 py-2.5 text-sm rounded-full border transition-colors ${
                    showThemeEditor
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                  }`}
                >
                  {ui.yesChangeThemes}
                </button>
                <button
                  type="button"
                  onClick={handleNotNow}
                  className={`px-5 py-2.5 text-sm rounded-full border transition-colors ${
                    !showThemeEditor
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                  }`}
                >
                  {ui.notNow}
                </button>
              </div>
            </div>

            {showThemeEditor ? (
              <>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEME_OPTION_VALUES.map((value) => {
                    const isSelected = selected.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleTheme(value)}
                        className={`text-left px-5 py-4 border rounded-xl text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-[#111] text-white border-[#111]"
                            : "bg-white text-[#111] border-[#ddd] hover:border-[#999]"
                        }`}
                      >
                        {ui.themeLabels[value] ?? value}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={!canSubmit}
                  className="mt-8 bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? ui.saving : ui.saveThemes}
                </button>
              </>
            ) : null}

            {message ? <p className="mt-4 text-sm text-[#166534]">{message}</p> : null}
            {error ? <p className="mt-4 text-sm text-[#b42318]">{error}</p> : null}

            <div className="mt-10 pt-6 border-t border-[#eee]">
              <button
                type="button"
                onClick={() => void handleOpenBillingPortal()}
                disabled={isOpeningBillingPortal || isUpgradingPlan !== null}
                className="text-left text-xs text-[#888] underline underline-offset-2 hover:text-[#555] disabled:opacity-40 bg-transparent border-0 p-0 cursor-pointer"
              >
                {isOpeningBillingPortal ? ui.billingOpening : ui.billingLink}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
