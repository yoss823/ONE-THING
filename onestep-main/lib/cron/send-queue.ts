import {
  EMAIL_SEND_OFFSETS_MINUTES,
  getNextDailyLocalDate,
  getNextMonthlyClarityLocalDate,
  getNextWeeklyLocalDate,
  type EmailKind,
  type LocalDateDescriptor,
} from "@/lib/email/cadence";

export const DEFAULT_BATCH_SIZE = 100;
export const CLAIM_TTL_MINUTES = 15;
export const DUE_LOOKBACK_MINUTES = 10;

export type QueueStatus =
  | "queued"
  | "claimed"
  | "sending"
  | "sent"
  | "failed"
  | "skipped"
  | "canceled";

export type SendQueueRow = {
  id: string;
  userId: string;
  emailKind: EmailKind;
  localSendDate: string;
  scheduledForUtc: Date;
  attemptCount: number;
  status: QueueStatus;
};

export const CLAIM_DUE_QUEUE_SQL = `
with due as (
  select id
  from send_queue
  where status = 'queued'
    and scheduled_for_utc <= now() + interval '0 minutes'
    and scheduled_for_utc >= now() - interval '${DUE_LOOKBACK_MINUTES} minutes'
    and (
      claim_expires_at is null
      or claim_expires_at < now()
    )
  order by scheduled_for_utc asc
  limit $1
  for update skip locked
)
update send_queue as sq
set
  status = 'claimed',
  claim_token = gen_random_uuid(),
  claim_expires_at = now() + interval '${CLAIM_TTL_MINUTES} minutes',
  updated_at = now()
from due
where sq.id = due.id
returning sq.*;
`;

export function buildQueueDedupeKey(
  row: Pick<SendQueueRow, "userId" | "emailKind" | "localSendDate">,
): string {
  return `${row.userId}:${row.emailKind}:${row.localSendDate}`;
}

export function nextRetryAt(
  attemptCount: number,
  now: Date = new Date(),
): Date {
  const delayMinutes = Math.min(60, 5 * 2 ** Math.max(attemptCount, 0));

  return new Date(now.getTime() + delayMinutes * 60_000);
}

export function buildLocalSendMinuteOffset(emailKind: EmailKind): number {
  return EMAIL_SEND_OFFSETS_MINUTES[emailKind];
}

export function describeFutureQueueNeeds(localDate: LocalDateDescriptor): {
  daily: LocalDateDescriptor;
  weekly: LocalDateDescriptor;
  monthlyClarity: LocalDateDescriptor;
} {
  return {
    daily: getNextDailyLocalDate(localDate),
    weekly: getNextWeeklyLocalDate(localDate),
    monthlyClarity: getNextMonthlyClarityLocalDate(localDate),
  };
}
