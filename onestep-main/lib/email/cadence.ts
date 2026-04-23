export const EMAIL_KINDS = ["daily", "weekly", "monthly_clarity"] as const;

export type EmailKind = (typeof EMAIL_KINDS)[number];

export type LocalDateDescriptor = {
  year: number;
  month: number;
  day: number;
};

export const EMAIL_SEND_OFFSETS_MINUTES: Record<EmailKind, number> = {
  daily: 0,
  monthly_clarity: 0,
  weekly: 10,
};

export function isMonthlyClarityDate(localDate: LocalDateDescriptor): boolean {
  return localDate.day === 1;
}

export function isMonday(localDate: LocalDateDescriptor): boolean {
  return getWeekday(localDate) === 1;
}

export function resolveEmailKindsForLocalDate(
  localDate: LocalDateDescriptor,
): EmailKind[] {
  const kinds: EmailKind[] = [];

  if (isMonthlyClarityDate(localDate)) {
    kinds.push("monthly_clarity");
  } else {
    kinds.push("daily");
  }

  if (isMonday(localDate)) {
    kinds.push("weekly");
  }

  return kinds;
}

export function getNextDailyLocalDate(
  localDate: LocalDateDescriptor,
): LocalDateDescriptor {
  let candidate = addDays(localDate, 1);

  if (isMonthlyClarityDate(candidate)) {
    candidate = addDays(candidate, 1);
  }

  return candidate;
}

export function getNextWeeklyLocalDate(
  localDate: LocalDateDescriptor,
): LocalDateDescriptor {
  let candidate = addDays(localDate, 1);

  while (!isMonday(candidate)) {
    candidate = addDays(candidate, 1);
  }

  return candidate;
}

export function getNextMonthlyClarityLocalDate(
  localDate: LocalDateDescriptor,
): LocalDateDescriptor {
  if (localDate.month === 12) {
    return { year: localDate.year + 1, month: 1, day: 1 };
  }

  return { year: localDate.year, month: localDate.month + 1, day: 1 };
}

function addDays(
  localDate: LocalDateDescriptor,
  numberOfDays: number,
): LocalDateDescriptor {
  const utcDate = new Date(
    Date.UTC(localDate.year, localDate.month - 1, localDate.day + numberOfDays),
  );

  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  };
}

function getWeekday(localDate: LocalDateDescriptor): number {
  const utcDate = new Date(
    Date.UTC(localDate.year, localDate.month - 1, localDate.day),
  );

  return utcDate.getUTCDay();
}
