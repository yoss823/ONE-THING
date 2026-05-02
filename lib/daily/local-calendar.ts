export const TARGET_SEND_HOUR = 8;
export const TARGET_SEND_MINUTE = 0;
export const SEND_WINDOW_MINUTES = 20;

export type LocalTimeSnapshot = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function resolveTimezone(timezone: string | null | undefined): string {
  const candidate = timezone?.trim() || "UTC";

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate }).format(new Date());
    return candidate;
  } catch {
    return "UTC";
  }
}

export function getLocalTimeSnapshot(
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

export function toLocalDateValue(snapshot: LocalTimeSnapshot): Date {
  return new Date(Date.UTC(snapshot.year, snapshot.month - 1, snapshot.day));
}

export function getLocalDateValueFromInstant(instant: Date, timeZone: string): Date {
  return toLocalDateValue(getLocalTimeSnapshot(instant, timeZone));
}

export function subtractLocalDays(dateValue: Date, days: number): Date {
  const result = new Date(dateValue);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

export function isDueAtEightAm(snapshot: LocalTimeSnapshot): boolean {
  const currentMinutes = snapshot.hour * 60 + snapshot.minute;
  const targetMinutes = TARGET_SEND_HOUR * 60 + TARGET_SEND_MINUTE;

  return (
    currentMinutes >= targetMinutes &&
    currentMinutes <= targetMinutes + SEND_WINDOW_MINUTES
  );
}
