export const confirmationMessagingContent = {
  successPage: {
    eyebrow: "Payment confirmed",
    title: "ONE THING is scheduled.",
    body:
      "Your plan is active. The next step is a short setup: confirm your timezone, choose up to three categories, and let the system start the next 8:00 AM local delivery.",
    checklist: [
      "Confirm your email address.",
      "Choose 1 to 3 categories.",
      "Select the billing cadence you want to keep after the trial.",
      "Look for the first email at 8:00 AM local time.",
    ],
    primaryCta: {
      label: "Read the daily email format",
      href: "/#email-previews",
    },
    secondaryCta: {
      label: "Back to pricing",
      href: "/#pricing",
    },
  },
  confirmationEmail: {
    subject: "ONE THING is scheduled",
    preheader:
      "Confirm your setup so the first email arrives at 8:00 AM local time.",
    intro:
      "Your subscription is active. Setup should take less than a minute.",
    checklist: [
      "Confirm your email address.",
      "Choose up to three categories.",
      "Set your timezone for 8:00 AM local delivery.",
    ],
    primaryCtaLabel: "Complete setup",
    footer:
      "If you did not start this subscription, reply to this email and support will review it.",
  },
} as const;
