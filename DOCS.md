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

## Changes Made

- Added [`docs/one-thing-mvp-brief.md`](docs/one-thing-mvp-brief.md) as the canonical MVP scope document for ONE THING.
- Defined the target user as busy professionals who want practical self-improvement guidance with minimal decision-making overhead.
- Fixed the core MVP journey around a single paid subscription flow, 1-3 category selection, timezone capture, and one daily 8:00am local-time email.
- Specified the exact email promise: one email per day with exactly one 5-15 minute action per selected category, plus a required fallback action if category content is missing.
- Chose the initial category set: Fitness, Nutrition, Focus, Relationships, and Home.
- Chose the initial monetization assumptions: one `$10/month` plan, 7-day free trial, no free tier, and no annual plan at launch.
- Documented 5 explicit MVP non-goals to prevent scope creep during implementation.
- Added [`docs/one-thing-v1-technical-plan.md`](docs/one-thing-v1-technical-plan.md) with the recommended V1 stack, background-job design, send scheduling model, data model, export strategy, and minimal online surface.
- Added a minimal Next.js baseline at `app/` so the repo is deployable on Vercel instead of remaining docs-only.
- Added [`app/api/cron/send-daily/route.ts`](app/api/cron/send-daily/route.ts) as the protected placeholder route for the future claim-and-send worker.
- Added [`app/api/webhooks/stripe/route.ts`](app/api/webhooks/stripe/route.ts) as the placeholder Stripe webhook route.
- Added [`app/checkout/success/page.tsx`](app/checkout/success/page.tsx) as the stable post-checkout destination.
- Added [`db/migrations/0001_one_thing_v1.sql`](db/migrations/0001_one_thing_v1.sql) as the first schema scaffold covering users, subscriptions, categories, content, send history, events, and the send queue.
- Added [`.env.example`](.env.example) to define the initial runtime configuration surface.
- Added the NanoCorp analytics snippet to the root layout.
- Verified the scaffold with `npm run lint` and `npm run build`.
