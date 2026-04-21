import Link from "next/link";
import Stripe from "stripe";

type WelcomePageProps = {
  searchParams: Promise<{
    session_id?: string | string[];
  }>;
};

type WelcomeDetails = {
  customerEmail: string;
  categories: string[];
  energyLevel: string;
  availableMinutes: string;
};

const ERROR_MESSAGE = "Something went wrong. Please contact support.";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey);
}

function readSingleParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0].trim();
  }

  return null;
}

function parseCategories(rawCategories: string | null | undefined): string[] {
  if (!rawCategories) {
    throw new Error("Checkout session is missing metadata.categories.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawCategories) as unknown;
  } catch {
    throw new Error("Checkout session metadata.categories is invalid JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Checkout session metadata.categories is not an array.");
  }

  const categories = parsed
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  if (categories.length === 0) {
    throw new Error("Checkout session metadata.categories is empty.");
  }

  return categories;
}

async function getWelcomeDetails(sessionId: string): Promise<WelcomeDetails> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const customerEmail =
    session.customer_email?.trim() ?? session.customer_details?.email?.trim();
  const categories = parseCategories(session.metadata?.categories);
  const energyLevel = session.metadata?.energyLevel?.trim();
  const availableMinutes = session.metadata?.availableMinutes?.trim();

  if (!customerEmail || !energyLevel || !availableMinutes) {
    throw new Error("Checkout session is missing confirmation details.");
  }

  return {
    customerEmail,
    categories,
    energyLevel,
    availableMinutes,
  };
}

function ErrorState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-[30rem]">
        <div className="rounded-[2rem] border border-[rgba(16,34,23,0.1)] bg-white p-8 sm:p-10">
          <p className="text-base leading-8 text-[var(--foreground-soft)]">{ERROR_MESSAGE}</p>
        </div>
      </div>
    </main>
  );
}

export const runtime = "nodejs";

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const params = await searchParams;
  const sessionId = readSingleParam(params.session_id);

  if (!sessionId) {
    return <ErrorState />;
  }

  const welcomeDetails = await getWelcomeDetails(sessionId).catch((error) => {
    console.error("Failed to render welcome page.", error);
    return null;
  });

  if (!welcomeDetails) {
    return <ErrorState />;
  }

  const { customerEmail, categories, energyLevel, availableMinutes } =
    welcomeDetails;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-[30rem]">
        <section className="rounded-[2rem] border border-[rgba(16,34,23,0.1)] bg-white p-8 sm:p-10">
          <h1
            className="font-[var(--font-display)] text-4xl leading-none text-[var(--foreground)] sm:text-5xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            You&apos;re in.
          </h1>

          <p className="mt-6 whitespace-pre-line text-base leading-8 text-[var(--foreground-soft)]">
            {"Your first email arrives tomorrow at 8:00 AM.\nOne thing. That's it.\n\nWe'll track what you complete and quietly adjust over time.\nNo login needed. Just open the email."}
          </p>

          <div className="mt-10 rounded-[1.5rem] border border-[rgba(16,34,23,0.08)] bg-[rgba(255,249,240,0.52)] px-5 py-5 text-sm leading-7 text-[var(--foreground-soft)] sm:px-6">
            <p>Your categories: {categories.join(", ")}</p>
            <p>Energy level: {energyLevel}</p>
            <p>Time available: {availableMinutes} minutes</p>
          </div>

          <p className="mt-6 text-sm leading-7 text-[var(--foreground-soft)]">
            Confirmation sent to: {customerEmail}
          </p>

          <p className="mt-10 text-sm text-[rgba(16,34,23,0.58)]">
            <Link
              href="/account"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Manage your subscription →
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
