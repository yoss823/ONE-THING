import { getAccountUiCopy } from "@/lib/i18n/account-ui";
import type { SiteLocale } from "@/lib/i18n/locale";

/** Same order as checkout / Stripe webhook `CATEGORY_MAP`. */
export const ONBOARDING_CATEGORY_SLUGS = [
  "mental_clarity",
  "organization",
  "health_energy",
  "work_business",
  "personal_projects",
  "relationships",
] as const;

export type OnboardingCopy = {
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  continue: string;
  continueToPayment: string;
  startingCheckout: string;
  emailPlaceholder: string;
  selectionSummary1: string;
  selectionSummary2: string;
  selectionSummary3: string;
  errChooseCategories: string;
  errCheckout: string;
  energyOptions: Array<{ value: "low" | "medium" | "high"; label: string; description: string }>;
  timeOptions: Array<{ value: string; label: string }>;
};

const COPY: Record<SiteLocale, OnboardingCopy> = {
  en: {
    step1Title: "What do you want ONE THING to help with?",
    step2Title: "How do you usually feel in the morning?",
    step3Title: "How much time do you have each morning?",
    step4Title: "Where should we send your daily action?",
    continue: "Continue",
    continueToPayment: "Continue to payment",
    startingCheckout: "Starting checkout...",
    emailPlaceholder: "you@example.com",
    selectionSummary1: "1 selected → $4.99/month",
    selectionSummary2: "2 selected → $7.99/month",
    selectionSummary3: "3 selected → $9.99/month",
    errChooseCategories: "Choose 1 to 3 categories before continuing.",
    errCheckout: "Unable to start Stripe checkout.",
    energyOptions: [
      { value: "low", label: "🔋 Low", description: "I need gentle, easy actions" },
      { value: "medium", label: "⚡ Medium", description: "I can do most things" },
      { value: "high", label: "🚀 High", description: "Give me something real" },
    ],
    timeOptions: [
      { value: "5", label: "5 minutes" },
      { value: "10", label: "10 minutes" },
      { value: "15", label: "15 minutes" },
    ],
  },
  fr: {
    step1Title: "Sur quoi voulez-vous que ONE THING vous aide ?",
    step2Title: "Comment vous sentez-vous en général le matin ?",
    step3Title: "Combien de temps avez-vous chaque matin ?",
    step4Title: "À quelle adresse envoyer votre action du jour ?",
    continue: "Continuer",
    continueToPayment: "Continuer vers le paiement",
    startingCheckout: "Ouverture du paiement...",
    emailPlaceholder: "vous@exemple.com",
    selectionSummary1: "1 choisi → 4,99 $US/mois",
    selectionSummary2: "2 choisis → 7,99 $US/mois",
    selectionSummary3: "3 choisis → 9,99 $US/mois",
    errChooseCategories: "Choisissez 1 à 3 catégories avant de continuer.",
    errCheckout: "Impossible de lancer le paiement Stripe.",
    energyOptions: [
      { value: "low", label: "🔋 Faible", description: "J’ai besoin d’actions douces et faciles" },
      { value: "medium", label: "⚡ Moyen", description: "Je peux faire la plupart des choses" },
      { value: "high", label: "🚀 Élevé", description: "Proposez-moi quelque chose de concret" },
    ],
    timeOptions: [
      { value: "5", label: "5 minutes" },
      { value: "10", label: "10 minutes" },
      { value: "15", label: "15 minutes" },
    ],
  },
  es: {
    step1Title: "¿En qué quieres que ONE THING te ayude?",
    step2Title: "¿Cómo te sueles sentir por la mañana?",
    step3Title: "¿Cuánto tiempo tienes cada mañana?",
    step4Title: "¿A qué correo enviamos tu acción diaria?",
    continue: "Continuar",
    continueToPayment: "Ir al pago",
    startingCheckout: "Iniciando pago...",
    emailPlaceholder: "tu@ejemplo.com",
    selectionSummary1: "1 elegido → US$4.99/mes",
    selectionSummary2: "2 elegidos → US$7.99/mes",
    selectionSummary3: "3 elegidos → US$9.99/mes",
    errChooseCategories: "Elige de 1 a 3 categorías antes de continuar.",
    errCheckout: "No se pudo iniciar el pago con Stripe.",
    energyOptions: [
      { value: "low", label: "🔋 Baja", description: "Necesito acciones suaves y fáciles" },
      { value: "medium", label: "⚡ Media", description: "Puedo con la mayoría de las cosas" },
      { value: "high", label: "🚀 Alta", description: "Dame algo con peso real" },
    ],
    timeOptions: [
      { value: "5", label: "5 minutos" },
      { value: "10", label: "10 minutos" },
      { value: "15", label: "15 minutos" },
    ],
  },
};

export function getOnboardingCopy(locale: SiteLocale): OnboardingCopy {
  return COPY[locale] ?? COPY.en;
}

export function getCategoryLabelForOnboarding(locale: SiteLocale, slug: string): string {
  const ui = getAccountUiCopy(locale);
  return ui.themeLabels[slug] ?? slug;
}

export function selectionSummaryForCount(
  locale: SiteLocale,
  count: 1 | 2 | 3,
): string {
  const c = getOnboardingCopy(locale);
  if (count === 1) return c.selectionSummary1;
  if (count === 2) return c.selectionSummary2;
  return c.selectionSummary3;
}
