import type { SiteLocale } from "@/lib/i18n/locale";

export type WelcomeScreenCopy = {
  title: string;
  lead1: string;
  lead2: string;
  recapTitle: string;
  categoriesPrefix: string;
  energyPrefix: string;
  timePrefix: string;
  manageLine: string;
  manageLink: string;
  loading: string;
  energyLabels: Record<string, string>;
};

const COPY: Record<SiteLocale, WelcomeScreenCopy> = {
  en: {
    title: "You're in.",
    lead1: "Your first email arrives tomorrow at 8:00 AM. One thing. That's it.",
    lead2: "We'll track what you complete and quietly adjust over time. No login needed. Just open the email.",
    recapTitle: "Your choices",
    categoriesPrefix: "Categories:",
    energyPrefix: "Energy:",
    timePrefix: "Time:",
    manageLine: "Manage your themes anytime at",
    manageLink: "Subscriber account",
    loading: "Loading…",
    energyLabels: { low: "Low", medium: "Medium", high: "High" },
  },
  fr: {
    title: "C’est parti.",
    lead1: "Votre premier e-mail arrive demain à 8 h. Une seule chose. C’est tout.",
    lead2:
      "Nous suivrons ce que vous faites et ajusterons discrètement dans le temps. Pas de connexion : ouvrez simplement l’e-mail.",
    recapTitle: "Vos choix",
    categoriesPrefix: "Catégories :",
    energyPrefix: "Énergie :",
    timePrefix: "Temps :",
    manageLine: "Gérez vos thèmes quand vous voulez sur",
    manageLink: "Espace abonné",
    loading: "Chargement…",
    energyLabels: { low: "Faible", medium: "Moyen", high: "Élevé" },
  },
  es: {
    title: "Ya estás dentro.",
    lead1: "Tu primer correo llega mañana a las 8:00. Una sola cosa. Eso es todo.",
    lead2:
      "Iremos viendo lo que completas y ajustando con calma. Sin iniciar sesión: solo abre el correo.",
    recapTitle: "Tus elecciones",
    categoriesPrefix: "Categorías:",
    energyPrefix: "Energía:",
    timePrefix: "Tiempo:",
    manageLine: "Gestiona tus temas cuando quieras en",
    manageLink: "Cuenta de suscriptor",
    loading: "Cargando…",
    energyLabels: { low: "Baja", medium: "Media", high: "Alta" },
  },
};

export function getWelcomeScreenCopy(locale: SiteLocale): WelcomeScreenCopy {
  return COPY[locale] ?? COPY.en;
}
