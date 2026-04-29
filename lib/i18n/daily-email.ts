import type { SiteLocale } from "@/lib/i18n/locale";

export type DailyEmailLocale = SiteLocale;

type DailyEmailStrings = {
  subjectPrefix: string;
  done: string;
  skip: string;
  closingLine: string;
  brand: string;
  reminderLine: string;
  manageDashboard: string;
  unsubscribe: string;
};

const COPY: Record<DailyEmailLocale, DailyEmailStrings> = {
  en: {
    subjectPrefix: "Your one thing for",
    done: "Done",
    skip: "Skip for today",
    closingLine: "That's it. See you tomorrow.",
    brand: "ONE THING",
    reminderLine:
      "If you did it, tap Done. If not today, tap Skip — we adjust quietly.",
    manageDashboard: "Manage your dashboard",
    unsubscribe: "Unsubscribe",
  },
  fr: {
    subjectPrefix: "Votre unique action pour",
    done: "Fait",
    skip: "Pas aujourd\u2019hui",
    closingLine: "C'est tout. À demain.",
    brand: "ONE THING",
    reminderLine:
      "Si c'est fait, cliquez sur Fait. Sinon, cliquez sur Pas aujourd'hui — on s'adapte discrètement.",
    manageDashboard: "Gérer mon tableau de bord",
    unsubscribe: "Se désabonner",
  },
  es: {
    subjectPrefix: "Tu única acción para",
    done: "Hecho",
    skip: "Hoy no",
    closingLine: "Eso es todo. Hasta mañana.",
    brand: "ONE THING",
    reminderLine:
      "Si lo hiciste, pulsa Hecho. Si no aplica hoy, pulsa Hoy no — ajustamos con calma.",
    manageDashboard: "Gestionar mi panel",
    unsubscribe: "Darse de baja",
  },
};

export function getDailyEmailStrings(locale: DailyEmailLocale): DailyEmailStrings {
  return COPY[locale] ?? COPY.en;
}
