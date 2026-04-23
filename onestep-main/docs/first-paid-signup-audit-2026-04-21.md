# ONE THING Audit: Fastest Path To First Paid Signup

Date: 2026-04-21

## Bottom Line

The repo is a good V1 blueprint, not a working paid product. The fastest path to a first paid signup is to stop building the full direct-Stripe/Supabase app for now and sell one narrow paid beta on top of what already exists.

The single fastest path is:

1. Create one NanoCorp product for a single offer: `ONE THING: Organization Beta`.
2. Replace the current homepage scaffold CTA with a real buy button that points to the NanoCorp hosted checkout link.
3. Use the existing success page as the post-purchase confirmation page.
4. Fulfill the first few customers manually using the checked-in organization action content instead of waiting for auth, onboarding, Stripe sync, DB migrations, cron, and Resend automation.

If the goal is the first paid signup, this is materially faster than finishing the planned app stack.

## Current App State

What already exists:

- A deployed Next.js App Router site with a styled landing page and a checkout success page.
- Analytics snippet installed in `app/layout.tsx`.
- A substantial planning layer:
  - `docs/one-thing-v1-technical-plan.md`
  - `docs/one-thing-mvp-brief.md`
  - Prisma schema and SQL migration scaffold
  - helper modules for billing plan mapping, cadence, queue logic, tracking links, and action selection
- Launch content inventory already checked into the repo:
  - 6 launch categories in `data/action-library/launch-categories.json`
  - 66 launch actions in `data/action-library/launch-actions.json`
  - 30 additional organization-only sample actions in `data/action-library/mvp-organization-actions.json`
- A live success page at `/checkout/success`, which is already suitable as a stable post-payment redirect target.

What is currently only scaffolded or missing:

- No real purchase path on the homepage. The live site still presents itself as a V1 scaffold, not a product for sale.
- No NanoCorp product exists yet.
- No NanoCorp payment link exists yet.
- Revenue is still `$0` with `0` payments.
- No real onboarding flow exists.
- No auth flow exists.
- No implemented send worker exists.
- No implemented outbound email system exists.
- No implemented webhook that matches NanoCorp's documented payment webhook path: `/api/webhooks/nanocorp`.
- The connected Postgres database appears empty from the app perspective; no public tables were present during this audit.

## Major Gaps Blocking Revenue

### 1. No checkout entry point

This is the biggest blocker. The customer cannot currently buy anything.

### 2. The homepage sells architecture instead of outcome

The live page talks about Prisma, queue logic, and V1 decisions. That is useful for builders, but weak for a buyer. The page does not currently answer:

- what exactly am I buying
- who is it for
- what happens after I pay
- why should I trust this enough to try it today

### 3. The codebase is optimized for the eventual system, not the first sale

The repo has plans for Supabase Auth, direct Stripe Billing, Prisma-backed state, cron, and Resend. Almost none of that is required to get the first customer to pay.

### 4. The platform's shortest monetization path is not wired

NanoCorp already provides:

- product creation
- hosted checkout
- payment link
- payment webhook forwarding

The repo is currently oriented around direct Stripe integration instead of the platform's fastest path.

## Fastest Path To One First Paid Signup

Sell one thing only:

`ONE THING: Organization Beta`

Why this is the fastest path:

- the repo already has organization-specific launch content
- the product promise is easiest to explain in organization terms
- fulfillment can be manual at first
- it avoids building multi-category onboarding before demand is proven
- it avoids blocking on database, auth, cron, and Resend work

Recommended offer:

- one plan only for now: `$12/month`
- promise: one practical organization task each weekday morning by email
- position it as a founding beta with limited spots

Recommended fulfillment for the first customers:

- use Stripe-hosted NanoCorp checkout to collect payment and buyer email
- redirect to `/checkout/success`
- send a manual welcome email asking for timezone
- send the first sequence manually from `data/action-library/mvp-organization-actions.json`

This is not scalable, but it is the shortest honest path to revenue.

## Priority Order

1. Create one NanoCorp product and payment link.
2. Turn the homepage into a real sales page for one offer with one CTA.
3. Update `/checkout/success` so it sets expectations for the beta and asks the buyer to reply with timezone if needed.
4. Add `app/api/webhooks/nanocorp/route.ts` only if you want immediate internal payment logging.
5. Delay Supabase Auth, Prisma migrations, cron automation, Resend integration, and multi-plan checkout until after the first paid signup.

## CEO Follow-Up Tasks

Create these tasks next, in this order:

1. Launch one paid NanoCorp product for `ONE THING: Organization Beta` at `$12/month`.
2. Rewrite the homepage to sell the beta and link directly to the NanoCorp checkout URL.
3. Update the success page for manual beta onboarding and timezone collection.
4. Add a minimal `app/api/webhooks/nanocorp/route.ts` route to log completed payments.
5. Define the manual fulfillment SOP for the first 5 customers using the organization action library.
6. Only after the first paid signup, decide whether to build:
   - automated onboarding
   - automated daily sends
   - account management
   - multi-category support
   - direct Stripe or Supabase-backed subscription state
