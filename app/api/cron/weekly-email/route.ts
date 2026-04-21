import { UserEventType } from "@prisma/client";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import {
  generateWeeklySummaryHtml,
  generateWeeklySummaryText,
  type WeeklySummaryEmailProps,
} from "@/emails/WeeklySummaryEmail";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUMMARY_DAYS = 7;
const TARGET_MINUTES = 8 * 60;
const WINDOW_MINUTES = 10;

type ActiveUserRecord = {
  id: string;
  email: string;
  timezone: string | null;
};

type SummaryDeliveryRecord = {
  sentAt: Date;
  actionTitle: string;
  deliveryStatus: string | null;
  eventType: string | null;
};

type LocalDateDescriptor = {
  year: number;
  month: number;
  day: number;
};

type ZonedDateTimeDescriptor = LocalDateDescriptor & {
  hour: number;
  minute: number;
  weekday: string;
};

type WeeklyActionStatus = WeeklySummaryEmailProps["weekActions"][number]["status"];

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured." },
      { status: 503 },
    );
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  const resend = getResendClient();
  const timezoneColumnExists = await hasUserTimezoneColumn();
  const activeUsers = await getActiveUsers(timezoneColumnExists);
  const baseUrl = getBaseUrl(request);

  let sentCount = 0;
  let skippedCount = 0;
  const failures: Array<{ userId: string; email: string; message: string }> = [];

  for (const user of activeUsers) {
    const timeZone = normalizeTimeZone(user.timezone);
    const localNow = getZonedDateTime(now, timeZone);

    if (!shouldSendWeeklySummary(localNow)) {
      skippedCount += 1;
      continue;
    }

    const localToday: LocalDateDescriptor = {
      year: localNow.year,
      month: localNow.month,
      day: localNow.day,
    };

    const summaryStartLocalDate = addDays(localToday, -SUMMARY_DAYS);
    const summaryStartUtc = zonedTimeToUtc(summaryStartLocalDate, timeZone);
    const summaryEndUtc = zonedTimeToUtc(localToday, timeZone);
    const nextLocalDate = addDays(localToday, 1);
    const nextLocalDateUtc = zonedTimeToUtc(nextLocalDate, timeZone);

    const alreadySent = await prisma.userEvent.findFirst({
      where: {
        userId: user.id,
        actionId: null,
        eventType: UserEventType.SENT,
        createdAt: {
          gte: summaryEndUtc,
          lt: nextLocalDateUtc,
        },
      },
      select: { id: true },
    });

    if (alreadySent) {
      skippedCount += 1;
      continue;
    }

    const deliveries = await getSummaryDeliveries(
      user.id,
      summaryStartUtc,
      summaryEndUtc,
    );

    const summary = buildWeeklySummary(deliveries, summaryStartLocalDate, timeZone);
    const unsubscribeUrl = new URL("/unsubscribe", baseUrl).toString();

    try {
      const emailProps: WeeklySummaryEmailProps = {
        userName: undefined,
        unsubscribeUrl,
        ...summary,
      };
      const html = await generateWeeklySummaryHtml(emailProps);
      const text = generateWeeklySummaryText(emailProps);
      const result = await resend.emails.send({
        from: "ONE THING <hello@onething.so>",
        to: user.email,
        subject: "Your week.",
        html,
        text,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      await prisma.userEvent.create({
        data: {
          userId: user.id,
          eventType: UserEventType.SENT,
        },
      });

      sentCount += 1;
    } catch (error) {
      failures.push({
        userId: user.id,
        email: user.email,
        message: getErrorMessage(error),
      });
    }
  }

  return NextResponse.json({
    ok: failures.length === 0,
    processedCount: activeUsers.length,
    sentCount,
    skippedCount,
    failureCount: failures.length,
    timezoneSource: timezoneColumnExists ? "users.timezone" : "UTC fallback",
    failures,
  });
}

async function hasUserTimezoneColumn(): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'timezone'
    ) AS "exists"
  `;

  return Boolean(rows[0]?.exists);
}

async function getActiveUsers(
  timezoneColumnExists: boolean,
): Promise<ActiveUserRecord[]> {
  if (timezoneColumnExists) {
    return prisma.$queryRawUnsafe<ActiveUserRecord[]>(`
      SELECT
        u.id,
        u.email,
        NULLIF(u.timezone, '') AS timezone
      FROM users u
      INNER JOIN subscriptions s
        ON s.user_id = u.id
      WHERE LOWER(s.status) = 'active'
    `);
  }

  return prisma.$queryRaw<ActiveUserRecord[]>`
    SELECT
      u.id,
      u.email,
      'UTC' AS timezone
    FROM users u
    INNER JOIN subscriptions s
      ON s.user_id = u.id
    WHERE LOWER(s.status) = 'active'
  `;
}

async function getSummaryDeliveries(
  userId: string,
  summaryStartUtc: Date,
  summaryEndUtc: Date,
): Promise<SummaryDeliveryRecord[]> {
  return prisma.$queryRaw<SummaryDeliveryRecord[]>`
    SELECT
      ds.sent_at AS "sentAt",
      a.text AS "actionTitle",
      ds.status AS "deliveryStatus",
      (
        SELECT ue.event_type
        FROM user_events ue
        WHERE ue.user_id = ds.user_id
          AND ue.action_id = ds.action_id
          AND ue.created_at >= ds.sent_at
          AND ue.created_at < COALESCE(
            (
              SELECT MIN(next_ds.sent_at)
              FROM daily_sends next_ds
              WHERE next_ds.user_id = ds.user_id
                AND next_ds.action_id = ds.action_id
                AND next_ds.sent_at > ds.sent_at
            ),
            ${summaryEndUtc}
          )
        ORDER BY ue.created_at DESC
        LIMIT 1
      ) AS "eventType"
    FROM daily_sends ds
    INNER JOIN actions a
      ON a.id = ds.action_id
    WHERE ds.user_id = ${userId}
      AND ds.sent_at >= ${summaryStartUtc}
      AND ds.sent_at < ${summaryEndUtc}
    ORDER BY ds.sent_at ASC
  `;
}

function buildWeeklySummary(
  deliveries: SummaryDeliveryRecord[],
  summaryStartLocalDate: LocalDateDescriptor,
  timeZone: string,
): Omit<WeeklySummaryEmailProps, "userName" | "unsubscribeUrl"> {
  const deliveriesByDay = new Map<
    string,
    { actionTitles: string[]; status: WeeklyActionStatus }
  >();

  for (const delivery of deliveries) {
    const dayKey = toLocalDateKey(delivery.sentAt, timeZone);
    const resolvedStatus = resolveWeeklyActionStatus(
      delivery.deliveryStatus,
      delivery.eventType,
    );
    const existingEntry = deliveriesByDay.get(dayKey);

    if (!existingEntry) {
      deliveriesByDay.set(dayKey, {
        actionTitles: [delivery.actionTitle],
        status: resolvedStatus,
      });
      continue;
    }

    existingEntry.actionTitles.push(delivery.actionTitle);
    existingEntry.status = mergeStatuses(existingEntry.status, resolvedStatus);
  }

  const weekActions: WeeklySummaryEmailProps["weekActions"] = [];

  for (let index = 0; index < SUMMARY_DAYS; index += 1) {
    const localDate = addDays(summaryStartLocalDate, index);
    const dateKey = formatDateKey(localDate);
    const delivery = deliveriesByDay.get(dateKey);

    weekActions.push({
      date: formatDisplayDate(localDate),
      actionTitle: delivery
        ? collapseActionTitles(delivery.actionTitles)
        : "No action sent",
      status: delivery?.status ?? "pending",
    });
  }

  const completedCount = weekActions.filter(
    (action) => action.status === "completed",
  ).length;
  const skippedCount = weekActions.filter(
    (action) => action.status === "skipped",
  ).length;
  const currentStreak = getCurrentStreak(weekActions);

  return {
    weekActions,
    completedCount,
    skippedCount,
    currentStreak,
  };
}

function shouldSendWeeklySummary(localNow: ZonedDateTimeDescriptor): boolean {
  const minutesSinceMidnight = localNow.hour * 60 + localNow.minute;

  return (
    localNow.weekday === "Mon" &&
    Math.abs(minutesSinceMidnight - TARGET_MINUTES) <= WINDOW_MINUTES
  );
}

function getZonedDateTime(
  date: Date,
  timeZone: string,
): ZonedDateTimeDescriptor {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  return {
    year: Number(getPartValue(parts, "year")),
    month: Number(getPartValue(parts, "month")),
    day: Number(getPartValue(parts, "day")),
    hour: Number(getPartValue(parts, "hour")),
    minute: Number(getPartValue(parts, "minute")),
    weekday: getPartValue(parts, "weekday"),
  };
}

function zonedTimeToUtc(
  localDate: LocalDateDescriptor,
  timeZone: string,
  hour = 0,
  minute = 0,
): Date {
  let utcMillis = Date.UTC(
    localDate.year,
    localDate.month - 1,
    localDate.day,
    hour,
    minute,
    0,
    0,
  );

  for (let index = 0; index < 3; index += 1) {
    const zoned = getZonedDateTime(new Date(utcMillis), timeZone);
    const expectedMillis = Date.UTC(
      localDate.year,
      localDate.month - 1,
      localDate.day,
      hour,
      minute,
      0,
      0,
    );
    const actualMillis = Date.UTC(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      zoned.hour,
      zoned.minute,
      0,
      0,
    );
    const diff = expectedMillis - actualMillis;

    if (diff === 0) {
      break;
    }

    utcMillis += diff;
  }

  return new Date(utcMillis);
}

function resolveWeeklyActionStatus(
  deliveryStatus: string | null,
  eventType: string | null,
): WeeklyActionStatus {
  const normalizedStatus = deliveryStatus?.trim().toLowerCase();
  const normalizedEventType = eventType?.trim().toLowerCase();

  if (
    normalizedStatus === "completed" ||
    normalizedStatus === "complete" ||
    normalizedStatus === "done"
  ) {
    return "completed";
  }

  if (
    normalizedStatus === "skipped" ||
    normalizedStatus === "skip" ||
    normalizedStatus === "paused" ||
    normalizedStatus === "pause"
  ) {
    return "skipped";
  }

  if (
    normalizedEventType === "clicked_yes" ||
    normalizedEventType === UserEventType.CLICKED_YES.toLowerCase()
  ) {
    return "completed";
  }

  if (
    normalizedEventType === "clicked_pause" ||
    normalizedEventType === UserEventType.CLICKED_PAUSE.toLowerCase()
  ) {
    return "skipped";
  }

  return "pending";
}

function mergeStatuses(
  currentStatus: WeeklyActionStatus,
  nextStatus: WeeklyActionStatus,
): WeeklyActionStatus {
  if (currentStatus === "completed" || nextStatus === "completed") {
    return "completed";
  }

  if (currentStatus === "skipped" || nextStatus === "skipped") {
    return "skipped";
  }

  return "pending";
}

function collapseActionTitles(actionTitles: string[]): string {
  return Array.from(new Set(actionTitles)).join(" · ");
}

function getCurrentStreak(
  weekActions: WeeklySummaryEmailProps["weekActions"],
): number {
  let streak = 0;

  for (let index = weekActions.length - 1; index >= 0; index -= 1) {
    if (weekActions[index]?.status !== "completed") {
      break;
    }

    streak += 1;
  }

  return streak;
}

function addDays(
  localDate: LocalDateDescriptor,
  numberOfDays: number,
): LocalDateDescriptor {
  const nextDate = new Date(
    Date.UTC(localDate.year, localDate.month - 1, localDate.day + numberOfDays),
  );

  return {
    year: nextDate.getUTCFullYear(),
    month: nextDate.getUTCMonth() + 1,
    day: nextDate.getUTCDate(),
  };
}

function formatDisplayDate(localDate: LocalDateDescriptor): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(localDate.year, localDate.month - 1, localDate.day));
}

function formatDateKey(localDate: LocalDateDescriptor): string {
  return `${localDate.year}-${pad(localDate.month)}-${pad(localDate.day)}`;
}

function toLocalDateKey(date: Date, timeZone: string): string {
  const zonedDateTime = getZonedDateTime(date, timeZone);

  return formatDateKey(zonedDateTime);
}

function normalizeTimeZone(timeZone: string | null): string {
  if (!timeZone) {
    return "UTC";
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return timeZone;
  } catch {
    return "UTC";
  }
}

function getPartValue(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPart["type"],
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function getBaseUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? new URL(request.url).origin;
}

function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(process.env.RESEND_API_KEY);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}
