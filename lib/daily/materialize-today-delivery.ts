import { DailyDeliveryStatus, DailyDeliveryType, UserEventType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { selectDailyEmailActions } from "@/lib/email/daily-selection";
import { sendDailyActionEmail } from "@/lib/email/sendDailyAction";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

import {
  getLocalDateValueFromInstant,
  getLocalTimeSnapshot,
  resolveTimezone,
  toLocalDateValue,
} from "@/lib/daily/local-calendar";

function isPrismaUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
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

/** Exported for overview lock recovery when a prior run left a row in `delivery_window_locks` without logs. */
export async function releaseDeliveryWindowLock(params: {
  userId: string;
  type: DailyDeliveryType;
  localDate: Date;
}): Promise<void> {
  await prisma.deliveryWindowLock.deleteMany({
    where: {
      userId: params.userId,
      type: params.type,
      localDate: params.localDate,
    },
  });
}

async function persistDailyDeliveryLogs(params: {
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

function formatDailyDateLabel(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(instant);
}

export function isDailyActionEmailEnabled(): boolean {
  return process.env.DAILY_ACTION_EMAIL_ENABLED !== "false";
}

export type DailyMaterializeSkipReason =
  | "missing_preference"
  | "inactive_subscription"
  | "signup_day"
  | "monthly_already_sent_today"
  | "daily_already_sent_today"
  | "daily_lock_exists"
  | "no_actions_available";

export type MaterializeTodayDailyResult =
  | {
      ok: true;
      result: "delivered";
      actionCount: number;
      emailErrors: string[];
    }
  | {
      ok: true;
      result: "skipped";
      reason: DailyMaterializeSkipReason;
    }
  | { ok: false; userId: string; message: string };

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due"];

/**
 * Ensures today's daily delivery rows exist for the dashboard and optional email.
 * Call from GET /api/account/overview so objectives appear even when cron or Resend fails.
 * Cron should still call this inside the local morning window when emails are enabled.
 */
export async function materializeTodayDailyDelivery(params: {
  userId: string;
  now?: Date;
  baseUrl?: string | null;
  /** When omitted, uses {@link isDailyActionEmailEnabled} (env DAILY_ACTION_EMAIL_ENABLED). */
  sendEmails?: boolean;
}): Promise<MaterializeTodayDailyResult> {
  const now = params.now ?? new Date();
  const sendEmails = params.sendEmails ?? isDailyActionEmailEnabled();
  const baseUrl = params.baseUrl ?? tryResolvePublicBaseUrl() ?? "";

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
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

    if (!user) {
      return { ok: false, userId: params.userId, message: "User not found." };
    }

    if (!user.preference) {
      return { ok: true, result: "skipped", reason: "missing_preference" };
    }

    const sub = user.subscription;
    if (
      !sub ||
      !ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status.toLowerCase())
    ) {
      return { ok: true, result: "skipped", reason: "inactive_subscription" };
    }

    const timezone = resolveTimezone(user.timezone);
    const localSnapshot = getLocalTimeSnapshot(now, timezone);
    const localDate = toLocalDateValue(localSnapshot);
    const signupLocalDate = getLocalDateValueFromInstant(user.createdAt, timezone);

    if (signupLocalDate >= localDate) {
      return { ok: true, result: "skipped", reason: "signup_day" };
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
      return { ok: true, result: "skipped", reason: "monthly_already_sent_today" };
    }

    if (existingDailyLog) {
      return { ok: true, result: "skipped", reason: "daily_already_sent_today" };
    }

    const lockAcquired = await acquireDeliveryWindowLock({
      userId: user.id,
      type: DailyDeliveryType.DAILY,
      localDate,
    });

    if (!lockAcquired) {
      return { ok: true, result: "skipped", reason: "daily_lock_exists" };
    }

    const selectedActions = await selectDailyEmailActions({
      userId: user.id,
      categories: user.preference.categories,
      energyLevel: user.preference.energyLevel,
      availableMinutes: user.preference.availableMinutes,
    });

    if (selectedActions.length === 0) {
      await releaseDeliveryWindowLock({
        userId: user.id,
        type: DailyDeliveryType.DAILY,
        localDate,
      });
      return { ok: true, result: "skipped", reason: "no_actions_available" };
    }

    const sentActions: Array<{ actionId: string }> = [];
    const dateLabel = formatDailyDateLabel(now, timezone);
    const emailErrors: string[] = [];

    if (sendEmails) {
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
          emailErrors.push(
            error instanceof Error
              ? `Failed action ${selectedAction.actionId}: ${error.message}`
              : `Failed action ${selectedAction.actionId}: Unknown error.`,
          );
        }
      }
    } else {
      for (const selectedAction of selectedActions) {
        sentActions.push({ actionId: selectedAction.actionId });
      }
    }

    if (sentActions.length === 0) {
      await releaseDeliveryWindowLock({
        userId: user.id,
        type: DailyDeliveryType.DAILY,
        localDate,
      });
      return {
        ok: true,
        result: "delivered",
        actionCount: 0,
        emailErrors,
      };
    }

    const sentAt = new Date();
    await persistDailyDeliveryLogs({
      userId: user.id,
      localDate,
      actions: sentActions,
      sentAt,
    });

    return {
      ok: true,
      result: "delivered",
      actionCount: sentActions.length,
      emailErrors,
    };
  } catch (error) {
    return {
      ok: false,
      userId: params.userId,
      message: error instanceof Error ? error.message : "Unknown error.",
    };
  }
}
