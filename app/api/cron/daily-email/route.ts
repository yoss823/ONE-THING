import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  dailyEmailUserInclude,
  selectActionForUser,
  type DailyEmailUser,
  type SelectedUserAction,
} from "@/lib/actions/selectActionForUser";
import { prisma } from "@/lib/db";
import { sendDailyActionEmail } from "@/lib/email/sendDailyAction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.APP_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL or APP_URL must be configured.");
  }

  return baseUrl;
}

function isEightAM(timezone: string, now: Date): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hour = Number.parseInt(
      parts.find((p) => p.type === "hour")?.value ?? "",
      10,
    );
    const minute = Number.parseInt(
      parts.find((p) => p.type === "minute")?.value ?? "",
      10,
    );

    return hour === 8 && minute <= 10;
  } catch {
    return false;
  }
}

function getLocalDateKey(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Could not format local date for timezone ${timezone}.`);
  }

  return `${year}-${month}-${day}`;
}

function getLocalDateValue(date: Date, timezone: string): Date {
  return new Date(`${getLocalDateKey(date, timezone)}T00:00:00.000Z`);
}

function formatEmailDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function hasSentLocalToday(user: DailyEmailUser, now: Date): boolean {
  if (!user.timezone) return false;

  const localDateKey = getLocalDateKey(now, user.timezone);

  for (const send of user.dailySends) {
    if (
      send.status === "sent" &&
      getLocalDateKey(send.sentAt, user.timezone) === localDateKey
    ) {
      return true;
    }
  }

  return false;
}

async function hasMonthlyClarityLocalToday(
  userId: string,
  localDate: Date,
): Promise<boolean> {
  const monthlyLog = await prisma.dailyDeliveryLog.findFirst({
    where: {
      userId,
      type: Prisma.DailyDeliveryType.MONTHLY_CLARITY,
      localDate,
    },
    select: { id: true },
  });

  return Boolean(monthlyLog);
}

async function logDelivery(
  userId: string,
  status: "sent" | "failed",
  sentAt: Date,
  selections: SelectedUserAction[],
  localDate?: Date,
): Promise<void> {
  if (selections.length === 0) {
    await prisma.dailySend.create({
      data: {
        userId,
        actionId: null,
        status,
        sentAt,
      },
    });
    return;
  }

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.dailySend.createMany({
      data: selections.map((s) => ({
        userId,
        actionId: s.actionId,
        status,
        sentAt,
      })),
    }),
  ];

  if (status === "sent" && localDate) {
    ops.push(
      prisma.dailyDeliveryLog.createMany({
        data: selections.map((s) => ({
          userId,
          actionId: s.actionId,
          type: Prisma.DailyDeliveryType.DAILY,
          status: Prisma.DailyDeliveryStatus.SENT,
          localDate,
          sentAt,
        })),
      }),
    );

    ops.push(
      prisma.userEvent.createMany({
        data: selections.map((s) => ({
          userId,
          actionId: s.actionId,
          eventType: Prisma.UserEventType.SENT,
          createdAt: sentAt,
        })),
      }),
    );
  }

  await prisma.$transaction(ops);
}

async function handleCron(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  let baseUrl: string;

  try {
    baseUrl = getBaseUrl();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Base URL is not configured.",
      },
      { status: 503 },
    );
  }

  const users = await prisma.user.findMany({
    where: {
      timezone: { not: null },
      preference: { isNot: null },
      subscription: { is: { status: "active" } },
    },
    include: dailyEmailUserInclude,
  });

  let sent = 0;
  let skippedMonthly = 0;

  for (const user of users) {
    if (!user.timezone) continue;

    let selections: SelectedUserAction[] = [];

    try {
      if (!isEightAM(user.timezone, now) || hasSentLocalToday(user, now)) {
        continue;
      }

      const localDate = getLocalDateValue(now, user.timezone);

      if (await hasMonthlyClarityLocalToday(user.id, localDate)) {
        skippedMonthly += 1;
        continue;
      }

      selections = await selectActionForUser(user);

      await sendDailyActionEmail({
        userEmail: user.email,
        userId: user.id,
        trackingBaseUrl: baseUrl,
        date: formatEmailDate(now, user.timezone),
        categories: selections.map((s) => ({
          name: s.categoryLabel,
          action: s.actionText,
          actionId: s.actionId,
        })),
      });

      await logDelivery(user.id, "sent", new Date(), selections, localDate);
      sent += 1;
    } catch (err) {
      console.error(`Failed to send daily email for user ${user.id}`, err);

      try {
        await logDelivery(user.id, "failed", new Date(), selections);
      } catch (logErr) {
        console.error(`Failed to log failure for user ${user.id}`, logErr);
      }
    }
  }

  return NextResponse.json({ sent, skippedMonthly });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}