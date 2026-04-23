# Email Lifecycle Audit

Verified against the checked-in code on 2026-04-23.

| Behavior | Status | Notes |
|---|---|---|
| First email timing | ⚠️ Blocked until timezone exists | Welcome email promises tomorrow at 8:00 AM, but the Stripe webhook does not store a timezone and the daily cron skips users with `timezone = null`. |
| Daily schedule | ✅ Every 10 min cron, 8:00-8:10 local filter | A user whose stored timezone is UTC-5 is eligible on the 13:00 UTC and 13:10 UTC cron runs. |
| Welcome email | ✅ Sent immediately after successful checkout | Subject: `You're in. Your first action arrives tomorrow.` |
| Unsubscribe route | ⚠️ Missing | Daily and welcome emails link to `/unsubscribe`, but no checked-in route handles it. |
| Cancellation flow | ✅ Stripe delete webhook sets `status = "canceled"` | Canceling in Stripe updates the subscription record. |
| Cron skips canceled | ✅ Active-only query filter | Daily cron only loads users whose subscription status is `active`. |

## 1. First Email Timing After Signup

**Status:** Gap ⚠️

**Exact behavior in the current codebase:** the first daily action email is not automatically sent on the same day or the next morning after signup. The Stripe webhook creates or updates the user, subscription, and preferences, but it does not write `users.timezone`. The daily cron only queries users whose `timezone` is not `null`, so a newly created user from the Stripe flow is not eligible for pickup until some other code path writes a timezone. No checked-in route in this repo currently does that.

This means the real flow today is:

1. Checkout completes.
2. `checkout.session.completed` upserts the user and marks the subscription active.
3. The welcome email is sent immediately.
4. The daily cron ignores that user until `users.timezone` becomes non-null.
5. Once a valid timezone is present, the first daily email goes out on the first cron pass that lands between 8:00 AM and 8:10 AM in that stored timezone.

**References**

- `app/onboarding/page.tsx:34-112`
- `app/api/checkout/route.ts:63-77`
- `app/api/webhooks/stripe/route.ts:160-239`
- `prisma/schema.prisma:38-43`
- `app/api/cron/daily-email/route.ts:209-238`

## 2. Daily Email Schedule

**Status:** Confirmed ✅

The daily cron is configured in Vercel to run every 10 minutes. Inside the handler, a user is eligible only when `Intl.DateTimeFormat` resolves their stored timezone to `hour === 8` and `minute <= 10`. That is more precise than "8:00 AM ±10 min": it is effectively the 8:00 to 8:10 local-time window, and with the current cron schedule the relevant passes are the `:00` and `:10` runs.

The stored timezone for a newly created user is **not defaulted to `UTC`** in the Stripe webhook. `User.timezone` is nullable in Prisma, and the webhook upsert does not include a timezone field in either the `create` or `update` branches.

For a user whose stored timezone is UTC-5:

- Their local 8:00 AM maps to 13:00 UTC.
- They are eligible on the 13:00 UTC run.
- If that pass did not send for some reason and no send has been recorded yet for that local date, the 13:10 UTC run still qualifies.

**References**

- `vercel.json:2-14`
- `app/api/cron/daily-email/route.ts:30-52`
- `app/api/cron/daily-email/route.ts:87-104`
- `app/api/cron/daily-email/route.ts:209-238`
- `prisma/schema.prisma:38-43`
- `app/api/webhooks/stripe/route.ts:175-228`

## 3. Welcome / Confirmation Email

**Status:** Confirmed ✅

There is now a welcome / payment-confirmation-style email in the current codebase. It is sent from the Stripe webhook immediately after the user upsert completes inside `handleCheckoutCompleted`. The send is wrapped in a local `try/catch`, so a Resend failure is logged but does not fail the already-successful webhook.

The email subject is `You're in. Your first action arrives tomorrow.` The body says `You're in.` and `Your first ONE THING email arrives tomorrow at 8:00 AM.` It also includes the selected categories plus `Unsubscribe` and `Manage preferences` footer links.

Important caveat: that "tomorrow at 8:00 AM" claim is not guaranteed by the current daily cron logic, because the webhook does not set `users.timezone`.

**References**

- `app/api/webhooks/stripe/route.ts:160-239`
- `lib/email/sendWelcomeEmail.ts:72-91`
- `emails/WelcomeEmail.tsx:49-85`
- `emails/WelcomeEmail.tsx:88-116`

## 4. Unsubscribe Flow

**Status:** Gap ⚠️

The daily email template includes an `Unsubscribe` link to `/unsubscribe`, and the welcome email sender builds `/unsubscribe?email=...` links. However, there is no checked-in `app/unsubscribe/*` route and no checked-in `app/api/unsubscribe/*` API route in this repository.

Because the route is missing:

- Clicking the unsubscribe link has no implemented application flow in this repo.
- There is no code here that marks a user unsubscribed.
- There is no code here that cancels a Stripe subscription from an unsubscribe action.

So the current behavior is "link exists, handler missing."

**References**

- `emails/DailyActionEmail.tsx:73-97`
- `emails/DailyActionEmail.tsx:100-139`
- `lib/email/sendWelcomeEmail.ts:50-58`
- `lib/email/sendWelcomeEmail.ts:72-91`

## 5. Cancellation Flow (Stripe-Side)

**Status:** Confirmed ✅

Stripe-side cancellation is handled. The webhook `POST` switch listens for `customer.subscription.deleted` and calls `handleSubscriptionDeleted`. That handler looks up the subscription by Stripe customer id and updates the stored subscription status to `canceled`.

The daily cron skips canceled users because its query only loads users whose related subscription status is exactly `active`.

So the cancellation flow is:

1. The user cancels in Stripe.
2. Stripe sends `customer.subscription.deleted`.
3. The webhook updates `subscriptions.status` to `canceled`.
4. Future daily cron runs no longer select that user.

**References**

- `app/api/webhooks/stripe/route.ts:264-283`
- `app/api/webhooks/stripe/route.ts:312-322`
- `app/api/cron/daily-email/route.ts:209-223`

## 6. Edge Cases

### Email bounces

**Status:** Gap ⚠️

The codebase has a Resend webhook route, but it is scaffold-only. It validates config/signature presence, reads the request body, and returns a placeholder JSON response saying event persistence is not implemented yet. So bounce handling is not wired into application state today. Resend may suppress future sends on its side, but this repo does not record bounce events or disable users locally.

**References**

- `app/api/webhooks/resend/route.ts:3-28`

### No action available for a user's category

**Status:** Confirmed ✅

If no action can be selected, `selectActionForUser` throws. The daily cron catches that failure per user, logs `Failed to send daily email for user ...`, and then attempts to write a failed delivery log. If no selections were made, `logDelivery` creates a `daily_sends` row with `actionId: null` and `status: "failed"`. The cron does not crash the whole run and it does not fail silently.

**References**

- `lib/actions/selectActionForUser.ts:171-194`
- `lib/actions/selectActionForUser.ts:211-233`
- `app/api/cron/daily-email/route.ts:124-141`
- `app/api/cron/daily-email/route.ts:233-271`

### `timezone` is null, empty, or invalid

**Status:** Confirmed ✅

The daily cron does not break when timezone is missing. It excludes `timezone = null` users in the initial query and also has a defensive `if (!user.timezone) continue;` guard inside the loop, which skips empty strings as well. Invalid timezone identifiers are also skipped because `isEightAM` catches `Intl.DateTimeFormat` errors and returns `false`.

There is no UTC fallback in the daily cron. That fallback exists in other email code paths, but not here.

**References**

- `prisma/schema.prisma:38-43`
- `app/api/cron/daily-email/route.ts:30-52`
- `app/api/cron/daily-email/route.ts:87-104`
- `app/api/cron/daily-email/route.ts:209-238`
