import type { SiteLocale } from "@/lib/i18n/locale";

export type HomeGuidedChoice = {
  label: string;
  response: string;
};

export type HomePageCopy = {
  heroEyebrow: string;
  heroLine1: string;
  heroLine2: string;
  heroLine3: string;
  heroLead: string;
  notSure: string;
  guidedIntro: string;
  guidedChoices: HomeGuidedChoice[];
  oneDecision: string;
  ctaPrimary: string;
  ctaFootnote: string;
  subscriber: {
    title: string;
    description: string;
    linkLabel: string;
  };
  demoTitle: string;
  demoSubject: string;
  demoCategory: string;
  demoAction: string;
  demoFooter: string;
  demoCaption: string;
  howTitle: string;
  howBody: string;
  categoriesTitle: string;
  categories: string[];
  pricingTitle: string;
  plans: Array<{ label: string; price: string; period: string }>;
  footerBrand: string;
};

const COPY: Record<SiteLocale, HomePageCopy> = {
  en: {
    heroEyebrow: "Quiet software for mornings",
    heroLine1: "ONE THING",
    heroLine2: "Stop deciding.",
    heroLine3: "Start doing.",
    heroLead:
      "Every morning at 8:00 AM, you receive one concrete action per selected theme. Nothing else.",
    notSure: "Not sure this is for you?",
    guidedIntro: "This works best if you feel...",
    guidedChoices: [
      {
        label: "Overwhelmed",
        response: "ONE THING removes the decision. One action, chosen for you.",
      },
      {
        label: "Stuck in my head",
        response: "Action breaks the loop. You just have to do one thing.",
      },
      {
        label: "Inconsistent lately",
        response: "Consistency without pressure. Same time, every morning.",
      },
    ],
    oneDecision: "One decision. Tomorrow morning is handled.",
    ctaPrimary: "Start tomorrow at 8:00 AM",
    ctaFootnote: "One email. One action. No login.",
    subscriber: {
      title: "Already subscribed?",
      description: "Open your dashboard anytime with the email you used at checkout.",
      linkLabel: "Subscriber area →",
    },
    demoTitle: "What arrives each morning",
    demoSubject: "Your one thing for Monday, May 5",
    demoCategory: "Health / Energy",
    demoAction: "Do 10 slow deep breaths before opening your laptop.",
    demoFooter: "✅ Done · ⏸ Skip for today",
    demoCaption: "That's it. Every morning at 8:00 AM.",
    howTitle: "How it works",
    howBody:
      "Every morning at 8:00 AM, one email.\nOne action per selected theme. 5 to 15 minutes.\nDone.",
    categoriesTitle: "Categories",
    categories: [
      "Mental clarity",
      "Organization",
      "Health / Energy",
      "Work / Business",
      "Personal projects",
      "Relationships",
    ],
    pricingTitle: "Pricing",
    plans: [
      { label: "1 category", price: "$4.99", period: "/month" },
      { label: "2 categories", price: "$7.99", period: "/month" },
      { label: "3 categories", price: "$9.99", period: "/month" },
    ],
    footerBrand: "ONE THING",
  },
  fr: {
    heroEyebrow: "Un outil discret pour vos matins",
    heroLine1: "ONE THING",
    heroLine2: "Arrêtez de décider.",
    heroLine3: "Passez à l’action.",
    heroLead:
      "Chaque matin à 8 h, vous recevez une action concrète par thème choisi. Rien d’autre.",
    notSure: "Pas sûr que ce soit pour vous ?",
    guidedIntro: "C’est le plus adapté si vous vous sentez…",
    guidedChoices: [
      {
        label: "Débordé·e",
        response: "ONE THING enlève la décision. Une action, choisie pour vous.",
      },
      {
        label: "Coincé·e dans ma tête",
        response: "L’action casse la boucle. Il suffit d’en faire une.",
      },
      {
        label: "Peu régulier·ère en ce moment",
        response: "De la régularité sans pression. Même heure, chaque matin.",
      },
    ],
    oneDecision: "Une décision. Demain matin, c’est réglé.",
    ctaPrimary: "Commencer demain à 8 h",
    ctaFootnote: "Un e-mail. Une action. Sans compte.",
    subscriber: {
      title: "Déjà abonné ?",
      description: "Ouvrez votre tableau de bord à tout moment avec l’e-mail utilisé au paiement.",
      linkLabel: "Espace abonné →",
    },
    demoTitle: "Ce qui arrive chaque matin",
    demoSubject: "Votre unique action pour lundi 5 mai",
    demoCategory: "Santé / Énergie",
    demoAction: "Faites 10 respirations lentes et profondes avant d’ouvrir votre ordinateur.",
    demoFooter: "✅ Fait · ⏸ Passer aujourd’hui",
    demoCaption: "C’est tout. Chaque matin à 8 h.",
    howTitle: "Comment ça marche",
    howBody:
      "Chaque matin à 8 h, un e-mail.\nUne action par thème choisi. 5 à 15 minutes.\nTerminé.",
    categoriesTitle: "Catégories",
    categories: [
      "Clarté mentale",
      "Organisation",
      "Santé / Énergie",
      "Travail / Activité",
      "Projets personnels",
      "Relations",
    ],
    pricingTitle: "Tarifs",
    plans: [
      { label: "1 catégorie", price: "4,99 $US", period: "/mois" },
      { label: "2 catégories", price: "7,99 $US", period: "/mois" },
      { label: "3 catégories", price: "9,99 $US", period: "/mois" },
    ],
    footerBrand: "ONE THING",
  },
  es: {
    heroEyebrow: "Software discreto para las mañanas",
    heroLine1: "ONE THING",
    heroLine2: "Deja de decidir.",
    heroLine3: "Empieza a hacer.",
    heroLead:
      "Cada mañana a las 8:00 recibes una acción concreta por cada tema elegido. Nada más.",
    notSure: "¿No sabes si es para ti?",
    guidedIntro: "Funciona mejor si te sientes…",
    guidedChoices: [
      {
        label: "Abrumado/a",
        response: "ONE THING quita la decisión. Una acción, elegida para ti.",
      },
      {
        label: "Atrapado/a en mi cabeza",
        response: "La acción rompe el bucle. Solo tienes que hacer una cosa.",
      },
      {
        label: "Irregular últimamente",
        response: "Constancia sin presión. Misma hora, cada mañana.",
      },
    ],
    oneDecision: "Una decisión. Mañana por la mañana, resuelto.",
    ctaPrimary: "Empezar mañana a las 8:00",
    ctaFootnote: "Un correo. Una acción. Sin cuenta.",
    subscriber: {
      title: "¿Ya estás suscrito?",
      description: "Abre tu panel en cualquier momento con el correo que usaste al pagar.",
      linkLabel: "Área de suscriptor →",
    },
    demoTitle: "Lo que llega cada mañana",
    demoSubject: "Tu única acción para el lunes 5 de mayo",
    demoCategory: "Salud / Energía",
    demoAction: "Haz 10 respiraciones lentas y profundas antes de abrir el portátil.",
    demoFooter: "✅ Hecho · ⏸ Saltar hoy",
    demoCaption: "Eso es todo. Cada mañana a las 8:00.",
    howTitle: "Cómo funciona",
    howBody:
      "Cada mañana a las 8:00, un correo.\nUna acción por tema elegido. De 5 a 15 minutos.\nListo.",
    categoriesTitle: "Categorías",
    categories: [
      "Claridad mental",
      "Organización",
      "Salud / Energía",
      "Trabajo / Negocio",
      "Proyectos personales",
      "Relaciones",
    ],
    pricingTitle: "Precios",
    plans: [
      { label: "1 categoría", price: "US$4.99", period: "/mes" },
      { label: "2 categorías", price: "US$7.99", period: "/mes" },
      { label: "3 categorías", price: "US$9.99", period: "/mes" },
    ],
    footerBrand: "ONE THING",
  },
};

export function getHomePageCopy(locale: SiteLocale): HomePageCopy {
  return COPY[locale] ?? COPY.en;
}
