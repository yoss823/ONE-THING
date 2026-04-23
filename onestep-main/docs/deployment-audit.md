# Deployment Audit

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
