import Link from "next/link";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WelcomePageProps = {
  searchParams?: Promise<{
    session_id?: string | string[];
  }>;
};

type WelcomeDetails = {
  availableMinutes: number;
  categories: string[];
  customerEmail: string;
  energyLevel: string;
};

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey);
}

function resolveSessionId(sessionId: string | string[] | undefined): string | null {
  if (typeof sessionId === "string" && sessionId.trim()) {
    return sessionId.trim();
  }

  if (Array.isArray(sessionId)) {
    const firstValue = sessionId.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );

    return firstValue?.trim() ?? null;
  }

  return null;
}

function parseCategories(rawCategories: string | undefined): string[] {
  if (!rawCategories) {
    throw new Error("Missing metadata.categories.");
  }

  const parsed = JSON.parse(rawCategories) as unknown;

  if (!Array.isArray(parsed) || parsed.length < 1) {
    throw new Error("metadata.categories must be a non-empty array.");
  }

  const categories = parsed.map((category) => {
    if (typeof category !== "string" || !category.trim()) {
      throw new Error("metadata.categories must contain non-empty strings.");
    }

    return category.trim();
  });

  return categories;
}

function parseAvailableMinutes(rawAvailableMinutes: string | undefined): number {
  if (!rawAvailableMinutes) {
    throw new Error("Missing metadata.availableMinutes.");
  }

  const availableMinutes = Number.parseInt(rawAvailableMinutes, 10);

  if (!Number.isInteger(availableMinutes) || availableMinutes <= 0) {
    throw new Error("metadata.availableMinutes must be a positive integer.");
  }

  return availableMinutes;
}

async function getWelcomeDetails(sessionId: string): Promise<WelcomeDetails | null> {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerEmail =
      session.customer_email?.trim() ?? session.customer_details?.email?.trim();
    const energyLevel = session.metadata?.energyLevel?.trim();

    if (!customerEmail || !energyLevel) {
      throw new Error("Missing checkout session confirmation data.");
    }

    return {
      availableMinutes: parseAvailableMinutes(session.metadata?.availableMinutes),
      categories: parseCategories(session.metadata?.categories),
      customerEmail,
      energyLevel,
    };
  } catch (error) {
    console.error("Failed to render welcome page.", error);
    return null;
  }
}

function ErrorMessage() {
  return (
    <main className="min-h-screen bg-white px-6 py-24 text-[#111]">
      <div className="mx-auto flex max-w-[480px] items-center justify-center">
        <p className="text-sm text-[#3d3d3d]">
          Something went wrong. Please contact support.
        </p>
      </div>
    </main>
  );
}

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolveSessionId(resolvedSearchParams?.session_id);

  if (!sessionId) {
    return <ErrorMessage />;
  }

  const details = await getWelcomeDetails(sessionId);

  if (!details) {
    return <ErrorMessage />;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-[#111] sm:py-24">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[480px] items-center sm:min-h-[calc(100vh-12rem)]">
        <div className="w-full">
          <div className="h-px w-12 bg-[#d9d9d9]" />
          <h1
            className="mt-8 font-[var(--font-display)] text-5xl leading-none tracking-[-0.03em] text-[#111] sm:text-6xl"
          >
            You&apos;re in.
          </h1>
          <p className="mt-8 whitespace-pre-line text-base leading-8 text-[#3d3d3d]">
            {"Your first email arrives tomorrow at 8:00 AM.\nOne thing. That's it.\n\nWe'll track what you complete and quietly adjust over time.\nNo login needed. Just open the email."}
          </p>

          <div className="mt-10 rounded-3xl border border-[#e7e7e7] bg-[#fafafa] px-5 py-5">
            <p className="text-sm leading-7 text-[#202020]">
              Your categories: {details.categories.join(", ")}
            </p>
            <p className="mt-2 text-sm leading-7 text-[#202020]">
              Energy level: {details.energyLevel}
            </p>
            <p className="mt-2 text-sm leading-7 text-[#202020]">
              Time available: {details.availableMinutes} minutes
            </p>
          </div>

          <p className="mt-8 text-sm leading-7 text-[#202020]">
            Confirmation sent to: {details.customerEmail}
          </p>

          <Link
            href="/account"
            className="mt-12 inline-flex text-sm text-[#5c5c5c] transition-colors hover:text-[#111]"
          >
            Manage your subscription →
          </Link>
        </div>
      </section>
    </main>
  );
}
