import type { SiteLocale } from "@/lib/i18n/locale";

export type AccountBillingCopy = {
  title: string;
  description: string;
  button: string;
  opening: string;
};

const COPY: Record<SiteLocale, AccountBillingCopy> = {
  en: {
    title: "Billing & invoices (Stripe)",
    description:
      "Update your payment method or download invoices on Stripe’s secure page. To add more themes, use the upgrade buttons above.",
    button: "Open billing & invoices",
    opening: "Opening…",
  },
  fr: {
    title: "Facturation et factures (Stripe)",
    description:
      "Mettez à jour votre moyen de paiement ou téléchargez les factures sur la page sécurisée Stripe. Pour plus de thèmes, utilisez les boutons ci-dessus.",
    button: "Ouvrir facturation et factures",
    opening: "Ouverture…",
  },
  es: {
    title: "Facturación y facturas (Stripe)",
    description:
      "Actualiza tu método de pago o descarga facturas en la página segura de Stripe. Para más temas, usa los botones de arriba.",
    button: "Abrir facturación y facturas",
    opening: "Abriendo…",
  },
};

export function getAccountBillingCopy(locale: SiteLocale): AccountBillingCopy {
  return COPY[locale] ?? COPY.en;
}
