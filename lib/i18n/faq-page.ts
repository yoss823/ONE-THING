import type { SiteLocale } from "@/lib/i18n/locale";

export type FaqItem = {
  question: string;
  answer: string;
};

const ITEMS: Record<SiteLocale, FaqItem[]> = {
  en: [
    {
      question: "What is ONE THING?",
      answer:
        "ONE THING sends one short email each morning with a concrete action for the themes you chose (1 to 3). It is designed to reduce decision fatigue, not to replace therapy or medical advice.",
    },
    {
      question: "At what time are emails sent?",
      answer:
        "Between 8:00 and 8:59 AM in the timezone saved on your account. On the 1st of each month, only the monthly recap is sent instead of the daily action.",
    },
    {
      question: "How do I change language or timezone?",
      answer:
        "Open your subscriber area from the link you received after checkout. You can adjust language, difficulty, time budget, and delivery timezone there.",
    },
    {
      question: "How does billing work?",
      answer:
        "Plans are billed monthly through Stripe. You can open the billing portal from your account page to manage payment methods and invoices.",
    },
    {
      question: "How do I unsubscribe?",
      answer:
        "Use the unsubscribe link at the bottom of any email, or contact us at the address shown in the footer of these pages.",
    },
    {
      question: "Do I need an app or login?",
      answer:
        "No separate app is required. Access to your dashboard uses the secure link tied to your subscription email.",
    },
  ],
  fr: [
    {
      question: "Qu’est-ce que ONE THING ?",
      answer:
        "ONE THING envoie chaque matin un court e-mail avec une action concrète pour les thèmes que vous avez choisis (1 à 3). L’objectif est de réduire la fatigue décisionnelle, pas de remplacer un suivi médical ou psychologique.",
    },
    {
      question: "À quelle heure partent les e-mails ?",
      answer:
        "Entre 8h00 et 8h59 dans le fuseau horaire enregistré sur votre compte. Le 1er du mois, seul le bilan mensuel est envoyé à la place de l’action du jour.",
    },
    {
      question: "Comment changer la langue ou le fuseau ?",
      answer:
        "Ouvrez l’espace abonné via le lien reçu après le paiement. Vous pouvez y modifier la langue, la difficulté, le temps disponible et le fuseau horaire des envois.",
    },
    {
      question: "Comment fonctionne la facturation ?",
      answer:
        "Les formules sont facturées chaque mois via Stripe. Vous pouvez ouvrir le portail de facturation depuis la page compte pour gérer moyens de paiement et factures.",
    },
    {
      question: "Comment me désabonner ?",
      answer:
        "Utilisez le lien de désinscription en bas de chaque e-mail, ou écrivez-nous à l’adresse indiquée en pied de ces pages.",
    },
    {
      question: "Faut-il une appli ou un mot de passe ?",
      answer:
        "Pas d’appli obligatoire. L’accès au tableau de bord se fait via le lien sécurisé associé à votre e-mail d’abonnement.",
    },
  ],
  es: [
    {
      question: "¿Qué es ONE THING?",
      answer:
        "ONE THING envía cada mañana un correo breve con una acción concreta para los temas que elegiste (de 1 a 3). Está pensado para reducir la fatiga de decisiones, no para sustituir asesoramiento médico o psicológico.",
    },
    {
      question: "¿A qué hora se envían los correos?",
      answer:
        "Entre las 8:00 y las 8:59 en la zona horaria guardada en tu cuenta. El día 1 de cada mes solo se envía el resumen mensual en lugar de la acción diaria.",
    },
    {
      question: "¿Cómo cambio el idioma o la zona horaria?",
      answer:
        "Abre el área de suscriptor con el enlace que recibiste tras el pago. Ahí puedes ajustar idioma, dificultad, tiempo disponible y zona horaria de envío.",
    },
    {
      question: "¿Cómo funciona la facturación?",
      answer:
        "Los planes se facturan mensualmente con Stripe. Puedes abrir el portal de facturación desde la página de cuenta para gestionar métodos de pago y facturas.",
    },
    {
      question: "¿Cómo me doy de baja?",
      answer:
        "Usa el enlace al final de cualquier correo o escríbenos a la dirección indicada al pie de estas páginas.",
    },
    {
      question: "¿Necesito una app o contraseña?",
      answer:
        "No hace falta una app aparte. El acceso al panel usa el enlace seguro asociado a tu correo de suscripción.",
    },
  ],
};

export function getFaqItems(locale: SiteLocale): FaqItem[] {
  return ITEMS[locale] ?? ITEMS.en;
}

const FAQ_H1: Record<SiteLocale, string> = {
  en: "Frequently asked questions",
  fr: "Foire aux questions",
  es: "Preguntas frecuentes",
};

export function getFaqPageHeading(locale: SiteLocale): string {
  return FAQ_H1[locale] ?? FAQ_H1.en;
}

export function buildFaqJsonLd(locale: SiteLocale): Record<string, unknown> {
  const items = getFaqItems(locale);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
