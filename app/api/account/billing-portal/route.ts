import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/db";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

type BillingPortalBody = {
  userId?: string;
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

function resolveReturnUrl(request: Request, userId: string): string {
  const baseUrl = tryResolvePublicBaseUrl() ?? new URL(request.url).origin;

  return new URL(`/account?userId=${encodeURIComponent(userId)}`, baseUrl).toString();
}

export async function POST(request: Request) {
  let body: BillingPortalBody;

  try {
    body = (await request.json()) as BillingPortalBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = body.userId?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscription: {
        select: {
          stripeCustomerId: true,
          status: true,
        },
      },
    },
  });

  if (!user?.subscription) {
    return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
  }

  if (!user.subscription.stripeCustomerId) {
    return NextResponse.json(
      { error: "Stripe customer is missing for this account." },
      { status: 400 },
    );
  }

  if (!["active", "trialing", "past_due"].includes(user.subscription.status.toLowerCase())) {
    return NextResponse.json(
      { error: "Subscription is not active enough to manage billing." },
      { status: 403 },
    );
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: resolveReturnUrl(request, userId),
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to create billing portal session." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("Failed to create billing portal session.", error);
    return NextResponse.json(
      { error: "Billing portal is temporarily unavailable." },
      { status: 503 },
    );
  }
}
