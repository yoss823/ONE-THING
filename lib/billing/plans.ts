export const PLAN_KEYS = [
  "oneCategory",
  "twoCategories",
  "threeCategories",
] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

type PlanDefinition = {
  planKey: PlanKey;
  label: string;
  priceCents: number;
  interval: "month";
  intervalCount: 1;
  trialDays: 0;
  stripe: {
    productLookupKey: string;
    priceLookupKey: string;
    priceEnvVar:
      | "STRIPE_PRICE_ID_1CAT"
      | "STRIPE_PRICE_ID_2CAT"
      | "STRIPE_PRICE_ID_3CAT";
  };
};

export const PLAN_DEFINITIONS: Record<PlanKey, PlanDefinition> = {
  oneCategory: {
    planKey: "oneCategory",
    label: "ONE THING — 1 Category",
    priceCents: 499,
    interval: "month",
    intervalCount: 1,
    trialDays: 0,
    stripe: {
      productLookupKey: "one_thing_1_category",
      priceLookupKey: "one_thing_1_category_monthly",
      priceEnvVar: "STRIPE_PRICE_ID_1CAT",
    },
  },
  twoCategories: {
    planKey: "twoCategories",
    label: "ONE THING — 2 Categories",
    priceCents: 799,
    interval: "month",
    intervalCount: 1,
    trialDays: 0,
    stripe: {
      productLookupKey: "one_thing_2_categories",
      priceLookupKey: "one_thing_2_categories_monthly",
      priceEnvVar: "STRIPE_PRICE_ID_2CAT",
    },
  },
  threeCategories: {
    planKey: "threeCategories",
    label: "ONE THING — 3 Categories",
    priceCents: 999,
    interval: "month",
    intervalCount: 1,
    trialDays: 0,
    stripe: {
      productLookupKey: "one_thing_3_categories",
      priceLookupKey: "one_thing_3_categories_monthly",
      priceEnvVar: "STRIPE_PRICE_ID_3CAT",
    },
  },
};

export function getPlanDefinition(planKey: PlanKey): PlanDefinition {
  return PLAN_DEFINITIONS[planKey];
}

export function getStripePriceId(
  planKey: PlanKey,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const definition = getPlanDefinition(planKey);
  const value = env[definition.stripe.priceEnvVar];

  if (!value) {
    throw new Error(
      `Missing Stripe price id for ${planKey}: ${definition.stripe.priceEnvVar}.`,
    );
  }

  return value;
}

export function resolvePlanFromStripePriceId(
  stripePriceId: string,
  env: NodeJS.ProcessEnv = process.env,
): PlanKey | null {
  for (const planKey of PLAN_KEYS) {
    const definition = PLAN_DEFINITIONS[planKey];

    if (env[definition.stripe.priceEnvVar] === stripePriceId) {
      return planKey;
    }
  }

  return null;
}
