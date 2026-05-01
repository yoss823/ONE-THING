/** Validates IANA timezone names (same check as checkout). */
export function isValidIanaTimezone(raw: string): boolean {
  const tz = raw.trim();
  if (!tz) {
    return false;
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}
