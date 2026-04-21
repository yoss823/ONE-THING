# ONE THING V1 Technical Plan

## V1 Goal

Ship the fastest credible version of ONE THING: a paid email product that lets a user subscribe, choose 1-3 categories, set a timezone, and receive one daily email at **8:00am local time** with one action per selected category.

The V1 should optimize for:

- simple operations
- reliable delivery
- fast iteration
- low vendor lock-in

## Recommended Stack

### App and Hosting

- **Next.js App Router on Vercel**
- **PostgreSQL** as the only source of truth
- **Plain SQL migrations** checked into the repo
- **Server-only rendering and route handlers** for onboarding, settings, admin, and webhooks

Why:

- Vercel is already the deployment target.
- Next.js gives one codebase for landing page, authenticated settings, onboarding, and internal cron endpoints.
- Postgres keeps the core business logic portable; if Vercel changes later, the app can move with minimal rewrite.
- Plain SQL keeps schema ownership explicit and portable.

### Billing

- **Stripe Billing**
- Use **hosted Stripe Checkout** for signup
- Use **Stripe Billing Portal** for cancel / payment-method changes
- Start with **one monthly price**: `$10/month`
- Configure a **7-day free trial** in Stripe

Why:

- Hosted Stripe pages are much faster and less error-prone than building custom billing UI.
- Billing Portal removes a large support burden.
- Only Stripe customer/subscription ids need to be stored locally, which limits lock-in.

### Email Delivery and Tracking

- **Postmark** for transactional email delivery
- Track **delivered / bounced / opened / clicked** through webhooks
- Keep send scheduling in our app, not in the email vendor

Why:

- ONE THING is email-first, so deliverability is a product requirement, not a later optimization.
- Postmark is strong for transactional reliability and simple webhook-based event tracking.
- Scheduling in our system preserves portability to SES, Resend, or another provider later.

If team preference is stronger for developer ergonomics than deliverability controls, **Resend** is the acceptable fallback. The data model should not depend on either provider.

### Background Jobs

- Use a **single cron trigger** that calls a protected internal route every 5 minutes
- Cron route selects due sends from Postgres and processes them in small batches
- Compute and persist each user's next send time after every successful run

Why:

- This is the smallest reliable scheduler for V1.
- The job runner is portable: Vercel Cron now, any cron or worker later.
- Persisting `next_send_at_utc` avoids repeated timezone math on every query.

## Core Architecture

1. User lands on a simple marketing page.
2. User starts hosted Stripe Checkout.
3. Stripe webhook creates or updates local `users` and `subscriptions`.
4. User finishes onboarding:
   - confirms email
   - selects 1-3 categories
   - sets timezone
5. System calculates `next_send_at_utc` for the next local 8:00am.
6. Cron route runs every 5 minutes and fetches due users.
7. For each due user:
   - pick one action per selected category
   - create a send record
   - send one email
   - store provider message id
   - compute the next local 8:00am
8. Provider webhooks append delivery and engagement events.

## Local-Time 8:00am Send Design

Store:

- `timezone` as an IANA zone, for example `America/New_York`
- `next_send_at_utc` as the canonical scheduler field

Rules:

- Recompute `next_send_at_utc` only when:
  - onboarding completes
  - timezone changes
  - a daily send finishes
  - a subscription resumes after pause / payment recovery
- If a user signs up after local 8:00am, first send is the **next day** at 8:00am local time.
- Use a timezone-aware library and test DST transitions explicitly.
- Cron should look back a few minutes and mark rows with a claim token to avoid duplicate sends during retries.

This is simpler and safer than trying to run timezone-specific cron jobs.

## Data Model

### Core Tables

`users`

- `id`
- `email` unique
- `email_verified_at`
- `timezone`
- `status` (`pending_onboarding`, `active`, `paused`, `canceled`)
- `created_at`
- `updated_at`

`subscriptions`

- `id`
- `user_id`
- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_price_id`
- `status` (`trialing`, `active`, `past_due`, `canceled`, `unpaid`)
- `trial_ends_at`
- `current_period_ends_at`
- `cancel_at_period_end`
- `created_at`
- `updated_at`

`user_categories`

- `user_id`
- `category_slug`
- `position`
- `created_at`

`actions`

- `id`
- `category_slug`
- `title`
- `instruction`
- `minutes`
- `why_it_matters`
- `difficulty`
- `status` (`draft`, `active`, `archived`)
- `is_fallback`
- `created_at`
- `updated_at`

`daily_sends`

- `id`
- `user_id`
- `local_send_date`
- `scheduled_for_utc`
- `sent_at`
- `status` (`queued`, `sending`, `sent`, `failed`, `skipped`)
- `provider`
- `provider_message_id`
- `subject`
- `error_code`
- `created_at`

`daily_send_items`

- `id`
- `daily_send_id`
- `category_slug`
- `action_id`
- `position`
- `done_token`
- `done_at`
- `created_at`

`email_events`

- `id`
- `daily_send_id`
- `provider`
- `event_type`
- `provider_event_id`
- `occurred_at`
- `payload_json`

`send_queue`

- `user_id` primary key
- `next_send_at_utc`
- `last_sent_at`
- `job_claimed_at`
- `job_claim_token`
- `job_attempts`

### Notes

- Keep the action library separate from send history so content can evolve without rewriting analytics.
- `daily_sends` and `email_events` should be append-friendly and never reused.
- `send_queue` is the operational table the cron job queries; it keeps scheduler logic simple.

## Minimal Online Surface

Do not build a broad product UI in V1. The minimum useful surface is:

1. Landing page
2. Checkout success page
3. Onboarding page for category selection and timezone
4. Account settings page:
   - change categories
   - change timezone
   - open Billing Portal
   - pause / cancel
5. Email action completion endpoint
6. Admin-only internal page for:
   - recent sends
   - failed sends
   - export trigger

Do not build archives, dashboards, streak history, or social features in V1.

## Export and Portability Strategy

Canonical data stays in Postgres. Everything else is replaceable.

V1 export plan:

- Nightly **database dump** to an S3-compatible bucket
- Admin-triggered **CSV exports** for:
  - users
  - subscriptions
  - daily sends
  - engagement events
- Optional **NDJSON export** for send and event logs if later analytics tooling needs append-only files

Principles:

- Never make the email vendor the source of truth for send history.
- Never make Stripe the source of truth for product state.
- Keep category content in Postgres or checked-in seed files, not in a proprietary CMS.
- If a vendor is replaced, only the adapter layer should change.

## Operational Guardrails

- Protected cron endpoint with a shared secret
- Idempotent Stripe and email webhooks
- Row-level claiming for due sends
- Alert on repeated send failures or bounce spikes
- Seed every category with fallback actions before launch
- Start with plaintext-first email templates plus a light HTML wrapper

## Fastest V1 Build Sequence

### Step 1

Scaffold the Next.js app, Postgres connection, SQL migration folder, and environment contract.

### Step 2

Implement marketing page, hosted Stripe Checkout entry, webhook handling, and Checkout success page.

### Step 3

Implement onboarding for category selection and timezone capture, then calculate `next_send_at_utc`.

### Step 4

Implement content seeding, send queue selection, email rendering, and provider webhooks.

### Step 5

Implement settings page, Billing Portal link, admin exports, and basic operational reporting.

## Recommended First Follow-Up Tickets

1. Scaffold the Next.js app and shared environment config.
2. Create the initial SQL migration for the tables above.
3. Wire Stripe Checkout, Billing Portal, and subscription webhooks.
4. Build onboarding for categories and timezone.
5. Implement the cron-driven send loop and Postmark integration.
6. Add admin CSV export and nightly database backup automation.
