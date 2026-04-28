import { DailyDeliveryStatus, DailyDeliveryType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

const PLAN_LABELS: Record<string, string> = {
  tier_1: "1 theme",
  tier_2: "2 themes",
  tier_3: "3 themes",
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
        },
      },
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
          gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
          lt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)),
        },
      },
      select: {
        status: true,
        action: {
          select: {
            text: true,
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

  const monthlyMessage =
    completionRate >= 70
      ? "Great consistency this month. Keep your rhythm."
      : completionRate >= 40
        ? "You're building momentum. Small steps still count."
        : "A new month is a fresh start. Keep it simple and steady.";

  return NextResponse.json({
    ok: true,
    planLabel: PLAN_LABELS[user.subscription.plan] ?? user.subscription.plan,
    subscriptionStatus: user.subscription.status,
    currentThemes: user.preference.categories,
    currentSettings: {
      energyLevel: user.preference.energyLevel,
      availableMinutes: user.preference.availableMinutes,
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
      status: entry.status,
    })),
    recentActions: recentActions.map((entry) => ({
      sentAt: entry.sentAt.toISOString(),
      status: entry.status,
      actionText: entry.action?.text ?? "No action found",
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
