import { ActionCategory } from "@prisma/client";
import Stripe from "stripe";

import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";

export const runtime = "nodejs";

type StripeClientConfig = ConstructorParameters<typeof Stripe>[1];

const CATEGORY_MAP: Record<string, ActionCategory> = {
  mental_clarity: ActionCategory.MENTAL_CLARITY,
  organization: ActionCategory.ORGANIZATION,
  health_energy: ActionCategory.HEALTH_ENERGY,
  work_business: ActionCategory.WORK_BUSINESS,
  personal_projects: ActionCategory.PERSONAL_PROJECTS,
  relationships: ActionCategory.RELATIONSHIPS,
};

const ENERGY_LEVEL_MAP: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  } as unknown as StripeClientConfig);
}

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function parseCategories(rawCategories: string | undefined): ActionCategory[] {
  if (!rawCategories) {
    throw new Error("Missing checkout metadata.categories.");
  }

  let parsedCategories: unknown;

  try {
    parsedCategories = JSON.parse(rawCategories) as unknown;
  } catch {
    throw new Error("Invalid checkout metadata.categories JSON.");
  }

  if (!Array.isArray(parsedCategories) || parsedCategories.length < 1 || parsedCategories.length > 3) {
    throw new Error("checkout metadata.categories must contain 1 to 3 items.");
  }

  return parsedCategories.map((category) => {
    if (typeof category !== "string") {
      throw new Error("checkout metadata.categories must be an array of strings.");
    }

    const normalized = normalizeCategory(category);
    const mapped = CATEGORY_MAP[normalized];

    if (!mapped) {
      throw new Error(`Unsupported category in checkout metadata: ${category}`);
    }

    return mapped;
  });
}

function parseEnergyLevel(rawEnergyLevel: string | undefined): number {
  if (!rawEnergyLevel) {
    throw new Error("Missing checkout metadata.energyLevel.");
  }

  const normalized = rawEnergyLevel.trim().toLowerCase();
  const mappedValue = ENERGY_LEVEL_MAP[normalized];

  if (mappedValue) {
    return mappedValue;
  }

  const numericValue = Number.parseInt(rawEnergyLevel, 10);

  if (Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 3) {
    return numericValue;
  }

  throw new Error(`Unsupported energy level in checkout metadata: ${rawEnergyLevel}`);
}

function parseAvailableMinutes(rawAvailableMinutes: string | undefined): number {
  if (!rawAvailableMinutes) {
    throw new Error("Missing checkout metadata.availableMinutes.");
  }

  const availableMinutes = Number.parseInt(rawAvailableMinutes, 10);

  if (!Number.isInteger(availableMinutes) || availableMinutes <= 0) {
    throw new Error(`Invalid availableMinutes in checkout metadata: ${rawAvailableMinutes}`);
  }

  return availableMinutes;
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string {
  if (typeof customer === "string") {
    return customer;
  }

  if (customer && "id" in customer) {
    return customer.id;
  }

  throw new Error("Stripe subscription/customer reference is missing.");
}

function getSubscriptionId(
  subscription: string | Stripe.Subscription | null,
): string {
  if (typeof subscription === "string") {
    return subscription;
  }

  if (subscription && "id" in subscription) {
    return subscription.id;
  }

  throw new Error("Stripe checkout session is missing a subscription id.");
}

function derivePlan(categoryCount: number): "tier_1" | "tier_2" | "tier_3" {
  if (categoryCount === 1) {
    return "tier_1";
  }

  if (categoryCount === 2) {
    return "tier_2";
  }

  if (categoryCount === 3) {
    return "tier_3";
  }

  throw new Error(`Unsupported category count for plan derivation: ${categoryCount}`);
}

function normalizeSubscriptionStatus(status: Stripe.Subscription.Status): string {
  if (status === "active" || status === "past_due" || status === "canceled") {
    return status;
  }

  return status;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email =
    session.customer_details?.email?.trim().toLowerCase() ||
    session.customer_email?.trim().toLowerCase();
  const name = session.customer_details?.name?.trim() || undefined;

  if (!email) {
    throw new Error("checkout.session.completed is missing customer_details.email.");
  }

  const stripeCustomerId = getCustomerId(session.customer);
  const stripeSubscriptionId = getSubscriptionId(session.subscription);
  const categories = parseCategories(session.metadata?.categories);
  const energyLevel = parseEnergyLevel(session.metadata?.energyLevel);
  const availableMinutes = parseAvailableMinutes(session.metadata?.availableMinutes);
  const plan = derivePlan(categories.length);
  const createdAt = new Date();

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      createdAt,
      timezone: 'UTC',
      subscription: {
        create: {
          stripeCustomerId,
          stripeSubscriptionId,
          status: "active",
          plan,
        },
      },
      preference: {
        create: {
          categories,
          energyLevel,
          availableMinutes,
        },
      },
    },
    update: {
      subscription: {
        upsert: {
          create: {
            stripeCustomerId,
            stripeSubscriptionId,
            status: "active",
            plan,
          },
          update: {
            stripeCustomerId,
            stripeSubscriptionId,
            status: "active",
            plan,
          },
        },
      },
      preference: {
        upsert: {
          create: {
            categories,
            energyLevel,
            availableMinutes,
          },
          update: {
            categories,
            energyLevel,
            availableMinutes,
          },
        },
      },
    },
  });

  await prisma.user.updateMany({
    where: {
      email,
      timezone: null,
    },
    data: {
      timezone: 'UTC',
    },
  });

  await sendWelcomeEmail(email, name);

  console.log("New subscriber:", email);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeCustomerId = getCustomerId(subscription.customer);
  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId },
  });

  if (!existingSubscription) {
    console.warn(
      `Received customer.subscription.updated for unknown Stripe customer ${stripeCustomerId}.`,
    );
    return;
  }

  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      stripeSubscriptionId: subscription.id,
      status: normalizeSubscriptionStatus(subscription.status),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeCustomerId = getCustomerId(subscription.customer);
  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId },
  });

  if (!existingSubscription) {
    console.warn(
      `Received customer.subscription.deleted for unknown Stripe customer ${stripeCustomerId}.`,
    );
    return;
  }

  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: "canceled",
    },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature header.", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("STRIPE_WEBHOOK_SECRET is not configured.", { status: 503 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`Failed to process Stripe webhook event ${event.type}.`, error);
    return new Response("Webhook handler failed.", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
