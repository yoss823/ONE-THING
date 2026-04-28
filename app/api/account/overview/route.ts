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
  const [deliveryLogs, changesUsedThisMonth] = await Promise.all([
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

  return NextResponse.json({
    ok: true,
    planLabel: PLAN_LABELS[user.subscription.plan] ?? user.subscription.plan,
    subscriptionStatus: user.subscription.status,
    currentThemes: user.preference.categories,
    changesUsedThisMonth,
    changesRemainingThisMonth: Math.max(0, 3 - changesUsedThisMonth),
    progress: {
      sentCount,
      completedCount,
      skippedCount,
      completionRate,
    },
  });
}
