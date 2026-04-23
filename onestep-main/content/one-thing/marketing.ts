import type { PlanKey } from "@/lib/billing/plans";

export const landingPageContent = {
  hero: {
    eyebrow: "One email. One next step.",
    title: "ONE THING gives you a single clear action before the day gets noisy.",
    body:
      "Each morning at 8:00 AM local time, ONE THING sends a short email with the next useful action for the categories you selected. It is built for people who do better with a defined next move than with more options.",
    primaryCta: {
      label: "Review plans",
      href: "#pricing",
    },
    secondaryCta: {
      label: "See the email format",
      href: "#email-previews",
    },
  },
  promisePoints: [
    {
      title: "8:00 AM local time",
      body: "Delivery is based on your timezone, so the email arrives before the rest of your schedule takes over.",
    },
    {
      title: "1 to 3 categories",
      body: "You choose a narrow focus. ONE THING sends one action per selected category, not a list of options.",
    },
    {
      title: "5 to 15 minutes",
      body: "Every action is short enough to start immediately and concrete enough to finish without extra planning.",
    },
  ],
  operationalNotes: [
    "Daily email every morning.",
    "Separate weekly summary every Monday.",
    "Monthly clarity check on the first day of the month instead of that day's daily email.",
    "Done and Pause links are available directly inside the email.",
  ],
  whyItWorks: {
    eyebrow: "Why people use it",
    title: "The product removes one decision, not your whole life.",
    body:
      "ONE THING is useful when the problem is not motivation but decision friction. The value is a short, specific prompt that can be acted on without opening an app, building a system, or picking from a menu.",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Three category tiers. One monthly cadence.",
    body:
      "Choose how many categories you want ONE THING to cover. Every tier bills monthly and includes the daily email, Monday summary, and monthly clarity check.",
    footnote: "Upgrade when you want more coverage. Keep the daily routine the same.",
  },
  faq: [
    {
      question: "What arrives each day?",
      answer:
        "A short email with one action for each category you selected. Each action includes the task, expected time, and a short reason it matters.",
    },
    {
      question: "Can I change categories later?",
      answer:
        "Yes. Category choices are part of onboarding and can be adjusted later from account settings.",
    },
    {
      question: "Is there a free plan?",
      answer:
        "No. The product is paid, with monthly billing based on how many categories you choose.",
    },
  ],
} as const;

export const pricingCardCopy: Record<
  PlanKey,
  {
    label: string;
    billingNote: string;
    comparisonNote: string;
    ctaLabel: string;
    href: string;
    featured?: boolean;
  }
> = {
  oneCategory: {
    label: "1 category",
    billingNote: "The narrowest starting point.",
    comparisonNote: "Best if one area needs consistent attention first.",
    ctaLabel: "Choose 1 category in onboarding",
    href: "#onboarding",
  },
  twoCategories: {
    label: "2 categories",
    billingNote: "A balanced default for people juggling two fronts.",
    comparisonNote: "Covers more of your day without turning into a full checklist.",
    ctaLabel: "Choose 2 categories in onboarding",
    href: "#onboarding",
    featured: true,
  },
  threeCategories: {
    label: "3 categories",
    billingNote: "The fullest version of the product.",
    comparisonNote: "Best if you want the routine to cover work, life, and one personal track together.",
    ctaLabel: "Choose 3 categories in onboarding",
    href: "#onboarding",
  },
};
