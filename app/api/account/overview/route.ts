import { DailyDeliveryStatus, DailyDeliveryType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import {
  getLocalTimeSnapshot,
  resolveTimezone,
  SEND_WINDOW_MINUTES,
  TARGET_SEND_HOUR,
  TARGET_SEND_MINUTE,
} from "@/lib/daily/local-calendar";
import {
  isDailyActionEmailEnabled,
  materializeTodayDailyDelivery,
} from "@/lib/daily/materialize-today-delivery";
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

function getLocalDateValue(date: Date, timezone: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  return new Date(Date.UTC(year, month - 1, day));
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
  const timezone = user.timezone ?? "UTC";
  const localToday = getLocalDateValue(now, timezone);

  const emailsOn = isDailyActionEmailEnabled();
  const resolvedTz = resolveTimezone(timezone);
  const localSnap = getLocalTimeSnapshot(now, resolvedTz);
  const localMinutes = localSnap.hour * 60 + localSnap.minute;
  const afterMorningEmailWindow =
    localMinutes > TARGET_SEND_HOUR * 60 + TARGET_SEND_MINUTE + SEND_WINDOW_MINUTES;

  if (!emailsOn || afterMorningEmailWindow) {
    await materializeTodayDailyDelivery({
      userId,
      now,
      baseUrl: tryResolvePublicBaseUrl() ?? undefined,
      sendEmails: false,
    });
  }

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
