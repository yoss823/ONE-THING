import { ActionCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<ActionCategory, string> = {
  [ActionCategory.MENTAL_CLARITY]: "Mental clarity",
  [ActionCategory.ORGANIZATION]: "Organization",
  [ActionCategory.HEALTH_ENERGY]: "Health & energy",
  [ActionCategory.WORK_BUSINESS]: "Work & business",
  [ActionCategory.PERSONAL_PROJECTS]: "Personal projects",
  [ActionCategory.RELATIONSHIPS]: "Relationships",
};

export function formatCategoryLabel(category: ActionCategory): string {
  return CATEGORY_LABELS[category];
}
