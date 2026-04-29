import { NextResponse } from "next/server";
import Stripe from "stripe";

import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";
import { normalizeSiteLocale } from "@/lib/i18n/locale";

export const runtime = "nodejs";

type CheckoutRequestBody = {
  priceId?: string;
  email?: string;
  categories?: string[];
  energyLevel?: string;
  availableMinutes?: number;
  timezone?: string;
  /** en | fr | es — stored for emails and welcome message; Stripe Checkout UI follows this when possible. */
  locale?: string;
};

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

  const { priceId, email, categories, energyLevel, availableMinutes, timezone, locale: rawLocale } =
    body;
  const checkoutLocale = normalizeSiteLocale(rawLocale);

  if (!priceId || typeof priceId !== "string") {
    return NextResponse.json({ error: "priceId is required." }, { status: 400 });
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    return NextResponse.json({ error: "categories is required." }, { status: 400 });
  }

  if (!energyLevel || typeof energyLevel !== "string") {
    return NextResponse.json({ error: "energyLevel is required." }, { status: 400 });
  }

  if (typeof availableMinutes !== "number" || availableMinutes <= 0) {
    return NextResponse.json({ error: "availableMinutes must be a positive number." }, { status: 400 });
  }

  if (!timezone || typeof timezone !== "string") {
    return NextResponse.json({ error: "timezone is required." }, { status: 400 });
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    return NextResponse.json({ error: "timezone is invalid." }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Checkout is not configured." }, { status: 503 });
  }

  const baseUrl = tryResolvePublicBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: "Base URL is not configured." }, { status: 503 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2023-10-16" as const,
  });

  const metadata = {
    categories: JSON.stringify(categories),
    energyLevel,
    availableMinutes: String(availableMinutes),
    timezone,
    locale: checkoutLocale,
  };

  const stripeCheckoutLocale: Stripe.Checkout.SessionCreateParams.Locale =
    checkoutLocale === "fr" ? "fr" : checkoutLocale === "es" ? "es" : "en";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/welcome?session_id={CHECKOUT_SESSION_ID}&lang=${checkoutLocale}`,
      cancel_url: `${baseUrl}/onboarding`,
      locale: stripeCheckoutLocale,
      metadata,
      subscription_data: { metadata },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create Stripe checkout session.", error);
    return NextResponse.json({ error: "Unable to create checkout session." }, { status: 500 });
  }
}
