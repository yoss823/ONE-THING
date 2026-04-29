import type { SiteLocale } from "@/lib/i18n/locale";

export type CheckoutSuccessCopy = {
  eyebrow: string;
  title: string;
  body: string;
  checklist: string[];
  nextSteps: string;
  stepLabel: (n: number) => string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

const PRIMARY_HREF = "/#email-previews";
const SECONDARY_HREF = "/#pricing";

const COPY: Record<SiteLocale, CheckoutSuccessCopy> = {
  en: {
    eyebrow: "Payment confirmed",
    title: "ONE THING is scheduled.",
    body:
      "Your plan is active. The next step is a short setup: confirm your timezone, choose up to three categories, and let the system start the next 8:00 AM local delivery.",
    checklist: [
      "Confirm your email address.",
      "Choose 1 to 3 categories.",
      "Select the billing cadence you want to keep after the trial.",
      "Look for the first email at 8:00 AM local time.",
    ],
    nextSteps: "Next steps",
    stepLabel: (n) => `Step ${n}`,
    primaryCta: { label: "Read the daily email format", href: PRIMARY_HREF },
    secondaryCta: { label: "Back to pricing", href: SECONDARY_HREF },
  },
  fr: {
    eyebrow: "Paiement confirmé",
    title: "ONE THING est programmé.",
    body:
      "Votre formule est active. Prochaine étape : un court paramétrage (fuseau, 1 à 3 catégories), puis le premier envoi à 8 h heure locale.",
    checklist: [
      "Confirmez votre adresse e-mail.",
      "Choisissez 1 à 3 catégories.",
      "Vérifiez la cadence de facturation après l’essai.",
      "Surveillez le premier e-mail à 8 h heure locale.",
    ],
    nextSteps: "Étapes suivantes",
    stepLabel: (n) => `Étape ${n}`,
    primaryCta: { label: "Voir le format de l’e-mail quotidien", href: PRIMARY_HREF },
    secondaryCta: { label: "Retour aux tarifs", href: SECONDARY_HREF },
  },
  es: {
    eyebrow: "Pago confirmado",
    title: "ONE THING está programado.",
    body:
      "Tu plan está activo. El siguiente paso es un ajuste breve (zona horaria, de 1 a 3 categorías) y el primer envío a las 8:00 hora local.",
    checklist: [
      "Confirma tu correo.",
      "Elige de 1 a 3 categorías.",
      "Revisa la cadencia de facturación tras la prueba.",
      "Busca el primer correo a las 8:00 hora local.",
    ],
    nextSteps: "Próximos pasos",
    stepLabel: (n) => `Paso ${n}`,
    primaryCta: { label: "Ver el formato del correo diario", href: PRIMARY_HREF },
    secondaryCta: { label: "Volver a precios", href: SECONDARY_HREF },
  },
};

export function getCheckoutSuccessCopy(locale: SiteLocale): CheckoutSuccessCopy {
  return COPY[locale] ?? COPY.en;
}
