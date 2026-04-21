# DOCS

## Repository Findings

- The repo already contained a deployable Next.js App Router baseline with a landing page, a checkout success page, and placeholder webhook / cron routes.
- The previous planning layer was built around an earlier V1 decision set: plain SQL migrations as the primary schema contract, Postmark for email, and one paid monthly plan.
- The checked-in action library still lives under `data/action-library/` and remains a good fit for the approved V1 because it is already inspectable and exportable.
- The current product docs before this task conflicted with the approved stack and cadence requirements:
  - product brief assumed one paid plan
  - technical plan assumed Postmark instead of Resend
  - scheduler model assumed a single daily flow instead of daily + Monday weekly + monthly clarity replacement
- The public homepage copy in `app/page.tsx` also reflected the older one-price / Postmark direction and needed to be updated to avoid repo-level contradiction.
- The repo had no Prisma schema before this task.
- The repo had no inspectable TypeScript modules for plan mapping, cadence rules, tracking-link path generation, queue claiming, or action selection / adaptation rules before this task.

## Changes Made

- Rewrote `docs/one-thing-v1-technical-plan.md` into a concrete implementation blueprint for the approved V1 stack:
  - Next.js + TypeScript + Tailwind on Vercel
  - Supabase Postgres + Supabase Auth
  - Prisma
  - Stripe Billing
  - Resend
  - Vercel Cron
- The new technical blueprint now covers:
  - folder structure
  - auth approach
  - onboarding flow wiring
  - Stripe mapping for three plans
  - webhook handling
  - daily / weekly / monthly email behavior
  - local-time 8:00 AM queue design
  - tracking-link endpoints for `Done` and `Pause`
  - action selection / adaptation structure
  - minimal account scope
  - export strategy
  - environment checklist
- Updated `docs/one-thing-mvp-brief.md` so the product brief no longer claims a single pricing plan and now reflects the separate Monday weekly email plus monthly clarity replacement behavior.
- Added `prisma/schema.prisma` as the new primary application schema contract.
- Replaced `db/migrations/0001_one_thing_v1.sql` so the SQL scaffold now matches the approved-stack design instead of the earlier single-daily / single-plan model.
- Added `lib/billing/plans.ts` with the concrete three-plan mapping:
  - `monthly`
  - `quarterly`
  - `annual`
- Added `lib/email/cadence.ts` with explicit cadence rules:
  - daily except on monthly clarity day
  - weekly on Monday
  - monthly clarity on day one of the month
  - weekly offset at `+10` minutes to remain separate on Monday mornings
- Added `lib/cron/send-queue.ts` with:
  - queue claim SQL
  - retry timing
  - dedupe key shape
  - future queue planning helpers
- Added `lib/actions/selection.ts` with pure TypeScript selection and adaptation logic for:
  - exact-repeat protection
  - fallback handling
  - texture variation
  - complexity targeting
  - `done` / `pause` streak evolution
- Added `lib/email/tracking-links.ts` so tracking-link path generation is explicit and centralized.
- Updated `.env.example` to reflect the approved runtime contract for Supabase, Prisma direct connections, Stripe three-price mapping, Resend, cron auth, and export auth.
- Updated `app/page.tsx` so the public landing copy now reflects the approved stack and cadence design rather than the deprecated one.
- Added `app/api/webhooks/resend/route.ts` as a placeholder for Resend event ingestion.
- Added `app/api/cron/process-send-queue/route.ts` as the canonical placeholder route matching the new queue design.
- Updated the existing placeholder cron and Stripe webhook routes so their scaffold messaging points at the new blueprint and support files.

## Verification Notes

- The repo still contains the older launch action library and checkout success surface; those remain compatible with the new blueprint and were left in place.
- No live billing products, Supabase configuration, or Resend configuration were changed in external systems during this task.
- `npm ci`, `npm run lint`, and `npm run build` completed successfully after the blueprint update.
- Commit, push, and deployment verification were still pending at the time these notes were written.

## Repository Findings - 2026-04-21 Launch Category Content Task

- `docs/launch-action-library-spec.md` defines the checked-in content contract for launch actions and confirms the core authoring fields needed for email blocks:
  - `title`
  - `instruction`
  - `minutes`
  - `why_it_matters`
- `docs/one-thing-mvp-brief.md` confirms the MVP promise that each daily email action must be completable in 5-15 minutes and usable directly in email without extra explanation.
- The existing library under `data/action-library/launch-actions.json` already covers multiple categories, but the repo did not yet contain a dedicated single-category launch sample file with rationale at the top.
- `organization` is the best fit for a single-category MVP sample because it is broadly relevant to the target user, low-risk, and easy to express as short, concrete tasks without requiring job-specific context.

## Changes Made - 2026-04-21 Launch Category Content Task

- Added `data/action-library/mvp-organization-actions.json`.
- The new file contains:
  - category metadata for `organization`
  - a short launch rationale at the top
  - an explicit list of email-ready fields
  - 30 original organization actions written in the existing content style
  - one fallback action inside the 30-action set
- The new actions were written to stay within the MVP contract:
  - 5-15 minutes each
  - verb-first titles
  - one-sentence instructions
  - short practical reasons
  - non-repetitive physical and digital organization tasks
- Validated the new file with `jq`, including JSON parsing and a final action count of 30.
- `npm ci` was required locally before verification because the checkout did not have `node_modules`, and `npm run build` passed after installing dependencies.
- The content changes were committed and pushed to `main`.
- Deployment verification was attempted once after the required 90-second wait, but `agent-browser` could not open the site because Chrome was not installed locally:
  - `Chrome not found. Run agent-browser install to download Chrome, or use --executable-path.`
  - No second verification attempt was made.

## Repository Findings - 2026-04-21 First Paid Signup Audit

- `DOCS.md` was present and provided accurate history for the earlier blueprint and content tasks.
- The live repo is still a very small Next.js App Router app with these runtime surfaces:
  - `app/page.tsx`
  - `app/layout.tsx`
  - `app/checkout/success/page.tsx`
  - placeholder webhook and cron routes
- The deployed homepage currently presents ONE THING as a scaffold and implementation blueprint, not as a product that can be purchased today.
- The deployed success page exists and is already usable as a stable post-checkout destination.
- The repo contains meaningful planning and support artifacts that are not yet wired into a working product:
  - `docs/one-thing-v1-technical-plan.md`
  - `docs/one-thing-mvp-brief.md`
  - `prisma/schema.prisma`
  - `db/migrations/0001_one_thing_v1.sql`
  - `lib/billing/plans.ts`
  - `lib/email/cadence.ts`
  - `lib/cron/send-queue.ts`
  - `lib/actions/selection.ts`
  - `lib/email/tracking-links.ts`
- The checked-in content inventory is stronger than the product plumbing:
  - `data/action-library/launch-categories.json` contains 6 launch categories
  - `data/action-library/launch-actions.json` contains 66 actions total, 11 per category, with 1 fallback per category
  - `data/action-library/mvp-organization-actions.json` contains 30 organization-only actions and is the best candidate for a narrow first paid beta
- The repo does not currently contain a NanoCorp payment webhook route at `app/api/webhooks/nanocorp/route.ts`, even though NanoCorp forwards completed checkout events there.
- External system checks during this audit showed:
  - `nanocorp products list` returned no products
  - `nanocorp payments link` returned no payment link
  - `nanocorp payments revenue` returned `$0` and `0` payments
  - the connected Postgres database showed no public tables during a quick inspection
- The fastest path to the first paid signup is narrower than the existing blueprint:
  - sell one offer only
  - use NanoCorp hosted checkout instead of building direct Stripe flows first
  - fulfill early buyers manually with the existing organization content

## Changes Made - 2026-04-21 First Paid Signup Audit

- Added `docs/first-paid-signup-audit-2026-04-21.md`.
- The audit memo documents:
  - current shipped app state
  - the major gaps blocking revenue
  - the single fastest path to first paid signup
  - a focused CEO task list for what to do next
- `npm ci` was required locally because `node_modules` was absent in the checkout at verification time.
- `npm run build` passed after dependencies were restored.

## Repository Findings - 2026-04-21 Landing Page And Template Content Task

- `DOCS.md` was up to date enough to avoid re-discovering the earlier blueprint work and confirmed that the homepage was still presenting ONE THING as a scaffold instead of as a customer-facing product.
- The live app surface for this task was still very small:
  - `app/page.tsx` contained hardcoded scaffold copy
  - `app/checkout/success/page.tsx` contained placeholder post-checkout messaging
  - there was no reusable content directory for marketing, onboarding, confirmation, or email copy
- `lib/billing/plans.ts` already contained the canonical three-plan pricing values, so the safest approach for pricing presentation was to render from that source instead of introducing a second pricing constant.
- The existing design system in `app/layout.tsx` and `app/globals.css` already established the visual direction:
  - Fraunces for display
  - IBM Plex Sans for body
  - warm paper / ink color palette
- The repo did not contain exportable email template files before this task.

## Changes Made - 2026-04-21 Landing Page And Template Content Task

- Added a reusable content source under `content/one-thing/`:
  - `marketing.ts`
  - `onboarding.ts`
  - `confirmation.ts`
  - `emails.ts`
- Added exportable email template files under `content/one-thing/email-templates/`:
  - `confirmation.html`
  - `confirmation.txt`
  - `daily.html`
  - `daily.txt`
  - `weekly-summary.html`
  - `weekly-summary.txt`
  - `monthly-clarity-check.html`
  - `monthly-clarity-check.txt`
- Replaced the scaffold homepage in `app/page.tsx` with a production-style marketing page that now includes:
  - customer-facing hero copy
  - operational promise points
  - a 45-second onboarding sequence
  - preview cards for the daily, weekly, and monthly emails
  - three-plan pricing presentation rendered from `lib/billing/plans.ts`
  - CTA copy tied to pricing and onboarding sections
  - FAQ and confirmation-message preview blocks
- Replaced the placeholder success page in `app/checkout/success/page.tsx` with calmer confirmation messaging driven by the new content module.
- Updated `app/layout.tsx` metadata description so the browser / crawler description now matches the shipped product copy.

## Verification Notes - 2026-04-21 Landing Page And Template Content Task

- `npm ci` was required because `node_modules` was absent in the checkout.
- `npm run lint` passed after dependencies were installed.
- `npm run build` passed after the landing-page and template changes.
- The content and page changes were committed on `main` and pushed to `origin/main`.
- After the required 90-second wait, one deployment verification attempt was made with `agent-browser open https://onestep.nanocorp.app`.
- The deployment verification attempt could not complete because the local environment does not have a Chrome binary available for `agent-browser`:
  - `Chrome not found. Run agent-browser install to download Chrome, or use --executable-path.`
- No second deployment verification attempt was made.

## Repository Findings - 2026-04-21 Social Media Setup Task

- `DOCS.md` was present and materially reduced rediscovery work for this task.
- The repo already has a stable split between product documentation in `docs/` and reusable brand/content assets in `content/one-thing/`.
- The existing ONE THING voice in the repo is calm, practical, and low-hype:
  - short sentences
  - clarity over intensity
  - operational specifics over broad inspiration
- `content/one-thing/marketing.ts` is the clearest source for on-brand positioning:
  - "one email. one next step."
  - reduced decision friction
  - useful before the day gets noisy
- The current repo did not yet contain any dedicated social-media setup or publishing assets for X, LinkedIn, or Instagram.

## Changes Made - 2026-04-21 Social Media Setup Task

- Added `docs/one-thing-social-media-setup-plan.md`.
- The setup plan includes:
  - channel role definitions
  - primary and fallback handle recommendations
  - profile asset guidance
  - profile copy for X, LinkedIn, and Instagram
  - hashtag and posting rhythm guidance
  - credential handoff checklist
  - recommended setup order
  - pinned / introductory post guidance
- Added `content/one-thing/social/one-thing-14-day-calendar.md`.
- The readable calendar includes 14 consecutive days of coordinated launch copy with:
  - concrete dates from April 22, 2026 through May 5, 2026
  - one theme per day
  - separate X, LinkedIn, and Instagram versions for each day
  - calm, text-first copy with lightly adapted platform tone
- Added `content/one-thing/social/one-thing-14-day-calendar.csv`.
- The CSV mirrors the 14-day calendar in a scheduler-friendly format with per-platform posting windows and full post copy.

## Verification Notes - 2026-04-21 Social Media Setup Task

- Reviewed the new files directly in the workspace after creation.
- Ran `git diff --check` and it passed.
- No application code changed, so `npm run build` and deployment verification were not necessary for this task.
- The task is documentation-only, so no runtime verification step was required before commit and push.
