# Deployment Audit

Date: 2026-04-23
Task: `Verify live site works end-to-end: landing -> onboarding -> checkout redirect`

## Live URL Confirmed

- Production URL remains `https://onestep.nanocorp.app`.
- `docs/deployment-audit.md` and the live browser session both matched that URL.

## Live Browser Verification

- Landing page loaded successfully at `/` with title `ONE THING`.
- The hero headline rendered as `ONE THING — Stop deciding. Start doing.`.
- Pricing rendered the expected plan prices:
  - `$4.99/month`
  - `$7.99/month`
  - `$9.99/month`
- GuidedChoice pills rendered and were clickable.
- The demo email card rendered with the expected sample copy:
  - `Your one thing for Monday, May 5`
  - `HEALTH / ENERGY`
  - `Do 10 slow deep breaths before opening your laptop.`
- The primary CTA was visible but its label text rendered dark-on-dark in the live browser, which made the button low-contrast and hard to read.

## Onboarding Flow Result

- Clicked the primary CTA from the landing page and reached `/onboarding`.
- Step 1 worked:
  - selected `Mental clarity`
  - selected `Organization`
  - UI updated to `2 selected → $7.99/month`
- Step 2 worked:
  - selected energy level `Low`
- Step 3 worked:
  - selected `10 minutes`
- Step 4 worked:
  - entered `test@example.com`
  - clicked `Continue to payment`

## Checkout Result

- The browser stayed on `/onboarding` and showed the inline error:
  - `Checkout is not configured.`
- No browser console output or page errors were reported by `agent-browser`.
- A direct live API verification against `POST https://onestep.nanocorp.app/api/checkout` returned:
  - status `503`
  - body `{"error":"Checkout is not configured."}`

## Root Cause

- `nanocorp vercel env list` still shows no `STRIPE_SECRET_KEY` in Vercel.
- The checked-in `app/api/checkout/route.ts` explicitly returns `503` with `Checkout is not configured.` when `process.env.STRIPE_SECRET_KEY` is missing.
- Result: the frontend flow is intact through onboarding, but production cannot redirect to Stripe Checkout until the founder sets `STRIPE_SECRET_KEY` in Vercel.

## Fixes Applied

- Removed the global `a { color: inherit; }` rule from `app/globals.css`.
- That rule was overriding Tailwind link color utilities and causing the landing-page CTA text to render dark on a black background.
- This is a frontend-only fix; it does not resolve the production checkout blocker.

## Post-Push Verification

- Pushed commit `735c82a` to `main`.
- Waited exactly 90 seconds, then ran one live browser verification pass against `https://onestep.nanocorp.app`.
- The CTA contrast fix is live:
  - computed CTA text color: `rgb(255, 255, 255)`
  - computed CTA background: near-black
  - screenshot confirmed the label is now readable
- Re-ran the onboarding flow after deploy:
  - landing -> onboarding: works
  - step 1 2-category selection -> `$7.99/month`: works
  - step 2 energy selection: works
  - step 3 `10 minutes`: works
  - step 4 email entry: works
- Final checkout result after deploy is unchanged:
  - browser remained on `/onboarding`
  - inline error still reads `Checkout is not configured.`
  - no browser console output
  - no browser page errors

Date: 2026-04-22
Deployment URL: `https://onestep.nanocorp.app`

## What Worked In The Live Deployment Before Fixes

- `/` returned `200` and rendered the expected hero headline: `ONE THING — Stop deciding. Start doing.`
- Landing-page pricing rendered `$4.99`, `$7.99`, and `$9.99`.
- The landing-page CTA linked to `/onboarding`.
- `/onboarding` loaded successfully and rendered the first step.
- `POST /api/checkout` returned `400` for an empty request body instead of `500`.

## What Was Broken In The Live Deployment Before Fixes

- `GET /api/track` returned `404`, even though the route exists in the repo and should redirect or return `400`.
- `POST /api/webhooks/stripe` returned `503` on an empty request instead of the expected `400` missing-signature response.
- `POST /api/checkout` returned `500` for a valid onboarding payload because Stripe checkout was not configured in Vercel.
- The deployed behavior did not match `main`, which indicated the live site was still on an older successful deployment.

## Fixes Applied

- Added a `prebuild` Prisma generation step in `package.json`:
  - `DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}" prisma generate`
- Updated `app/api/checkout/route.ts` so missing checkout configuration returns a clear `503` error instead of a generic `500`.
- Added `DIRECT_URL` to the Vercel project using the current database connection value so Prisma's expected env contract is restored for `production` and `preview`.

## Verified Locally After Fixes

- `npm run build` passed.
- `npm run lint` passed.
- Local production server checks passed:
  - `GET /api/track` returned `307` redirect.
  - `POST /api/checkout` returned `400` for an empty body.
  - `POST /api/webhooks/stripe` returned `400` for a missing signature.
- Local browser validation of `/onboarding` confirmed all four steps render:
  - category selection
  - energy selection
  - time selection
  - email / payment step
- The `Continue to payment` action reaches `/api/checkout`; without a Stripe secret it now returns the explicit error `STRIPE_SECRET_KEY is not configured.` instead of failing generically.

## Vercel Environment Variables Set

- Present:
  - `APP_URL`
  - `NEXT_PUBLIC_BASE_URL`
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `CRON_SECRET`
  - `STRIPE_PRICE_ID_1CAT`
  - `STRIPE_PRICE_ID_2CAT`
  - `STRIPE_PRICE_ID_3CAT`

## Missing Environment Variables

- Critical for payment flow:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Not blocking this specific audit, but still missing from Vercel:
  - `ADMIN_EXPORT_TOKEN`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_BILLING_PORTAL_CONFIGURATION_ID`
  - `RESEND_API_KEY`
  - `RESEND_WEBHOOK_SECRET`
  - `EMAIL_REPLY_TO`

## Remaining Production Risk

- Even after the redeploy, production checkout cannot succeed until `STRIPE_SECRET_KEY` is configured in Vercel.
- Stripe webhook signature verification cannot work in production until `STRIPE_WEBHOOK_SECRET` is configured in Vercel.

---

Date: 2026-04-22
Task: `Set up Neon database — apply Prisma schema and seed action library`

## Neon Database Result

- Confirmed the live `DATABASE_URL` available in the NanoCorp environment resolves to a Neon host.
- Wrote local Prisma database settings to `.env.local` with:
  - `DATABASE_URL=<Neon secret>`
  - `DIRECT_URL=<same Neon secret>`
- Applied the checked-in Prisma migrations with `npx prisma migrate deploy`.
- Prisma reported `No pending migrations to apply`, which confirms the committed schema was already present in Neon.
- Verified the expected core tables exist in `public`:
  - `users`
  - `subscriptions`
  - `actions`
  - `daily_sends`
  - `daily_delivery_logs`
  - `user_events`
  - `user_preferences`
  - `adaptation_state`

## Action Library Seed Result

- Generated the local Prisma client with `npx prisma generate` after `npm ci`; this was required because the seed command initially failed on an uninitialized client.
- Ran `npx prisma db seed` successfully against Neon.
- Verified the seeded action counts directly in SQL:
  - `health_energy`: `31`
  - `mental_clarity`: `31`
  - `organization`: `30`
  - `personal_projects`: `31`
  - `relationships`: `31`
  - `work_business`: `31`
- Verified `185` active actions total in the `actions` table.

## Notes

- No Prisma schema change was required for this task.
- The schema uses `UserEvent` as the existing action-response log model rather than a literal `ActionLog` model name.
- `docs/env-setup.md` and `.env.example` were updated to show the exact Neon connection-string format expected for `DATABASE_URL` and `DIRECT_URL` without exposing the live secret.

---

Date: 2026-04-23
Task: `Connect Neon database to Vercel — verify production database wiring`

## Current Neon Database Status

- Confirmed the live shell `DATABASE_URL` resolves to the Neon host `ep-tiny-sun-aemy249s.c-2.us-east-2.aws.neon.tech` for database `neondb`.
- Ran `DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}" npx prisma migrate deploy` against Neon.
- Prisma reported `3 migrations found` and `No pending migrations to apply`.
- Verified the expected Prisma-backed tables exist in `public`:
  - `users` (`User`)
  - `actions` (`Action`)
  - `daily_delivery_logs` (`DailyDeliveryLog`)
  - `user_events` (`UserEvent`, which is the current schema's action-log equivalent)
- Verified the broader table set also includes:
  - `_prisma_migrations`
  - `adaptation_state`
  - `daily_sends`
  - `subscriptions`
  - `user_preferences`
- Verified current row counts:
  - `users`: `0`
  - `actions`: `185`
  - `user_events`: `0`
  - `daily_delivery_logs`: `0`

## Current Vercel Environment Status

- `nanocorp vercel env list` confirmed `DATABASE_URL` is present for `production`, `preview`, and `development`.
- Attempting to overwrite `DATABASE_URL` via `nanocorp vercel env set` failed with `Cannot modify protected env var: DATABASE_URL`, which confirms the value is platform-managed rather than missing.
- Refreshed `DIRECT_URL` in Vercel from the current Neon connection string for the targets exposed by the NanoCorp CLI:
  - `production`
  - `preview`
- Updated `BUILD_CACHE_BUSTER` so the next deployment will pick up the refreshed environment state without relying on a stale build cache.

## Post-Redeploy Live Verification

- Pushed commit `bfe9642` to `main` to trigger a fresh Vercel deployment after refreshing the database-related env state.
- Waited exactly 90 seconds, then verified the live site with:
  - `agent-browser open https://onestep.nanocorp.app && agent-browser wait --load networkidle && agent-browser get title && agent-browser get url`
- `agent-browser` confirmed the deployment loaded successfully:
  - title: `ONE THING`
  - url: `https://onestep.nanocorp.app/`
- Verified production API responses on the live deployment:
  - `POST /api/checkout` with an empty body returned `400` with `{"error":"Invalid JSON body."}`
  - `POST /api/webhooks/stripe` with no signature returned `400` with `Missing Stripe signature header.`

## Result

- `DATABASE_URL` now set in Vercel: ✅ present for `production`, `preview`, and `development` as a protected platform-managed env var
- Schema tables exist in Neon: ✅ verified via Prisma migrations plus direct SQL inspection
- API routes respond without `500`: ✅ live production returned `400` for both required negative-path checks

---

Date: 2026-04-23
Task: `Set remaining Vercel env vars: STRIPE_SECRET_KEY, RESEND_API_KEY, CRON_SECRET, NEXT_PUBLIC_BASE_URL`

## Current Vercel Environment Inventory

- Present in Vercel:
  - `BUILD_CACHE_BUSTER`
  - `APP_URL`
  - `NEXT_PUBLIC_BASE_URL`
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `CRON_SECRET`
  - `STRIPE_PRICE_ID_1CAT`
  - `STRIPE_PRICE_ID_2CAT`
  - `STRIPE_PRICE_ID_3CAT`
- Missing from the checked-in env contract in `.env.example` and `docs/env-setup.md`:
  - `ADMIN_EXPORT_TOKEN`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_BILLING_PORTAL_CONFIGURATION_ID`
  - `RESEND_API_KEY`
  - `RESEND_WEBHOOK_SECRET`
  - `EMAIL_REPLY_TO`
- Also absent from Vercel:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is part of the founder task checklist but is not currently documented in `.env.example` or `docs/env-setup.md`, and no checked-in source file references it.

## Changes Applied

- Rotated `CRON_SECRET` for `production` and `preview`.
- Re-set `NEXT_PUBLIC_BASE_URL=https://onestep.nanocorp.app` for `production` and `preview`.
- Re-set `APP_URL=https://onestep.nanocorp.app` for `production` and `preview`.
- Updated `BUILD_CACHE_BUSTER` so the next deployment rebuilds against the current env state.
- Checked `https://onestep.vercel.app` as a possible default Vercel hostname and rejected it because it returns `308` to `/today`, which indicates it is not this app.

## Blockers

- Could not set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, or `RESEND_API_KEY` because no real values are available in the repo, shell environment, NanoCorp company docs, or recent company emails.
- `nanocorp vercel env list` exposes only env key names and targets, not secret values, so existing secrets cannot be recovered from Vercel from this environment.
- Stripe webhook registration could not be completed from this environment without founder access to the Stripe dashboard or an already-available Stripe API key.

## Smoke Test Status

- Post-push verification was run once after waiting exactly 90 seconds.
- `agent-browser` confirmed the live site still loads at `https://onestep.nanocorp.app/` with title `ONE THING`.
- Navigating through `/onboarding` worked across the category, energy, time, and email steps with no browser console output and no page errors reported by `agent-browser`.
- The final `Continue to payment` action issued `POST https://onestep.nanocorp.app/api/checkout`.
- That checkout request returned `503` instead of a Stripe Checkout URL, so the payment flow is still blocked in production.
- Given the current Vercel env inventory, the remaining likely blocker is `STRIPE_SECRET_KEY` still being absent in Vercel.
