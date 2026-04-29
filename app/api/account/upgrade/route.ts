import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/db";
import { getPlanForCategoryCount } from "@/lib/billing/plans";

type UpgradeBody = {
  userId?: string;
  targetThemeCount?: number;
};

const PLAN_BY_THEME_COUNT: Record<number, "tier_1" | "tier_2" | "tier_3"> = {
  1: "tier_1",
  2: "tier_2",
  3: "tier_3",
};

const PLAN_LABEL_BY_THEME_COUNT: Record<number, string> = {
  1: "1 theme",
  2: "2 themes",
  3: "3 themes",
};

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  });
}

function getPlanThemeLimit(plan: string): number {
  if (plan === "tier_1") return 1;
  if (plan === "tier_2") return 2;
  if (plan === "tier_3") return 3;
  return 1;
}

export async function POST(request: Request) {
  let body: UpgradeBody;

  try {
    body = (await request.json()) as UpgradeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = body.userId?.trim();
  const targetThemeCount = body.targetThemeCount;

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  if (!Number.isInteger(targetThemeCount) || ![2, 3].includes(targetThemeCount ?? 0)) {
    return NextResponse.json({ error: "targetThemeCount must be 2 or 3." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          stripeSubscriptionId: true,
        },
      },
    },
  });

  if (!user?.subscription) {
    return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
  }

  if (!user.subscription.stripeSubscriptionId) {
    return NextResponse.json({ error: "Stripe subscription is missing." }, { status: 400 });
  }

  if (!["active", "trialing", "past_due"].includes(user.subscription.status.toLowerCase())) {
    return NextResponse.json({ error: "Subscription is not upgradable." }, { status: 403 });
  }

  const currentThemeLimit = getPlanThemeLimit(user.subscription.plan);
  if (targetThemeCount <= currentThemeLimit) {
    return NextResponse.json(
      { error: "Downgrades are not available from the dashboard." },
      { status: 400 },
    );
  }

  const targetPlan = getPlanForCategoryCount(targetThemeCount)?.[1];
  if (!targetPlan) {
    return NextResponse.json({ error: "Target plan not found." }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    const stripeSubscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId,
    );
    const item = stripeSubscription.items.data[0];

    if (!item) {
      return NextResponse.json(
        { error: "Subscription item not found in Stripe." },
        { status: 404 },
      );
    }

    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      items: [{ id: item.id, price: targetPlan.priceId }],
      proration_behavior: "create_prorations",
    });

    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        plan: PLAN_BY_THEME_COUNT[targetThemeCount],
      },
    });

    return NextResponse.json({
      ok: true,
      planLabel: PLAN_LABEL_BY_THEME_COUNT[targetThemeCount],
      planThemeLimit: targetThemeCount,
    });
  } catch (error) {
    console.error("Failed to upgrade subscription.", error);
    return NextResponse.json({ error: "Upgrade is temporarily unavailable." }, { status: 503 });
  }
}
