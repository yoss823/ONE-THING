export const emailPreviewContent = [
  {
    key: "daily",
    eyebrow: "Daily email",
    title: "One short email each morning",
    sendTime: "Daily at 8:00 AM local time",
    subject: "ONE THING for Tuesday, April 21",
    preheader: "Three short actions. Pick one and begin.",
    intro:
      "Morning. These are today's next actions for the categories you selected. Each should fit inside 5-15 minutes.",
    sections: [
      {
        category: "Organization",
        title: "Clear the top drawer",
        instruction:
          "Remove everything from the top desk drawer, return only what you use weekly, and move the rest out.",
        minutes: "8 minutes",
        why: "Visible storage tends to become a default dumping point.",
      },
      {
        category: "Work / Business",
        title: "Close one open loop",
        instruction:
          "Reply to the oldest message that requires a clear answer and archive the thread when it is done.",
        minutes: "10 minutes",
        why: "Open loops create more background pressure than completed ones.",
      },
      {
        category: "Health / Energy",
        title: "Prepare tomorrow's lunch",
        instruction:
          "Choose one simple lunch and put the ingredients or container in one visible place tonight.",
        minutes: "7 minutes",
        why: "Reducing one decision early in the day makes follow-through easier.",
      },
    ],
    footer:
      "Use Done when you finish one action. Use Pause if a category needs to stop for a while.",
  },
  {
    key: "weekly",
    eyebrow: "Weekly summary",
    title: "A separate Monday check-in",
    sendTime: "Monday at 8:10 AM local time",
    subject: "Weekly summary: what moved and what needs less friction",
    preheader: "A short recap, then one adjustment for the coming week.",
    intro:
      "This summary is meant to stay short. It shows what you completed, what stayed idle, and what to keep or change next week.",
    sections: [
      {
        category: "Delivered",
        title: "5 daily emails sent",
        instruction:
          "Your account received a full week of daily emails with no skipped days.",
        minutes: "Review only",
        why: "Reliability matters more than intensity.",
      },
      {
        category: "Completed",
        title: "2 actions marked done",
        instruction:
          "Organization was completed twice. Work / Business was viewed but not marked done.",
        minutes: "Review only",
        why: "Completion data helps the next actions stay realistic.",
      },
      {
        category: "Adjustment",
        title: "Keep Organization, pause Work / Business",
        instruction:
          "If one category keeps stalling, pause it for a week and leave room for the others.",
        minutes: "2 minutes",
        why: "A narrower scope usually improves follow-through.",
      },
    ],
    footer:
      "You can adjust categories or billing from account settings at any time.",
  },
  {
    key: "monthly",
    eyebrow: "Monthly clarity check",
    title: "A reset on the first day of the month",
    sendTime: "First day of the month at 8:00 AM local time",
    subject: "Monthly clarity check for May",
    preheader: "Review what should continue, pause, or return this month.",
    intro:
      "The clarity check replaces the daily email on the first day of the month. It is there to keep the system useful instead of automatic.",
    sections: [
      {
        category: "Keep",
        title: "What is still useful?",
        instruction:
          "Name the category that has been easiest to act on and keep it active for another month.",
        minutes: "3 minutes",
        why: "Reliable categories deserve to stay in place.",
      },
      {
        category: "Reduce",
        title: "What should pause?",
        instruction:
          "Identify one category that has been ignored or irrelevant and remove it for now.",
        minutes: "3 minutes",
        why: "Removing stale obligations keeps the product credible.",
      },
      {
        category: "Resume",
        title: "What needs to return?",
        instruction:
          "If a paused category matters again, add it back before tomorrow's daily email is scheduled.",
        minutes: "4 minutes",
        why: "The system should follow current priorities, not old intentions.",
      },
    ],
    footer:
      "After the monthly clarity check, daily delivery resumes on the next scheduled day.",
  },
] as const;
