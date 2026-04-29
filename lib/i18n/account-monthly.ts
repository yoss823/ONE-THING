import type { SiteLocale } from "@/lib/i18n/locale";

/** Short recap line on the account dashboard from this month’s completion rate. */
export function getMonthlyProgressMessage(locale: SiteLocale, completionRate: number): string {
  const high = completionRate >= 70;
  const mid = completionRate >= 40;

  if (locale === "fr") {
    if (high) return "Belle régularité ce mois-ci. Gardez votre rythme.";
    if (mid) return "Vous prenez de l’élan. Les petits pas comptent.";
    return "Un nouveau mois, un nouveau départ. Restez simple et régulier.";
  }

  if (locale === "es") {
    if (high) return "Muy buena constancia este mes. Sigue con ese ritmo.";
    if (mid) return "Estás ganando impulso. Los pasos pequeños cuentan.";
    return "Un mes nuevo es un buen reinicio. Simple y constante.";
  }

  if (high) return "Great consistency this month. Keep your rhythm.";
  if (mid) return "You're building momentum. Small steps still count.";
  return "A new month is a fresh start. Keep it simple and steady.";
}
