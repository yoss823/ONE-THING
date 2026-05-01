import type { SiteLocale } from "@/lib/i18n/locale";
import { CONTACT_EMAIL } from "@/lib/site/contact";

export type PrivacySection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type PrivacyPageContent = {
  h1: string;
  intro: string;
  sections: PrivacySection[];
};

const CONTENT: Record<SiteLocale, PrivacyPageContent> = {
  en: {
    h1: "Privacy policy",
    intro:
      "This policy explains what personal data ONE THING processes when you use the website and the email subscription, why we use it, how long we keep it, and what rights you have. Last updated: 2026.",
    sections: [
      {
        id: "controller",
        title: "Who is responsible?",
        paragraphs: [
          `For questions about this policy or your data: ${CONTACT_EMAIL}.`,
        ],
      },
      {
        id: "data",
        title: "Data we process",
        paragraphs: [
          "Account and subscription: email address, subscription status, billing identifiers from Stripe, timezone, language preference, and theme preferences you save in the product.",
          "Usage: delivery and engagement data needed to send emails and measure basic product usage (for example whether an action was completed or skipped when you use links in emails).",
          "Technical: server logs and security information from our hosting provider may include IP address and browser metadata for a limited time.",
        ],
      },
      {
        id: "purposes",
        title: "Purposes and legal bases",
        paragraphs: [
          "We process data to provide the service you signed up for (contract), to comply with legal obligations (such as tax or accounting where applicable), and, where allowed, to improve reliability and security (legitimate interests).",
        ],
      },
      {
        id: "processors",
        title: "Processors and transfers",
        paragraphs: [
          "We use trusted providers to run the product, including payment processing (Stripe), email delivery (Resend), hosting (Vercel), and database hosting configured for the deployment. Data may be processed in the European Union and/or the United States depending on provider regions.",
        ],
      },
      {
        id: "retention",
        title: "Retention",
        paragraphs: [
          "We keep data as long as your subscription is active and for a reasonable period afterwards to handle billing disputes, legal claims, and accounting where required. Some logs may be kept for shorter technical retention windows.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        paragraphs: [
          "Depending on your location, you may have rights to access, rectify, delete, restrict, or object to certain processing, and to lodge a complaint with a supervisory authority. Contact us at the email above to exercise your rights.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        paragraphs: [
          "The marketing site may use essential cookies and similar technologies required for language selection and security. Third-party analytics, if present, should be described in your deployment configuration.",
        ],
      },
    ],
  },
  fr: {
    h1: "Politique de confidentialité",
    intro:
      "Cette politique décrit les données personnelles traitées par ONE THING lorsque vous utilisez le site et l’abonnement e-mail, pourquoi nous les utilisons, combien de temps nous les conservons, et quels droits vous avez. Dernière mise à jour : 2026.",
    sections: [
      {
        id: "controller",
        title: "Responsable du traitement",
        paragraphs: [
          `Pour toute question sur cette politique ou vos données : ${CONTACT_EMAIL}.`,
        ],
      },
      {
        id: "data",
        title: "Données traitées",
        paragraphs: [
          "Compte et abonnement : adresse e-mail, statut d’abonnement, identifiants de facturation Stripe, fuseau horaire, langue, préférences de thèmes enregistrées dans le produit.",
          "Usage : données d’envoi et d’interaction nécessaires pour envoyer les e-mails et mesurer un usage de base (par exemple action terminée ou ignorée via les liens dans l’e-mail).",
          "Technique : journaux serveur et informations de sécurité du fournisseur d’hébergement peuvent inclure l’adresse IP et des métadonnées du navigateur pour une durée limitée.",
        ],
      },
      {
        id: "purposes",
        title: "Finalités et bases légales",
        paragraphs: [
          "Les données sont traitées pour fournir le service souscrit (contrat), respecter des obligations légales (comptabilité, fiscalité le cas échéant) et, le cas échéant, pour assurer la fiabilité et la sécurité du service (intérêt légitime).",
        ],
      },
      {
        id: "processors",
        title: "Sous-traitants et transferts",
        paragraphs: [
          "Nous faisons appel à des prestataires pour exploiter le produit : paiement (Stripe), envoi d’e-mails (Resend), hébergement (Vercel), hébergement de base de données selon la configuration du déploiement. Les données peuvent être traitées dans l’Union européenne et/ou les États-Unis selon les régions utilisées.",
        ],
      },
      {
        id: "retention",
        title: "Durée de conservation",
        paragraphs: [
          "Les données sont conservées pendant la durée de l’abonnement et une période raisonnable après résiliation pour litiges, réclamations et obligations comptables. Certains journaux techniques ont une durée plus courte.",
        ],
      },
      {
        id: "rights",
        title: "Vos droits",
        paragraphs: [
          "Selon votre situation, vous pouvez disposer de droits d’accès, de rectification, d’effacement, de limitation ou d’opposition, et du droit d’introduire une réclamation auprès d’une autorité de contrôle. Écrivez-nous à l’adresse ci-dessus pour exercer vos droits.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        paragraphs: [
          "Le site marketing peut utiliser des cookies ou technologies similaires nécessaires au choix de langue et à la sécurité. Toute analyse tierce doit être décrite selon la configuration de votre déploiement.",
        ],
      },
    ],
  },
  es: {
    h1: "Política de privacidad",
    intro:
      "Esta política explica qué datos personales trata ONE THING cuando usas el sitio y la suscripción por correo, con qué fines, cuánto tiempo los conservamos y qué derechos tienes. Última actualización: 2026.",
    sections: [
      {
        id: "controller",
        title: "Responsable",
        paragraphs: [
          `Para consultas sobre esta política o tus datos: ${CONTACT_EMAIL}.`,
        ],
      },
      {
        id: "data",
        title: "Datos que tratamos",
        paragraphs: [
          "Cuenta y suscripción: correo electrónico, estado de la suscripción, identificadores de facturación de Stripe, zona horaria, idioma y preferencias de temas que guardas en el producto.",
          "Uso: datos de entrega e interacción necesarios para enviar correos y medir el uso básico (por ejemplo acción completada u omitida al usar enlaces en el correo).",
          "Técnico: registros del servidor e información de seguridad del proveedor de alojamiento pueden incluir dirección IP y metadatos del navegador durante un tiempo limitado.",
        ],
      },
      {
        id: "purposes",
        title: "Finalidades y bases legales",
        paragraphs: [
          "Tratamos los datos para prestar el servicio contratado, cumplir obligaciones legales (contabilidad o fiscalidad cuando aplique) y, cuando proceda, para fiabilidad y seguridad (interés legítimo).",
        ],
      },
      {
        id: "processors",
        title: "Encargados y transferencias",
        paragraphs: [
          "Utilizamos proveedores para operar el producto: pagos (Stripe), envío de correo (Resend), alojamiento (Vercel) y base de datos según la configuración del despliegue. Los datos pueden tratarse en la UE y/o EE. UU. según regiones.",
        ],
      },
      {
        id: "retention",
        title: "Conservación",
        paragraphs: [
          "Conservamos los datos mientras la suscripción esté activa y un periodo razonable después para facturación, reclamaciones y obligaciones contables. Algunos registros técnicos tienen plazos más cortos.",
        ],
      },
      {
        id: "rights",
        title: "Tus derechos",
        paragraphs: [
          "Según tu ubicación, puedes tener derechos de acceso, rectificación, supresión, limitación u oposición, y a presentar una reclamación ante una autoridad de control. Escríbenos al correo indicado para ejercerlos.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        paragraphs: [
          "El sitio de marketing puede usar cookies o tecnologías similares necesarias para el idioma y la seguridad. Cualquier analítica de terceros debe describirse según la configuración de tu despliegue.",
        ],
      },
    ],
  },
};

export function getPrivacyPageContent(locale: SiteLocale): PrivacyPageContent {
  return CONTENT[locale] ?? CONTENT.en;
}
