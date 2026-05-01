import {
  ActionCategory,
  DailyDeliveryStatus,
  DailyDeliveryType,
  UserEventType,
} from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { selectDailyEmailActions } from "@/lib/email/daily-selection";
import { formatCategoryLabel } from "@/lib/email/category-labels";
import { sendDailyActionEmail } from "@/lib/email/sendDailyAction";
import { sendMonthlyClarityEmail } from "@/lib/email/sendMonthlyClarity";
import { normalizeSiteLocale, type SiteLocale } from "@/lib/i18n/locale";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

function isPrismaUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

const TARGET_SEND_HOUR = 8;
const TARGET_SEND_MINUTE = 0;
const SEND_WINDOW_MINUTES = 20;

type LocalTimeSnapshot = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

type ActiveUser = {
  id: string;
  email: string;
  createdAt: Date;
  timezone: string | null;
  preference: {
    categories: ActionCategory[];
    energyLevel: number;
    availableMinutes: number;
    locale: string;
  } | null;
  subscription: {
    plan: string;
    status: string;
  } | null;
};

type CronSummary = {
  evaluatedUsers: number;
  dueUsers: number;
  sent: number;
  skippedExisting: number;
  skippedLocked: number;
  skippedMonthly: number;
  skippedNoActions: number;
  errors: Array<{ userId: string; message: string }>;
};

type DailySkipReason =
  | "missing_preference"
  | "outside_send_window"
  | "signup_day"
  | "monthly_already_sent_today"
  | "daily_already_sent_today"
  | "daily_lock_exists"
  | "no_actions_available";

type MonthlySkipReason =
  | "missing_preference"
  | "outside_monthly_window"
  | "monthly_already_sent_today"
  | "monthly_lock_exists";

function authorizeCron(request: Request): NextResponse | null {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}

function resolveBaseUrl(request: Request): string {
  return tryResolvePublicBaseUrl() ?? new URL(request.url).origin;
}

function resolveTimezone(timezone: string | null | undefined): string {
  const candidate = timezone?.trim() || "UTC";

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate }).format(new Date());
    return candidate;
  } catch {
    return "UTC";
  }
}

function getLocalTimeSnapshot(
  instant: Date,
  timeZone: string,
): LocalTimeSnapshot {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(instant);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number.parseInt(part.value, 10)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  };
}

function toLocalDateValue(snapshot: LocalTimeSnapshot): Date {
  return new Date(Date.UTC(snapshot.year, snapshot.month - 1, snapshot.day));
}

function getLocalDateValueFromInstant(instant: Date, timeZone: string): Date {
  return toLocalDateValue(getLocalTimeSnapshot(instant, timeZone));
}

function subtractLocalDays(dateValue: Date, days: number): Date {
  const result = new Date(dateValue);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

function isDueAtEightAm(snapshot: LocalTimeSnapshot): boolean {
  const currentMinutes = snapshot.hour * 60 + snapshot.minute;
  const targetMinutes = TARGET_SEND_HOUR * 60 + TARGET_SEND_MINUTE;

  return (
    currentMinutes >= targetMinutes &&
    currentMinutes <= targetMinutes + SEND_WINDOW_MINUTES
  );
}

function formatDailyDateLabel(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(instant);
}

function getPreviousMonthDisplay(snapshot: LocalTimeSnapshot, locale: SiteLocale): string {
  const year = snapshot.month === 1 ? snapshot.year - 1 : snapshot.year;
  const monthIndex = snapshot.month === 1 ? 11 : snapshot.month - 2;
  const intlLocale = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";

  return new Intl.DateTimeFormat(intlLocale, {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

function buildDailySummary(): CronSummary {
  return {
    evaluatedUsers: 0,
    dueUsers: 0,
    sent: 0,
    skippedExisting: 0,
    skippedLocked: 0,
    skippedMonthly: 0,
    skippedNoActions: 0,
    errors: [],
  };
}

function logSkip(
  kind: "daily" | "monthly_clarity",
  userId: string,
  reason: DailySkipReason | MonthlySkipReason,
): void {
  console.info(
    JSON.stringify({
      event: "cron_skip",
      kind,
      userId,
      skipReason: reason,
    }),
  );
}

async function acquireDeliveryWindowLock(params: {
  userId: string;
  type: DailyDeliveryType;
  localDate: Date;
}): Promise<boolean> {
  try {
    await prisma.deliveryWindowLock.create({
      data: {
        userId: params.userId,
        type: params.type,
        localDate: params.localDate,
      },
    });
    return true;
  } catch (error) {
    if (isPrismaUniqueConstraintViolation(error)) {
      return false;
    }
    throw error;
  }
}

async function loadActiveUsers(): Promise<ActiveUser[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
      timezone: true,
      preference: {
        select: {
          categories: true,
          energyLevel: true,
          availableMinutes: true,
          locale: true,
        },
      },
      subscription: {
        select: {
          plan: true,
          status: true,
        },
      },
    },
  });

  return users.filter((user): user is ActiveUser => {
    const sub = user.subscription;
    return (
      user.preference !== null &&
      sub !== null &&
      ["active", "trialing", "past_due"].includes(sub.status.toLowerCase())
    );
  });
}

async function logDailySend(params: {
  userId: string;
  localDate: Date;
  actions: Array<{ actionId: string }>;
  sentAt: Date;
}) {
  await prisma.$transaction([
    prisma.dailyDeliveryLog.createMany({
      data: params.actions.map((action) => ({
        userId: params.userId,
        actionId: action.actionId,
        type: DailyDeliveryType.DAILY,
        status: DailyDeliveryStatus.SENT,
        localDate: params.localDate,
        sentAt: params.sentAt,
      })),
    }),
    prisma.userEvent.createMany({
      data: params.actions.map((action) => ({
        userId: params.userId,
        actionId: action.actionId,
        eventType: UserEventType.SENT,
        createdAt: params.sentAt,
      })),
    }),
  ]);
}

function chooseTopCategory(
  categories: ActionCategory[],
  completedLogs: Array<{
    action: {
      category: ActionCategory;
    } | null;
  }>,
): ActionCategory {
  const counts = new Map<ActionCategory, number>();

  for (const log of completedLogs) {
    const category = log.action?.category;

    if (!category) {
      continue;
    }

    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  let topCategory = categories[0] ?? ActionCategory.MENTAL_CLARITY;
  let topCount = -1;

  for (const category of categories) {
    const count = counts.get(category) ?? 0;

    if (count > topCount) {
      topCategory = category;
      topCount = count;
    }
  }

  return topCategory;
}

export async function handleDailyEmailCron(
  request: Request,
): Promise<NextResponse> {
  const unauthorized = authorizeCron(request);

  if (unauthorized) {
    return unauthorized;
  }

  const now = new Date();
  const baseUrl = resolveBaseUrl(request);
  const users = await loadActiveUsers();
  const summary = buildDailySummary();

  for (const user of users) {
    summary.evaluatedUsers += 1;

    if (!user.preference) {
      logSkip("daily", user.id, "missing_preference");
      continue;
    }

    const timezone = resolveTimezone(user.timezone);
    const localSnapshot = getLocalTimeSnapshot(now, timezone);

    if (!isDueAtEightAm(localSnapshot)) {
      logSkip("daily", user.id, "outside_send_window");
      continue;
    }

    summary.dueUsers += 1;

    const localDate = toLocalDateValue(localSnapshot);
    const signupLocalDate = getLocalDateValueFromInstant(user.createdAt, timezone);

    if (signupLocalDate >= localDate) {
      logSkip("daily", user.id, "signup_day");
      continue;
    }

    const [monthlyLog, existingDailyLog] = await Promise.all([
      prisma.dailyDeliveryLog.findFirst({
        where: {
          userId: user.id,
          type: DailyDeliveryType.MONTHLY_CLARITY,
          localDate,
        },
        select: { id: true },
      }),
      prisma.dailyDeliveryLog.findFirst({
        where: {
          userId: user.id,
          type: DailyDeliveryType.DAILY,
          localDate,
        },
        select: { id: true },
      }),
    ]);

    if (monthlyLog) {
      summary.skippedMonthly += 1;
      logSkip("daily", user.id, "monthly_already_sent_today");
      continue;
    }

    if (existingDailyLog) {
      summary.skippedExisting += 1;
      logSkip("daily", user.id, "daily_already_sent_today");
      continue;
    }

    const lockAcquired = await acquireDeliveryWindowLock({
      userId: user.id,
      type: DailyDeliveryType.DAILY,
      localDate,
    });

    if (!lockAcquired) {
      summary.skippedLocked += 1;
      logSkip("daily", user.id, "daily_lock_exists");
      continue;
    }

    try {
      const selectedActions = await selectDailyEmailActions({
        userId: user.id,
        categories: user.preference.categories,
        energyLevel: user.preference.energyLevel,
        availableMinutes: user.preference.availableMinutes,
      });

      if (selectedActions.length === 0) {
        summary.skippedNoActions += 1;
        logSkip("daily", user.id, "no_actions_available");
        continue;
      }

      const sentActions: Array<{ actionId: string }> = [];
      const dateLabel = formatDailyDateLabel(now, timezone);

      for (const selectedAction of selectedActions) {
        try {
          await sendDailyActionEmail({
            userEmail: user.email,
            categories: [selectedAction],
            date: dateLabel,
            trackingBaseUrl: baseUrl,
            userId: user.id,
            locale: user.preference.locale,
          });
          sentActions.push({ actionId: selectedAction.actionId });
        } catch (error) {
          summary.errors.push({
            userId: user.id,
            message:
              error instanceof Error
                ? `Failed action ${selectedAction.actionId}: ${error.message}`
                : `Failed action ${selectedAction.actionId}: Unknown error.`,
          });
        }
      }

      if (sentActions.length === 0) {
        continue;
      }

      await logDailySend({
        userId: user.id,
        localDate,
        actions: sentActions,
        sentAt: new Date(),
      });

      summary.sent += sentActions.length;
    } catch (error) {
      summary.errors.push({
        userId: user.id,
        message: error instanceof Error ? error.message : "Unknown error.",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    kind: "daily",
    ...summary,
  });
}

export async function handleMonthlyClarityEmailCron(
  request: Request,
): Promise<NextResponse> {
  const unauthorized = authorizeCron(request);

  if (unauthorized) {
    return unauthorized;
  }

  const now = new Date();
  const baseUrl = resolveBaseUrl(request);
  const users = await loadActiveUsers();
  const summary = buildDailySummary();

  for (const user of users) {
    summary.evaluatedUsers += 1;

    if (!user.preference) {
      logSkip("monthly_clarity", user.id, "missing_preference");
      continue;
    }

    const timezone = resolveTimezone(user.timezone);
    const localSnapshot = getLocalTimeSnapshot(now, timezone);

    if (localSnapshot.day !== 1 || !isDueAtEightAm(localSnapshot)) {
      logSkip("monthly_clarity", user.id, "outside_monthly_window");
      continue;
    }

    summary.dueUsers += 1;

    const localDate = toLocalDateValue(localSnapshot);
    const existingMonthlyLog = await prisma.dailyDeliveryLog.findFirst({
      where: {
        userId: user.id,
        type: DailyDeliveryType.MONTHLY_CLARITY,
        localDate,
      },
      select: {
        id: true,
      },
    });

    if (existingMonthlyLog) {
      summary.skippedExisting += 1;
      logSkip("monthly_clarity", user.id, "monthly_already_sent_today");
      continue;
    }

    const lockAcquired = await acquireDeliveryWindowLock({
      userId: user.id,
      type: DailyDeliveryType.MONTHLY_CLARITY,
      localDate,
    });

    if (!lockAcquired) {
      summary.skippedLocked += 1;
      logSkip("monthly_clarity", user.id, "monthly_lock_exists");
      continue;
    }

    try {
      const lookbackStart = subtractLocalDays(localDate, 30);
      const [recentDailyLogs, priorMonthlyCount] = await Promise.all([
        prisma.dailyDeliveryLog.findMany({
          where: {
            userId: user.id,
            type: DailyDeliveryType.DAILY,
            localDate: {
              gte: lookbackStart,
              lt: localDate,
            },
          },
          include: {
            action: {
              select: {
                category: true,
              },
            },
          },
          orderBy: {
            sentAt: "desc",
          },
        }),
        prisma.dailyDeliveryLog.count({
          where: {
            userId: user.id,
            type: DailyDeliveryType.MONTHLY_CLARITY,
            localDate: {
              lt: localDate,
            },
          },
        }),
      ]);
      const completedLogs = recentDailyLogs.filter(
        (log) => log.status === DailyDeliveryStatus.COMPLETED,
      );
      const skippedLogs = recentDailyLogs.filter(
        (log) => log.status === DailyDeliveryStatus.SKIPPED,
      );
      const mailLocale = normalizeSiteLocale(user.preference.locale ?? "en");
      const currentCategories = user.preference.categories.map((cat) =>
        formatCategoryLabel(cat, mailLocale),
      );
      const topCategory = chooseTopCategory(
        user.preference.categories,
        completedLogs,
      );

      await sendMonthlyClarityEmail({
        userEmail: user.email,
        monthName: getPreviousMonthDisplay(localSnapshot, mailLocale),
        completedCount: completedLogs.length,
        skippedCount: skippedLogs.length,
        topCategory: formatCategoryLabel(topCategory, mailLocale),
        currentCategories,
        upgradeUrl:
          user.preference.categories.length === 1
            ? new URL("/onboarding", baseUrl).toString()
            : undefined,
        unsubscribeUrl: new URL("/unsubscribe", baseUrl).toString(),
        isFirstMonth: priorMonthlyCount === 0,
        locale: mailLocale,
      });

      await prisma.dailyDeliveryLog.create({
        data: {
          userId: user.id,
          type: DailyDeliveryType.MONTHLY_CLARITY,
          status: DailyDeliveryStatus.SENT,
          localDate,
          sentAt: new Date(),
        },
      });

      summary.sent += 1;
    } catch (error) {
      summary.errors.push({
        userId: user.id,
        message: error instanceof Error ? error.message : "Unknown error.",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    kind: "monthly_clarity",
    ...summary,
  });
}
