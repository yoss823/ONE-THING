export const PLAN_KEYS = [
  "oneCategory",
  "twoCategories",
  "threeCategories",
] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

export type Plan = {
  priceId: string;
  label: string;
  price: number;
  categoryCount: 1 | 2 | 3;
};

export const PLANS: Record<PlanKey, Plan> = {
  oneCategory: {
    priceId: "price_1TOkW68Jf6UbCUSKza0ksnKB",
    label: "ONE THING — 1 Category",
    price: 4.99,
    categoryCount: 1,
  },
  twoCategories: {
    priceId: "price_1TOkXA8Jf6UbCUSKaHcYRnzA",
    label: "ONE THING — 2 Categories",
    price: 7.99,
    categoryCount: 2,
  },
  threeCategories: {
    priceId: "price_1TOkY18Jf6UbCUSKaJykyfqT",
    label: "ONE THING — 3 Categories",
    price: 9.99,
    categoryCount: 3,
  },
};

export function getPlan(planKey: PlanKey): Plan {
  return PLANS[planKey];
}

export function getPlanForCategoryCount(
  categoryCount: number,
): [PlanKey, Plan] | null {
  for (const planKey of PLAN_KEYS) {
    const plan = PLANS[planKey];

    if (plan.categoryCount === categoryCount) {
      return [planKey, plan];
    }
  }

  return null;
}

export function getStripePriceId(planKey: PlanKey): string {
  return PLANS[planKey].priceId;
}

export function resolvePlanFromStripePriceId(stripePriceId: string): PlanKey | null {
  for (const planKey of PLAN_KEYS) {
    if (PLANS[planKey].priceId === stripePriceId) {
      return planKey;
    }
  }

  return null;
}
