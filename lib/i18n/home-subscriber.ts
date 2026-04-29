import type { SiteLocale } from "@/lib/i18n/locale";

type SubscriberCta = {
  title: string;
  description: string;
  linkLabel: string;
};

const COPY: Record<SiteLocale, SubscriberCta> = {
  en: {
    title: "Already subscribed?",
    description: "Open your dashboard anytime with the email you used at checkout.",
    linkLabel: "Subscriber area →",
  },
  fr: {
    title: "Déjà abonné ?",
    description: "Ouvrez votre tableau de bord à tout moment avec l’e-mail utilisé au paiement.",
    linkLabel: "Espace abonné →",
  },
  es: {
    title: "¿Ya estás suscrito?",
    description: "Abre tu panel en cualquier momento con el correo que usaste al pagar.",
    linkLabel: "Área de suscriptor →",
  },
};

export function getHomeSubscriberCta(locale: SiteLocale): SubscriberCta {
  return COPY[locale] ?? COPY.en;
}
