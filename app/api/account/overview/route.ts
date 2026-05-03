import { DailyDeliveryStatus, DailyDeliveryType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import {
  getLocalTimeSnapshot,
  resolveTimezone,
  toLocalDateValue,
} from "@/lib/daily/local-calendar";
import { materializeTodayDailyDelivery } from "@/lib/daily/materialize-today-delivery";
import { prisma } from "@/lib/db";
import { getMonthlyProgressMessage } from "@/lib/i18n/account-monthly";
import { normalizeSiteLocale } from "@/lib/i18n/locale";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

const PLAN_LABELS: Record<string, string> = {
  tier_1: "1 theme",
  tier_2: "2 themes",
  tier_3: "3 themes",
};
const PLAN_THEME_LIMITS: Record<string, number> = {
  tier_1: 1,
  tier_2: 2,
  tier_3: 3,
};

const CATEGORY_LABELS: Record<string, string> = {
  MENTAL_CLARITY: "Mental clarity",
  ORGANIZATION: "Organization",
  HEALTH_ENERGY: "Health / Energy",
  WORK_BUSINESS: "Work / Business",
  PERSONAL_PROJECTS: "Personal projects",
  RELATIONSHIPS: "Relationships",
};

function getMonthWindow(now: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      preference: {
        select: {
          categories: true,
          energyLevel: true,
          availableMinutes: true,
          locale: true,
        },
      },
      timezone: true,
      subscription: {
        select: {
          status: true,
          plan: true,
        },
      },
    },
  });

  if (!user || !user.preference || !user.subscription) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const now = new Date();
  const { start, end } = getMonthWindow(now);
  const resolvedTz = resolveTimezone(user.timezone ?? "UTC");
  const localToday = toLocalDateValue(getLocalTimeSnapshot(now, resolvedTz));

  const mat = await materializeTodayDailyDelivery({
    userId,
    now,
    baseUrl: tryResolvePublicBaseUrl() ?? undefined,
    sendEmails: false,
  });

  // #region agent log
  fetch("http://127.0.0.1:7337/ingest/abbedae1-06a0-4f0b-94e1-d1a37731f5f9", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8064b8",
    },
    body: JSON.stringify({
      sessionId: "8064b8",
      hypothesisId: "H-overview",
      location: "app/api/account/overview/route.ts:GET",
      message: "overview_materialize",
      data: {
        resolvedTz,
        localTodayUtcMs: localToday.getTime(),
        matOk: mat.ok,
        matResult: mat.ok ? mat.result : "error",
        matReason: mat.ok && mat.result === "skipped" ? mat.reason : undefined,
        matActionCount: mat.ok && mat.result === "delivered" ? mat.actionCount : undefined,
        matErr: !mat.ok ? mat.message : undefined,
        subscriptionStatus: user.subscription.status,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  console.info(
    JSON.stringify({
      event: "agent_overview_debug",
      hypothesisId: "H-overview",
      resolvedTz,
      localTodayUtcMs: localToday.getTime(),
      matOk: mat.ok,
      matResult: mat.ok ? mat.result : "error",
      matReason: mat.ok && mat.result === "skipped" ? mat.reason : undefined,
      matActionCount: mat.ok && mat.result === "delivered" ? mat.actionCount : undefined,
      matErr: !mat.ok ? mat.message : undefined,
      subscriptionStatus: user.subscription.status,
    }),
  );
  // #endregion

  const [deliveryLogs, changesUsedThisMonth, recentActions, todayActions, recentCheckin] = await Promise.all([
    prisma.dailyDeliveryLog.findMany({
      where: {
        userId,
        type: DailyDeliveryType.DAILY,
        sentAt: {
          gte: start,
          lt: end,
        },
      },
      select: {
        status: true,
      },
    }),
    prisma.preferenceChangeLog.count({
      where: {
        userId,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.dailyDeliveryLog.findMany({
      where: {
        userId,
        type: DailyDeliveryType.DAILY,
      },
      select: {
        sentAt: true,
        status: true,
        action: {
          select: {
            text: true,
            category: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
      take: 14,
    }),
    prisma.dailyDeliveryLog.findMany({
      where: {
        userId,
        type: DailyDeliveryType.DAILY,
        localDate: {
          gte: localToday,
          lt: new Date(localToday.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: {
        status: true,
        action: {
          select: {
            text: true,
            category: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    }),
    prisma.userCheckin.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        mood: true,
        note: true,
        createdAt: true,
      },
    }),
  ]);

  // #region agent log
  fetch("http://127.0.0.1:7337/ingest/abbedae1-06a0-4f0b-94e1-d1a37731f5f9", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8064b8",
    },
    body: JSON.stringify({
      sessionId: "8064b8",
      hypothesisId: "H-query",
      location: "app/api/account/overview/route.ts:afterQuery",
      message: "overview_today_actions_count",
      data: { todayActionsCount: todayActions.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  console.info(
    JSON.stringify({
      event: "agent_overview_debug",
      hypothesisId: "H-query",
      todayActionsCount: todayActions.length,
    }),
  );
  // #endregion

  const completedCount = deliveryLogs.filter(
    (log) => log.status === DailyDeliveryStatus.COMPLETED,
  ).length;
  const skippedCount = deliveryLogs.filter(
    (log) => log.status === DailyDeliveryStatus.SKIPPED,
  ).length;
  const sentCount = deliveryLogs.length;
  const completionRate =
    sentCount > 0 ? Math.round((completedCount / sentCount) * 100) : 0;

  const preferenceLocale = normalizeSiteLocale(user.preference.locale ?? "en");
  const monthlyMessage = getMonthlyProgressMessage(preferenceLocale, completionRate);

  return NextResponse.json({
    ok: true,
    timezone: user.timezone ?? "UTC",
    planLabel: PLAN_LABELS[user.subscription.plan] ?? user.subscription.plan,
    planThemeLimit: PLAN_THEME_LIMITS[user.subscription.plan] ?? 1,
    subscriptionStatus: user.subscription.status,
    currentThemes: user.preference.categories,
    currentSettings: {
      energyLevel: user.preference.energyLevel,
      availableMinutes: user.preference.availableMinutes,
      locale: user.preference.locale ?? "en",
    },
    changesUsedThisMonth,
    changesRemainingThisMonth: Math.max(0, 3 - changesUsedThisMonth),
    progress: {
      sentCount,
      completedCount,
      skippedCount,
      completionRate,
    },
    monthlyMessage,
    todayObjective: todayActions.map((entry) => ({
      actionText: entry.action?.text ?? "No action found",
      categoryLabel: entry.action?.category
        ? CATEGORY_LABELS[String(entry.action.category)] ?? String(entry.action.category)
        : "General",
      status: entry.status,
    })),
    recentActions: recentActions.map((entry) => ({
      sentAt: entry.sentAt.toISOString(),
      status: entry.status,
      actionText: entry.action?.text ?? "No action found",
      categoryLabel: entry.action?.category
        ? CATEGORY_LABELS[String(entry.action.category)] ?? String(entry.action.category)
        : "General",
    })),
    latestCheckin: recentCheckin
      ? {
          mood: recentCheckin.mood,
          note: recentCheckin.note,
          createdAt: recentCheckin.createdAt.toISOString(),
        }
      : null,
  });
}
