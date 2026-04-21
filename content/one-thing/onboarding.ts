export const onboardingFlowContent = {
  eyebrow: "45-second onboarding",
  title: "The setup is short by design.",
  body:
    "The onboarding flow collects only the details needed to start delivery and keep the product narrow. The entire sequence is designed to fit inside about 45 seconds.",
  totalSeconds: 45,
  steps: [
    {
      step: "01",
      label: "Email",
      seconds: 8,
      title: "Where should ONE THING arrive?",
      body: "Use the inbox you check in the morning.",
      fields: ["Email address"],
      cta: "Continue",
    },
    {
      step: "02",
      label: "Timezone",
      seconds: 7,
      title: "What local time should delivery follow?",
      body: "Timezone is used only to schedule the 8:00 AM send correctly.",
      fields: ["Timezone"],
      cta: "Continue",
    },
    {
      step: "03",
      label: "Categories",
      seconds: 18,
      title: "Choose 1 to 3 categories.",
      body: "This keeps the email focused and prevents unnecessary volume.",
      fields: [
        "Mental clarity",
        "Organization",
        "Health / Energy",
        "Work / Business",
        "Personal projects",
        "Relationships",
      ],
      cta: "Save categories",
    },
    {
      step: "04",
      label: "Plan",
      seconds: 12,
      title: "Select a billing cadence.",
      body: "All plans include the same product. The choice only changes billing interval.",
      fields: ["Monthly", "Quarterly", "Annual"],
      cta: "Start 7-day trial",
    },
  ],
  completion: {
    title: "Confirmation screen",
    body:
      "You're set. Your first email arrives at 8:00 AM local time, with the Monday summary and monthly clarity check added automatically by the schedule.",
    primaryCta: "Open account",
    secondaryCta: "Read a sample email",
  },
} as const;
