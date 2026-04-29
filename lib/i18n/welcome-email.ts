import type { SiteLocale } from "@/lib/i18n/locale";

export type WelcomeEmailCopy = {
  subject: string;
  textLines: string[];
  htmlThanks: string;
  htmlTomorrow: string;
  htmlOneThing: string;
  htmlSet: string;
  manageLink: string;
};

const COPY: Record<SiteLocale, WelcomeEmailCopy> = {
  en: {
    subject: "You're in.",
    textLines: [
      "Thanks for joining ONE THING.",
      "",
      "Tomorrow at 8:00 AM, you'll receive your first single action.",
      "",
      "One thing. That's all.",
      "",
      "You're set.",
    ],
    htmlThanks: "Thanks for joining ONE THING.",
    htmlTomorrow: "Tomorrow at 8:00 AM, you&#39;ll receive your first single action.",
    htmlOneThing: "One thing. That&#39;s all.",
    htmlSet: "You&#39;re set.",
    manageLink: "Manage your themes",
  },
  fr: {
    subject: "C’est parti.",
    textLines: [
      "Merci d’avoir rejoint ONE THING.",
      "",
      "Demain à 8 h, vous recevrez votre première action unique.",
      "",
      "Une seule chose. C’est tout.",
      "",
      "Tout est prêt.",
    ],
    htmlThanks: "Merci d’avoir rejoint ONE THING.",
    htmlTomorrow: "Demain à 8 h, vous recevrez votre première action unique.",
    htmlOneThing: "Une seule chose. C’est tout.",
    htmlSet: "Tout est prêt.",
    manageLink: "Gérer vos thèmes",
  },
  es: {
    subject: "Ya estás dentro.",
    textLines: [
      "Gracias por unirte a ONE THING.",
      "",
      "Mañana a las 8:00 recibirás tu primera acción única.",
      "",
      "Una cosa. Eso es todo.",
      "",
      "Listo.",
    ],
    htmlThanks: "Gracias por unirte a ONE THING.",
    htmlTomorrow: "Mañana a las 8:00 recibirás tu primera acción única.",
    htmlOneThing: "Una cosa. Eso es todo.",
    htmlSet: "Listo.",
    manageLink: "Gestionar tus temas",
  },
};

export function getWelcomeEmailCopy(locale: SiteLocale): WelcomeEmailCopy {
  return COPY[locale] ?? COPY.en;
}
