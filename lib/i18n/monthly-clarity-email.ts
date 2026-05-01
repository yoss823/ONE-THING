import type { SiteLocale } from "@/lib/i18n/locale";

export type MonthlyClarityEmailProps = {
  userName?: string;
  monthName: string;
  completedCount: number;
  skippedCount: number;
  topCategory: string;
  currentCategories: string[];
  upgradeUrl?: string;
  unsubscribeUrl: string;
  isFirstMonth?: boolean;
  locale: SiteLocale;
};

type Copy = {
  htmlLang: string;
  subjectFirst: string;
  subjectLater: string;
  headingFirst: string;
  headingLater: string;
  previewCompleted: (completed: number, month: string) => string;
  lineCompleted: (completed: number, month: string, skipped: number) => string;
  lineStrongest: (category: string) => string;
  lineFocus: (joined: string) => string;
  promptShift: string;
  promptReply: string;
  upgradeLink: string;
  closing: string;
  unsubscribe: string;
  categoryJoiner: string;
};

const COPY: Record<SiteLocale, Copy> = {
  en: {
    htmlLang: "en",
    subjectFirst: "One month in.",
    subjectLater: "Another month.",
    headingFirst: "One month in.",
    headingLater: "Another month.",
    previewCompleted: (completed, month) => `${completed} completed in ${month}.`,
    lineCompleted: (completed, month, skipped) =>
      `You completed ${completed} actions in ${month}. Skipped ${skipped}.`,
    lineStrongest: (category) => `Your strongest area: ${category}.`,
    lineFocus: (joined) => `Current focus: ${joined}.`,
    promptShift: "Same categories for next month, or time to shift focus?",
    promptReply: "Reply to this email if you'd like to make a change.",
    upgradeLink: "Ready to add another area? → Upgrade your plan",
    closing: "Back tomorrow with your next action.",
    unsubscribe: "Unsubscribe",
    categoryJoiner: ", ",
  },
  fr: {
    htmlLang: "fr",
    subjectFirst: "Un mois déjà.",
    subjectLater: "Un mois de plus.",
    headingFirst: "Un mois déjà.",
    headingLater: "Un mois de plus.",
    previewCompleted: (completed, month) => `${completed} terminées en ${month}.`,
    lineCompleted: (completed, month, skipped) =>
      `En ${month} : ${completed} terminée(s), ${skipped} ignorée(s).`,
    lineStrongest: (category) => `Ton domaine le plus fort : ${category}.`,
    lineFocus: (joined) => `Focus actuel : ${joined}.`,
    promptShift: "Les mêmes catégories le mois prochain, ou envie de changer de focus ?",
    promptReply: "Réponds à cet e-mail si tu veux qu’on ajuste quelque chose.",
    upgradeLink: "Ajouter un axe ? → Mettre à niveau ton offre",
    closing: "Demain, retour à ton action du jour.",
    unsubscribe: "Se désabonner",
    categoryJoiner: " · ",
  },
  es: {
    htmlLang: "es",
    subjectFirst: "Un mes.",
    subjectLater: "Otro mes.",
    headingFirst: "Un mes.",
    headingLater: "Otro mes.",
    previewCompleted: (completed, month) => `${completed} completadas en ${month}.`,
    lineCompleted: (completed, month, skipped) =>
      `Completaste ${completed} acciones en ${month}. Omitidas: ${skipped}.`,
    lineStrongest: (category) => `Tu área más fuerte: ${category}.`,
    lineFocus: (joined) => `Enfoque actual: ${joined}.`,
    promptShift: "¿Mismas categorías el próximo mes, o toca cambiar el foco?",
    promptReply: "Responde a este correo si quieres que ajustemos algo.",
    upgradeLink: "¿Quieres sumar un área? → Mejorar tu plan",
    closing: "Mañana volvemos con tu acción del día.",
    unsubscribe: "Darse de baja",
    categoryJoiner: " · ",
  },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveCopy(locale: SiteLocale): Copy {
  return COPY[locale] ?? COPY.en;
}

export function getMonthlyClaritySubject(locale: SiteLocale, isFirstMonth: boolean | undefined): string {
  const c = resolveCopy(locale);
  return isFirstMonth === false ? c.subjectLater : c.subjectFirst;
}

export function generateMonthlyClarityHtml(props: MonthlyClarityEmailProps): string {
  const c = resolveCopy(props.locale);
  const heading = props.isFirstMonth === false ? c.headingLater : c.headingFirst;
  const previewText = `${heading} ${c.previewCompleted(props.completedCount, props.monthName)}`;
  const joined = props.currentCategories.join(c.categoryJoiner);
  const greeting = props.userName
    ? `<p style="margin:0 0 16px;">${escapeHtml(props.userName)},</p>`
    : "";
  const upgrade = props.upgradeUrl
    ? `<p style="margin:0 0 24px;"><a href="${escapeHtml(props.upgradeUrl)}" style="color:#111111;text-decoration:underline;">${escapeHtml(c.upgradeLink)}</a></p>`
    : "";

  return [
    "<!DOCTYPE html>",
    `<html lang="${c.htmlLang}"><head>`,
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "</head>",
    '<body style="margin:0;padding:0;background-color:#ffffff;color:#111111;font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">',
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;line-height:1px;color:transparent;">${escapeHtml(previewText)}</div>`,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-collapse:collapse;"><tr><td align="center" style="padding:32px 20px;">',
    '<div style="max-width:480px;margin:0 auto;line-height:1.55;font-size:15px;">',
    greeting,
    `<p style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-style:italic;">${escapeHtml(heading)}</p>`,
    `<p style="margin:0 0 16px;">${escapeHtml(c.lineCompleted(props.completedCount, props.monthName, props.skippedCount))}</p>`,
    `<p style="margin:0 0 16px;">${escapeHtml(c.lineStrongest(props.topCategory))}</p>`,
    `<p style="margin:0 0 16px;">${escapeHtml(c.lineFocus(joined))}</p>`,
    `<p style="margin:0 0 8px;">${escapeHtml(c.promptShift)}</p>`,
    `<p style="margin:0 0 24px;">${escapeHtml(c.promptReply)}</p>`,
    upgrade,
    `<p style="margin:0 0 24px;">${escapeHtml(c.closing)}</p>`,
    '<p style="margin:0 0 16px;color:#666666;">---</p>',
    `<p style="margin:0;"><a href="${escapeHtml(props.unsubscribeUrl)}" style="color:#111111;text-decoration:underline;">${escapeHtml(c.unsubscribe)}</a></p>`,
    "</div>",
    "</td></tr></table>",
    "</body></html>",
  ].join("");
}

export function generateMonthlyClarityText(props: MonthlyClarityEmailProps): string {
  const c = resolveCopy(props.locale);
  const heading = props.isFirstMonth === false ? c.headingLater : c.headingFirst;
  const joined = props.currentCategories.join(c.categoryJoiner);

  return [
    props.userName ? `${props.userName},` : null,
    heading,
    "",
    c.lineCompleted(props.completedCount, props.monthName, props.skippedCount),
    c.lineStrongest(props.topCategory),
    c.lineFocus(joined),
    "",
    c.promptShift,
    c.promptReply,
    props.upgradeUrl ? `${c.upgradeLink}: ${props.upgradeUrl}` : null,
    "",
    c.closing,
    "",
    `${c.unsubscribe}: ${props.unsubscribeUrl}`,
  ]
    .filter((line) => line !== null && line !== undefined)
    .join("\n");
}
