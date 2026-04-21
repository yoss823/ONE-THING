export const PLAN_KEYS = ["monthly", "quarterly", "annual"] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

type PlanDefinition = {
  planKey: PlanKey;
  label: string;
  priceCents: number;
  interval: "month" | "year";
  intervalCount: 1 | 3 | 12;
  trialDays: number;
  stripe: {
    productLookupKey: "one_thing_membership";
    priceLookupKey: string;
    priceEnvVar:
      | "STRIPE_PRICE_MONTHLY"
      | "STRIPE_PRICE_QUARTERLY"
      | "STRIPE_PRICE_ANNUAL";
  };
};

export const PLAN_DEFINITIONS: Record<PlanKey, PlanDefinition> = {
  monthly: {
    planKey: "monthly",
    label: "Monthly",
    priceCents: 1200,
    interval: "month",
    intervalCount: 1,
    trialDays: 7,
    stripe: {
      productLookupKey: "one_thing_membership",
      priceLookupKey: "one_thing_monthly",
      priceEnvVar: "STRIPE_PRICE_MONTHLY",
    },
  },
  quarterly: {
    planKey: "quarterly",
    label: "Quarterly",
    priceCents: 3000,
    interval: "month",
    intervalCount: 3,
    trialDays: 7,
    stripe: {
      productLookupKey: "one_thing_membership",
      priceLookupKey: "one_thing_quarterly",
      priceEnvVar: "STRIPE_PRICE_QUARTERLY",
    },
  },
  annual: {
    planKey: "annual",
    label: "Annual",
    priceCents: 9600,
    interval: "year",
    intervalCount: 12,
    trialDays: 7,
    stripe: {
      productLookupKey: "one_thing_membership",
      priceLookupKey: "one_thing_annual",
      priceEnvVar: "STRIPE_PRICE_ANNUAL",
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
