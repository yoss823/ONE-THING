import type { SiteLocale } from "@/lib/i18n/locale";
import { CONTACT_DOMAIN, CONTACT_EMAIL } from "@/lib/site/contact";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalPageContent = {
  h1: string;
  intro: string;
  sections: LegalSection[];
};

const CONTENT: Record<SiteLocale, LegalPageContent> = {
  en: {
    h1: "Legal notice",
    intro:
      "This page describes who publishes the ONE THING website and service, how to contact us, and where the site is hosted. It is provided for transparency and does not replace tailored legal advice.",
    sections: [
      {
        id: "publisher",
        title: "Publisher",
        paragraphs: [
          `The ONE THING product and website are operated in connection with ${CONTACT_DOMAIN}. For any question about the service or these notices: ${CONTACT_EMAIL}.`,
          "Brand and product name: ONE THING.",
        ],
      },
      {
        id: "hosting",
        title: "Hosting",
        paragraphs: [
          "The application and pages are hosted on infrastructure provided by Vercel Inc. (United States) and related cloud providers used for deployment (for example database and serverless execution regions configured in your project).",
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual property",
        paragraphs: [
          "Text, layout, and email templates are protected by applicable copyright laws unless otherwise stated. Reuse or reproduction without permission is not allowed.",
        ],
      },
      {
        id: "liability",
        title: "Limitation of liability",
        paragraphs: [
          "ONE THING provides suggestions for personal productivity only. It is not medical, legal, or financial advice. Use of the service is at your own risk to the extent permitted by law.",
        ],
      },
    ],
  },
  fr: {
    h1: "Mentions légales",
    intro:
      "Cette page indique qui publie le site et le service ONE THING, comment nous contacter, et où le site est hébergé. Elle vise la transparence et ne remplace pas un conseil juridique personnalisé.",
    sections: [
      {
        id: "publisher",
        title: "Éditeur",
        paragraphs: [
          `Le produit et le site ONE THING sont exploités en lien avec ${CONTACT_DOMAIN}. Pour toute question sur le service ou ces mentions : ${CONTACT_EMAIL}.`,
          "Nom de marque et de produit : ONE THING.",
        ],
      },
      {
        id: "hosting",
        title: "Hébergement",
        paragraphs: [
          "L’application et les pages sont hébergées sur une infrastructure fournie par Vercel Inc. (États-Unis) et des prestataires cloud associés au déploiement (par exemple base de données et exécution serverless selon la configuration du projet).",
        ],
      },
      {
        id: "intellectual-property",
        title: "Propriété intellectuelle",
        paragraphs: [
          "Les textes, la mise en page et les modèles d’e-mails sont protégés par le droit d’auteur sauf mention contraire. Toute reproduction ou réutilisation sans autorisation est interdite.",
        ],
      },
      {
        id: "liability",
        title: "Responsabilité",
        paragraphs: [
          "ONE THING propose des pistes d’action pour la productivité personnelle uniquement. Ce n’est pas un avis médical, juridique ou financier. L’utilisation du service se fait sous votre responsabilité dans les limites permises par la loi.",
        ],
      },
    ],
  },
  es: {
    h1: "Aviso legal",
    intro:
      "Esta página describe quién publica el sitio y el servicio ONE THING, cómo contactarnos y dónde se aloja el sitio. Es informativa y no sustituye asesoramiento legal personalizado.",
    sections: [
      {
        id: "publisher",
        title: "Editor",
        paragraphs: [
          `El producto y el sitio ONE THING se operan en relación con ${CONTACT_DOMAIN}. Para consultas sobre el servicio o este aviso: ${CONTACT_EMAIL}.`,
          "Marca y producto: ONE THING.",
        ],
      },
      {
        id: "hosting",
        title: "Alojamiento",
        paragraphs: [
          "La aplicación y las páginas se alojan en infraestructura de Vercel Inc. (Estados Unidos) y proveedores cloud asociados al despliegue (por ejemplo base de datos y ejecución serverless según la configuración del proyecto).",
        ],
      },
      {
        id: "intellectual-property",
        title: "Propiedad intelectual",
        paragraphs: [
          "Los textos, el diseño y las plantillas de correo están protegidos por derechos de autor salvo indicación contraria. No se permite su reproducción o reutilización sin permiso.",
        ],
      },
      {
        id: "liability",
        title: "Responsabilidad",
        paragraphs: [
          "ONE THING ofrece sugerencias para la productividad personal únicamente. No constituye asesoramiento médico, jurídico ni financiero. El uso del servicio es bajo tu responsabilidad en la medida en que lo permita la ley.",
        ],
      },
    ],
  },
};

export function getLegalPageContent(locale: SiteLocale): LegalPageContent {
  return CONTENT[locale] ?? CONTENT.en;
}
