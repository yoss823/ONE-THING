# DOCS

## Repository Findings

- Repository currently contains a minimal `README.md` and no product or engineering docs.
- `README.md` defines the product premise: ONE THING is a subscription product that emails users each morning at 8am with simple, concrete actions that take 5-15 minutes.
- The repo now has two product docs: `docs/one-thing-mvp-brief.md` and `docs/one-thing-v1-technical-plan.md`.
- The repository now includes a runnable Next.js 16 App Router scaffold with Tailwind, lint/build scripts, a landing page, a checkout success page, and placeholder cron/webhook routes.
- The first SQL schema scaffold lives at `db/migrations/0001_one_thing_v1.sql`.
- `.env.example` documents the initial environment contract for Postgres, Stripe, Postmark, and cron auth.
- Git branch is `main` tracking `origin/main`.
- Untracked local folders `.agents/` and `.claude/` exist in the worktree and were left untouched because they are unrelated to this task.
- The repo now uses the six-category launch model: `mental_clarity`, `organization`, `health_energy`, `work_business`, `personal_projects`, and `relationships`.
- The checked-in launch action library lives under `data/action-library/` with separate files for categories, actions, and adaptation rules.
- The initial launch library currently contains 66 actions total, including one fallback action per category and explicit `complexity` / `texture` metadata for selection logic.
- A fresh checkout may need `npm ci` before running `npm run lint` or `npm run build`; both checks passed after installing dependencies from the existing lockfile.

## Changes Made

- Added [`docs/one-thing-mvp-brief.md`](docs/one-thing-mvp-brief.md) as the canonical MVP scope document for ONE THING.
- Defined the target user as busy professionals who want practical self-improvement guidance with minimal decision-making overhead.
- Fixed the core MVP journey around a single paid subscription flow, 1-3 category selection, timezone capture, and one daily 8:00am local-time email.
- Specified the exact email promise: one email per day with exactly one 5-15 minute action per selected category, plus a required fallback action if category content is missing.
- Updated the launch category set to Mental clarity, Organization, Health / Energy, Work / Business, Personal projects, and Relationships.
- Chose the initial monetization assumptions: one `$10/month` plan, 7-day free trial, no free tier, and no annual plan at launch.
- Documented 5 explicit MVP non-goals to prevent scope creep during implementation.
- Added [`docs/one-thing-v1-technical-plan.md`](docs/one-thing-v1-technical-plan.md) with the recommended V1 stack, background-job design, send scheduling model, data model, export strategy, and minimal online surface.
- Added [`docs/launch-action-library-spec.md`](docs/launch-action-library-spec.md) to define the launch content contract, action schema, no-repeat rules, texture variation rules, and silent streak-based complexity shifts.
- Added [`data/action-library/launch-categories.json`](data/action-library/launch-categories.json) as the machine-readable category source of truth for launch.
- Added [`data/action-library/launch-actions.json`](data/action-library/launch-actions.json) with 66 simple, concrete launch actions across the six categories.
- Added [`data/action-library/adaptation-rules.json`](data/action-library/adaptation-rules.json) with exportable rules for exact-repeat cooldowns, texture variation, 3-send pause downshifts, and 5-send completion upshifts.
- Added a minimal Next.js baseline at `app/` so the repo is deployable on Vercel instead of remaining docs-only.
- Added [`app/api/cron/send-daily/route.ts`](app/api/cron/send-daily/route.ts) as the protected placeholder route for the future claim-and-send worker.
- Added [`app/api/webhooks/stripe/route.ts`](app/api/webhooks/stripe/route.ts) as the placeholder Stripe webhook route.
- Added [`app/checkout/success/page.tsx`](app/checkout/success/page.tsx) as the stable post-checkout destination.
- Added [`db/migrations/0001_one_thing_v1.sql`](db/migrations/0001_one_thing_v1.sql) as the first schema scaffold covering users, subscriptions, categories, content, send history, events, and the send queue.
- Updated [`db/migrations/0001_one_thing_v1.sql`](db/migrations/0001_one_thing_v1.sql) so category constraints match the six launch categories and the `actions` table now stores `complexity` and `texture`.
- Added [`.env.example`](.env.example) to define the initial runtime configuration surface.
- Added the NanoCorp analytics snippet to the root layout.
- Verified the launch-library JSON files with `jq`.
- Verified the app and repo state with `npm run lint` and `npm run build`.
