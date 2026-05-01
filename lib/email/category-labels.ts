import { ActionCategory } from "@prisma/client";

import type { SiteLocale } from "@/lib/i18n/locale";

export const CATEGORY_LABELS: Record<ActionCategory, string> = {
  [ActionCategory.MENTAL_CLARITY]: "Mental clarity",
  [ActionCategory.ORGANIZATION]: "Organization",
  [ActionCategory.HEALTH_ENERGY]: "Health & energy",
  [ActionCategory.WORK_BUSINESS]: "Work & business",
  [ActionCategory.PERSONAL_PROJECTS]: "Personal projects",
  [ActionCategory.RELATIONSHIPS]: "Relationships",
};

const CATEGORY_LABELS_FR: Record<ActionCategory, string> = {
  [ActionCategory.MENTAL_CLARITY]: "Clarté mentale",
  [ActionCategory.ORGANIZATION]: "Organisation",
  [ActionCategory.HEALTH_ENERGY]: "Santé et énergie",
  [ActionCategory.WORK_BUSINESS]: "Travail et activité",
  [ActionCategory.PERSONAL_PROJECTS]: "Projets personnels",
  [ActionCategory.RELATIONSHIPS]: "Relations",
};

const CATEGORY_LABELS_ES: Record<ActionCategory, string> = {
  [ActionCategory.MENTAL_CLARITY]: "Claridad mental",
  [ActionCategory.ORGANIZATION]: "Organización",
  [ActionCategory.HEALTH_ENERGY]: "Salud y energía",
  [ActionCategory.WORK_BUSINESS]: "Trabajo y negocio",
  [ActionCategory.PERSONAL_PROJECTS]: "Proyectos personales",
  [ActionCategory.RELATIONSHIPS]: "Relaciones",
};

export function formatCategoryLabel(
  category: ActionCategory,
  locale: SiteLocale = "en",
): string {
  if (locale === "fr") {
    return CATEGORY_LABELS_FR[category];
  }
  if (locale === "es") {
    return CATEGORY_LABELS_ES[category];
  }
  return CATEGORY_LABELS[category];
}
