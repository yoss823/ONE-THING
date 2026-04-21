# ONE THING V1 Implementation Blueprint

## V1 Goal

Ship the fastest reliable paid version of ONE THING on the approved stack:

- Next.js + TypeScript + Tailwind on Vercel
- Supabase Postgres + Supabase Auth
- Prisma as the application ORM and schema contract
- Stripe Billing for checkout, subscription state, and plan changes
- Resend for outbound email and email-event webhooks
- Vercel Cron for the send-queue worker

The product promise for V1 is:

- a user signs in with email
- picks 1-3 categories
- selects one of three billing plans
- receives a daily 8:00 AM local-time email
- receives a separate Monday weekly email
- receives a monthly clarity check that replaces that day's daily email

The system should optimize for inspectable business logic, reliable sending, and simple exportability.

## Concrete Product Assumptions

### Pricing Shape

Use one Stripe product, `one_thing_membership`, with three recurring prices:

1. `monthly` at `$12/month`
2. `quarterly` at `$30/quarter`
3. `annual` at `$96/year`

All three plans unlock the same product. They differ only by billing cadence and discount. This is the fastest V1 because it avoids feature gating while still supporting three pricing options.

If the approved commercial prices change later, only the code mapping and Stripe price ids need to change.

### Email Behavior

Approved cadence rules:

- `daily` always sends at 8:00 AM local time except on the monthly clarity day
- `weekly` sends every Monday as a separate email
- `monthly_clarity` sends on the first local day of the month and replaces that day's `daily`

Collision rules:

- if the first day of the month is Monday, send `monthly_clarity` at `8:00 AM` local time and `weekly` at `8:10 AM` local time
- do not queue a `daily` email on a `monthly_clarity` date

## Recommended Folder Structure

```text
app/
  (marketing)/
    page.tsx
    pricing/page.tsx
  (auth)/
    login/page.tsx
    auth/callback/route.ts
  (app)/
    onboarding/page.tsx
    account/page.tsx
    account/billing/route.ts
  checkout/
    success/page.tsx
  t/
    [token]/
      done/route.ts
      pause/route.ts
  api/
    billing/
      checkout/route.ts
      portal/route.ts
    onboarding/route.ts
    cron/
      process-send-queue/route.ts
    webhooks/
      stripe/route.ts
      resend/route.ts
    admin/
      exports/[kind]/route.ts
lib/
  auth/
  billing/
  cron/
  email/
  actions/
  exports/
  supabase/
prisma/
  schema.prisma
data/
  action-library/
docs/
db/
  migrations/
```

## Auth Approach

Use Supabase Auth with passwordless email sign-in.

Reasons:

- email is already the product channel
- password reset flows are unnecessary
- the authenticated user id is a durable join key for billing, onboarding, queue, and exports

Implementation approach:

1. User enters email on `/login`.
2. Supabase sends a magic link or OTP.
3. The callback route creates or upserts `users` in `public.users` using the Supabase auth user id.
4. Protected routes in the `(app)` group require a valid Supabase session.
5. Prisma uses the application tables in `public`; Supabase Auth remains the identity layer.

Important V1 rule:

- keep `public.users.id` equal to `auth.users.id`
- do not build a second local auth system

## Onboarding Wiring

Recommended order:

1. Sign in with Supabase Auth.
2. Render `/onboarding` if `users.onboarding_completed_at` is null.
3. Collect:
   - timezone as IANA string
   - 1-3 selected categories
   - chosen plan key
4. `POST /api/onboarding` validates and upserts the profile and categories.
5. `POST /api/billing/checkout` creates a Stripe Checkout session for the chosen plan.
6. Stripe success redirects to `/checkout/success`.
7. Stripe webhook is the source of truth for subscription activation.
8. When onboarding is complete and subscription is active, enqueue the next `daily`, `weekly`, and `monthly_clarity` sends.

Why auth before checkout:

- no orphaned onboarding records
- no webhook ambiguity about which app user owns the subscription
- simpler Billing Portal access later

## Stripe Product And Price Mapping

Use one Stripe product and three recurring prices.

| Plan key | Stripe product lookup key | Stripe price lookup key | Billing interval | Price |
| --- | --- | --- | --- | --- |
| `monthly` | `one_thing_membership` | `one_thing_monthly` | month | `$12.00` |
| `quarterly` | `one_thing_membership` | `one_thing_quarterly` | 3 months | `$30.00` |
| `annual` | `one_thing_membership` | `one_thing_annual` | year | `$96.00` |

Rules:

- store the internal `plan_key` locally alongside Stripe ids
- treat Stripe as the payment processor, not the application source of truth
- keep plan entitlements identical across all three plans
- use Stripe Billing Portal for plan swaps, payment method updates, and cancellation

Stripe metadata to attach on checkout:

- `user_id`
- `plan_key`
- `source=onboarding`

Webhook events to handle:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Webhook responsibilities:

- upsert customer and subscription ids
- sync `subscriptions.status`
- sync `subscriptions.plan_key`
- update `users.status`
- enqueue sends on activation or resume
- cancel or skip future sends on cancellation or long-term pause

## Database Shape

The checked-in source of truth should be `prisma/schema.prisma`, with SQL migrations derived from it.

### Core Tables

`users`

- application profile keyed by Supabase auth id
- stores email, timezone, lifecycle status, and onboarding completion

`subscriptions`

- current subscription state per user
- stores internal `plan_key` plus Stripe ids and billing timestamps

`user_categories`

- 1-3 ordered categories selected during onboarding or account updates

`actions`

- checked-in or seeded action catalog
- stores category, copy, duration, complexity, and texture

`user_category_states`

- per-user, per-category adaptation snapshot
- stores streak counters and the latest applied complexity bias

`send_queue`

- one row per scheduled email instance
- supports `daily`, `weekly`, and `monthly_clarity`
- durable operational outbox queried by cron

`email_action_items`

- one row per daily action block included in a daily email
- stores selected action, selection metadata, and `done` / `pause` tokens

`billing_events`

- append-only Stripe webhook log for idempotency and auditability

`email_events`

- append-only Resend webhook log tied to a queue item

## API Route Blueprint

### Public And Auth

- `GET /login`
- `GET /auth/callback`
- `GET /checkout/success`

### App Surface

- `GET /onboarding`
- `POST /api/onboarding`
- `GET /account`
- `POST /api/account/profile`
- `POST /api/account/categories`
- `POST /api/account/pause`
- `POST /api/account/resume`

### Billing

- `POST /api/billing/checkout`
- `POST /api/billing/portal`

### Worker And Webhooks

- `POST /api/cron/process-send-queue`
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/resend`

### Tracking Links

- `GET /t/[token]/done`
- `GET /t/[token]/pause`

### Admin

- `GET /api/admin/exports/users`
- `GET /api/admin/exports/subscriptions`
- `GET /api/admin/exports/send-queue`
- `GET /api/admin/exports/email-events`

## Local-Time 8:00 AM Cron And Send Queue Design

### Why Queue Rows Instead Of One `next_send_at_utc`

V1 must support three email kinds with collision rules. A durable queue row per email instance is easier to reason about and easier to export than a single timestamp field per user.

### Queue Rules

Each active user should always have future queue rows for:

- the next `daily`
- the next `weekly`
- the next `monthly_clarity`

Queue uniqueness:

- unique on `user_id + email_kind + local_send_date`

Send times:

- `daily`: `08:00`
- `monthly_clarity`: `08:00`
- `weekly`: `08:10` on Mondays so it does not collide with the primary morning email

Monthly replacement rule:

- when the local date is day `1`, create `monthly_clarity`
- do not create `daily` for that same local date

### Cron Flow

Run Vercel Cron every 5 minutes against `POST /api/cron/process-send-queue`.

Processor loop:

1. Verify `CRON_SECRET`.
2. Claim due rows with `FOR UPDATE SKIP LOCKED`.
3. Mark claimed rows with a claim token and expiry timestamp.
4. For each claimed row:
   - load user, subscription, categories, and category state
   - skip if the subscription is inactive
   - render the email payload
   - send through Resend
   - store provider message id
   - mark row `sent`
   - enqueue the next row for that email kind
5. If sending fails, increment attempts and leave the row retryable.

Operational constraints:

- batch size `<= 100`
- claim expiry `15 minutes`
- retry backoff via `scheduled_for_utc = now + attempt window`
- mark unrecoverable rows `failed`, not deleted

## Daily, Weekly, And Monthly Email Behavior

### Daily

Contains one action per selected category.

Each block includes:

- title
- one-sentence instruction
- minutes estimate
- short reason
- `Done` link
- `Pause` link

The daily email is the primary product experience.

### Weekly

Monday-only separate email. Keep it lightweight.

Recommended contents:

- previous week's completion count
- the category with the best response
- one sentence of recommended focus for the week
- link to account settings

Do not move the daily action content into the weekly email. Monday still needs the normal daily action email.

### Monthly Clarity

Send on the first local day of the month and replace that day's daily email.

Recommended contents:

- short reflection prompt
- what categories were most consistently completed last month
- one intentional adjustment suggestion
- link to account for category or plan changes

This should be a different template and a different `email_kind`.

## Tracking Link Endpoints For `Done` And `Pause`

Use signed opaque tokens stored on `email_action_items`.

### `GET /t/[token]/done`

Responsibilities:

- verify the token
- mark the related item `done`
- increment `user_category_states.consecutive_done_count`
- reset `consecutive_pause_count`
- redirect to a minimal confirmation page

### `GET /t/[token]/pause`

Responsibilities:

- verify the token
- mark the related item `paused`
- increment `user_category_states.consecutive_pause_count`
- reset `consecutive_done_count`
- redirect to a minimal confirmation page that says tomorrow will be lighter

Rules:

- tokens are single-purpose and single-item
- repeated clicks are idempotent
- the redirect page should not require login

## Action Selection And Adaptation Structure

Selection should stay deterministic and inspectable.

### Inputs

- user's selected categories
- active actions in that category
- recent sends for that user and category
- current category state

### Selection Rules

1. exclude exact action repeats from the previous 10 category sends
2. avoid fallback actions unless the normal pool is exhausted
3. prefer the target complexity from `user_category_states`
4. avoid the most recent texture when possible
5. break ties by oldest `last_sent_at`

### Adaptation Rules

- `5` consecutive `done` responses: upshift one complexity tier
- `3` consecutive `pause` responses: downshift one complexity tier
- unanswered actions do not change the current tier immediately, but remain visible in analytics
- the complexity change is stored in `user_category_states.current_bias`

Keep the logic in TypeScript and keep the library data in checked-in JSON so the business rules can be reviewed without opening Stripe, Supabase, or Resend dashboards.

## Minimal Account Area Scope

Only build the account area needed to operate the subscription:

- view current plan
- open Stripe Billing Portal
- change billing plan
- update timezone
- update 1-3 categories
- pause or resume emails
- view the next scheduled send time

Do not build:

- archives
- streak dashboards
- category analytics UI
- editable action history

## Export Strategy

Canonical data lives in Postgres and checked-in JSON.

V1 export surface:

- CSV export routes for users, subscriptions, send queue, and email events
- JSON or NDJSON export of the action library and adaptation state
- Prisma schema and SQL migrations committed in the repo

Operational backup:

- rely on Supabase backups for database recovery
- keep admin export routes for business portability and ad hoc inspection

## Environment And Config Checklist

### Next.js / Core

- `APP_URL`
- `CRON_SECRET`
- `ADMIN_EXPORT_TOKEN`

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

### Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRODUCT_ONE_THING`
- `STRIPE_PRICE_MONTHLY`
- `STRIPE_PRICE_QUARTERLY`
- `STRIPE_PRICE_ANNUAL`
- `STRIPE_BILLING_PORTAL_CONFIGURATION_ID`

### Resend

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`

## Recommended Build Order

1. Add Supabase Auth and protected app routes.
2. Add Prisma client, schema migration, and action-library seed.
3. Implement onboarding and Stripe Checkout.
4. Implement Stripe webhook sync and Billing Portal.
5. Implement send queue generation and cron worker.
6. Implement Resend templates and Resend webhooks.
7. Add tracking-link endpoints and minimal account pause/resume flows.
8. Add admin exports.

This keeps the first shippable version on the shortest path while preserving the inspectable business logic needed for later iteration.
