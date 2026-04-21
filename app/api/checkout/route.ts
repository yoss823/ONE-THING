import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getPlanForCategoryCount, resolvePlanFromStripePriceId } from "@/lib/billing/plans";

export const runtime = "nodejs";

type CheckoutRequestBody = {
  priceId?: string;
  email?: string;
  categories?: string[];
  energyLevel?: string;
  availableMinutes?: number;
};

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { priceId, email, categories, energyLevel, availableMinutes } = body;

  if (!priceId || typeof priceId !== "string") {
    return NextResponse.json({ error: "priceId is required." }, { status: 400 });
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (
    !Array.isArray(categories) ||
    categories.length < 1 ||
    categories.length > 3 ||
    categories.some((category) => typeof category !== "string" || !category.trim())
  ) {
    return NextResponse.json(
      { error: "categories must contain 1 to 3 non-empty strings." },
      { status: 400 },
    );
  }

  if (!energyLevel || typeof energyLevel !== "string") {
    return NextResponse.json(
      { error: "energyLevel is required." },
      { status: 400 },
    );
  }

  if (
    typeof availableMinutes !== "number" ||
    !Number.isFinite(availableMinutes) ||
    availableMinutes <= 0
  ) {
    return NextResponse.json(
      { error: "availableMinutes must be a positive number." },
      { status: 400 },
    );
  }

  const planKey = resolvePlanFromStripePriceId(priceId);
  const planMatch = getPlanForCategoryCount(categories.length);

  if (!planKey || !planMatch) {
    return NextResponse.json(
      { error: "Unsupported Stripe price." },
      { status: 400 },
    );
  }

  const [, plan] = planMatch;

  if (plan.priceId !== priceId) {
    return NextResponse.json(
      { error: "priceId does not match the selected category count." },
      { status: 400 },
    );
  }

  const metadata = {
    categories: JSON.stringify(categories),
    energyLevel,
    availableMinutes: String(availableMinutes),
  };

  try {
    const stripe = getStripeClient();
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/onboarding`,
      metadata,
      subscription_data: {
        metadata,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create Stripe checkout session.", error);

    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 },
    );
  }
}
