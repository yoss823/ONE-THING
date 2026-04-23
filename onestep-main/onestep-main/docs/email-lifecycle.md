# Email Lifecycle Audit

Verified against the checked-in code on 2026-04-23.

This audit is based on the actual routes, Prisma schema, cron config, email templates, and send functions in this repo. It does not treat marketing copy or planning docs as shipped behavior.

## 1. Email types in the system

| Email | Purpose | Trigger | Template file | Send function / route | Status |
| --- | --- | --- | --- | --- | --- |
| Welcome email | Confirms signup immediately after payment. | Stripe webhook `checkout.session.completed` in `app/api/webhooks/stripe/route.ts`. | `emails/WelcomeEmail.tsx` | `lib/email/sendWelcomeEmail.ts` from `handleCheckoutCompleted()` | ✅ implemented |
| Daily action email | Sends one action per selected category, with `Done` and `Skip` tracking links. | Vercel cron `*/10 * * * *` on `/api/cron/daily-email`; route sends only when user local time is `08:00` through `08:10`. | `emails/DailyActionEmail.tsx` | `lib/email/sendDailyAction.tsx` from `app/api/cron/daily-email/route.ts` | ✅ implemented |
| Weekly summary | Sends a Monday recap of recent daily sends. | Intended Vercel cron `*/10 * * * *` on `/api/cron/weekly-email`; route logic targets Monday around 8 AM local. | `emails/WeeklySummaryEmail.tsx` | Inline `resend.emails.send()` inside `app/api/cron/weekly-email/route.ts` | ⚠️ partial |
| Monthly clarity | Sends a first-of-month reflection email and replaces that day's daily send. | Intended Vercel cron `*/10 * * * *` on `/api/cron/monthly-email`; route logic targets day `1` around 8 AM local. | `emails/MonthlyClarityEmail.tsx` | `lib/email/sendMonthlyClarity.tsx` via `app/api/cron/monthly-email/route.ts` and `lib/cron/email-cron.ts` | ⚠️ partial |
| Cancellation confirmation | Would confirm a canceled subscription. | No trigger found. | None | None | ❌ missing |

### Notes

- `weekly-email` and `monthly-email` are only partial because both mounted routes export `POST` only, while the scheduled paths in `vercel.json` are plain cron paths and the repo's own `scripts/test-cron.sh` calls them with `GET`. There is no `GET` handler in either route.
- I did not find any other live send paths beyond the four above.
- I did find static email-copy assets under `content/one-thing/email-templates/`, including `confirmation.html` / `confirmation.txt`, but they are not referenced by any sender and are not currently sendable by the app.

## 2. First email timing

### First email overall

The first email overall is the welcome email. It is sent immediately after `checkout.session.completed` finishes the user/subscription upsert in `app/api/webhooks/stripe/route.ts`.

### First daily email

The first daily email does **not** reliably send "the next morning" after signup in the current codebase.

What actually happens today:

1. Checkout sends `email`, `categories`, `energyLevel`, and `availableMinutes` to `/api/checkout`.
2. The Stripe webhook upserts `User`, `Subscription`, and `UserPreference`.
3. The webhook sends the welcome email immediately.
4. The daily cron only selects users whose `users.timezone` is not `null`.
5. No checked-in route writes `users.timezone`.

So the real first daily email timing is:

- **Only after some other code path or manual DB change sets `users.timezone`**, and then
- on the first `/api/cron/daily-email` run that lands between `08:00` and `08:10` in that stored timezone.

### Same-day guard

There is **no explicit same-day guard** based on `createdAt`, checkout time, or "next morning only" logic.

If a user already had a valid timezone before the local `08:10` cutoff, the daily cron could send on the same local calendar day because the only checks are:

- active subscription
- non-null timezone
- local time in the send window
- no daily send already recorded for that local date
- no monthly clarity log for that local date

In the current shipped signup flow, the missing timezone incidentally prevents the `7:58 AM signup` edge case, but it also prevents all daily sends until timezone is populated.

### Is the "next morning" logic correct?

No. The promise exists in copy, not in cron logic.

- `emails/WelcomeEmail.tsx` says `Tomorrow at 8:00 AM, you'll receive your first single action.`
- `app/welcome/page.tsx` says `Your first email arrives tomorrow at 8:00 AM.`
- `app/api/cron/daily-email/route.ts` never checks `createdAt` or "tomorrow"; it only checks the current local clock and whether a send already happened today.

## 3. Timezone handling

### Storage

- Table: `users`
- Field: `timezone`
- Type: nullable text (`String?` in Prisma)

### Where timezone is written

I did **not** find a checked-in route, action, or webhook that writes `users.timezone`.

- `app/onboarding/page.tsx` never collects timezone.
- `app/api/checkout/route.ts` never sends timezone to Stripe metadata.
- `app/api/webhooks/stripe/route.ts` upserts the user without a timezone field.

### How each cron determines "8 AM local"

| Flow | How users are selected | How 8 AM is calculated | Missing / invalid timezone behavior |
| --- | --- | --- | --- |
| Daily email | `prisma.user.findMany()` where `timezone != null`, `preference is not null`, and `subscription.status = "active"` | `Intl.DateTimeFormat(... timeZone: user.timezone)` and `hour === 8 && minute <= 10` | `null` timezone users are excluded up front. Invalid timezone strings cause `isEightAM()` to return `false`, so the user is silently skipped. |
| Weekly summary | Raw SQL over active subscriptions | `getZonedDateTime()` plus `Math.abs(minutesSinceMidnight - 480) <= 10` and `weekday === "Mon"` | Missing or invalid timezones fall back to `UTC`. |
| Monthly clarity | `loadActiveUsers()` filters to active users with truthy timezone | `getLocalTimeSnapshot()` plus `Math.abs(currentMinutes - 480) <= 10` and `day === 1` | Missing timezone excludes the user; invalid timezone falls back to `UTC`. |

### DST / double-send / miss risk

- The daily flow is **not obviously DST-double-send prone** because it checks the actual wall-clock time in the stored timezone and dedupes by local date before sending. Since the target is 8 AM, the usual DST shift at 2 AM does not create a duplicate 8 AM hour.
- The bigger real risk is **missed sends**, not DST duplicates:
  - all three cron flows only look at the current invocation time
  - none of them performs a lookback or catch-up if the job runs after the allowed window
- Weekly and monthly also use custom timezone math with UTC fallback on invalid timezone values, so a bad stored timezone can move delivery to the wrong clock time instead of cleanly failing.

## 4. Unsubscribe flow

### Is there an unsubscribe link in daily emails?

Yes.

`emails/DailyActionEmail.tsx` includes:

- footer link to `/unsubscribe`
- footer link to `/account`

Weekly and monthly emails also include an unsubscribe link.

The welcome email does **not** include an unsubscribe link in the current template.

### What happens when the link is clicked?

Nothing application-specific is implemented in this repo.

I did not find:

- `app/unsubscribe/page.tsx`
- `app/unsubscribe/route.ts`
- `app/api/unsubscribe/route.ts`
- any DB field such as `unsubscribedAt`
- any cron filter for an unsubscribe state

So clicking `/unsubscribe` currently does **not** update the database and does **not** stop future sends through an implemented app flow.

### Is the unsubscribe route implemented and tested?

No.

- Route implementation: ❌ missing
- DB update path: ❌ missing
- Tests: ❌ none found

## 5. Cancellation behavior

### Which Stripe webhook event triggers cancellation?

`customer.subscription.deleted`

The route also handles `customer.subscription.updated`, but the explicit cancellation path is `handleSubscriptionDeleted()` in `app/api/webhooks/stripe/route.ts`.

### What DB state change occurs?

Only this state change is applied in the checked-in Prisma path:

- `subscriptions.status = "canceled"`

I did not find any checked-in update for:

- `canceled_at`
- `cancel_at_period_end`
- an email pause flag
- an unsubscribe flag

### Does the user receive a cancellation confirmation email?

No. There is no cancellation template, send function, or webhook send path.

### When do daily emails stop after cancellation?

They stop on the next cron selection pass after the webhook has written `subscriptions.status = "canceled"`, because the daily cron only loads users whose subscription status is exactly `"active"`.

The same active-only filter also blocks weekly and monthly sends.

One race still exists: if a cron run has already loaded the user into memory before the cancellation webhook updates the subscription row, that in-flight run could still send once.

## 6. Cron edge cases

### Exact schedule

`vercel.json` schedules all three email cron paths every 10 minutes:

- `/api/cron/daily-email`
- `/api/cron/weekly-email`
- `/api/cron/monthly-email`

### What is the "8 AM" window?

It is not consistent across the codebase.

| Flow | Effective send window in code | Notes |
| --- | --- | --- |
| Daily email | `08:00` through `08:10` local | `hour === 8 && minute <= 10` |
| Weekly summary | `07:50` through `08:10` local | Uses absolute-difference math, so `07:50` is treated as due |
| Monthly clarity | `07:50` through `08:10` local on day `1` | Uses the same absolute-difference helper |

### What happens if cron runs late?

There is no backfill behavior.

- If the daily cron runs at `08:11` local, that day's send is missed.
- If the weekly cron runs outside its 20-minute window on Monday, that week's summary is missed.
- If the monthly cron misses the first-day window, that month's clarity email is missed.

None of the flows uses a "last successful run" watermark or a send queue claim/retry worker. The checked-in `/api/cron/process-send-queue` route is scaffold-only.

### Is there idempotency protection against double-send?

Not strong protection.

What exists:

- Daily email checks `daily_sends` for a `"sent"` row on the same local date before sending.
- Daily helper code in `lib/cron/email-cron.ts` checks `daily_delivery_logs` before sending.
- Weekly summary checks for a `user_events` row with `actionId = null` in the current local-day range before sending.
- Monthly clarity checks for an existing monthly delivery log before sending.

What is missing:

- no unique constraint on `(user_id, local_date, type)` in `daily_delivery_logs`
- no unique send marker for weekly sends
- no transaction that claims delivery **before** calling Resend
- no completed send queue worker

That means concurrent runs, manual retries, or overlapping cron invocations can still double-send.

### Cron wiring gap

There is also a route-method mismatch:

- `app/api/cron/daily-email/route.ts` exports both `GET` and `POST`
- `app/api/cron/weekly-email/route.ts` exports `POST` only
- `app/api/cron/monthly-email/route.ts` exports `POST` only
- `scripts/test-cron.sh` calls all three routes with `GET`

So daily cron is fully mounted; weekly and monthly are only partially mounted for scheduled use.

## 7. Gaps and minimal fixes

1. Persist the user's timezone during onboarding / checkout and write it to `users.timezone`.
2. Add an explicit "first daily email must be tomorrow morning" guard if that is the product promise. The current cron has no `createdAt` cutoff.
3. Export `GET` handlers for `/api/cron/weekly-email` and `/api/cron/monthly-email`, or route both through a shared `GET`/`POST` handler like daily already does.
4. Standardize the send window logic so all flows mean the same thing by "8 AM". If early `07:50` sends are not desired, remove the absolute-difference check from weekly/monthly.
5. Add a real unsubscribe flow:
   - route
   - persisted opt-out field
   - cron filtering
6. Add durable idempotency:
   - unique DB constraint for one send per user / local date / type
   - claim-before-send or queue-based sending
7. Add catch-up behavior for late cron runs so a cold start after the window does not silently miss the day/week/month.
8. Add a cancellation confirmation email if customer communication after cancel is required.
9. Implement the Resend webhook route so bounce / complaint events can pause local sending instead of relying on provider-side behavior only.

## Key code references

- `vercel.json`
- `prisma/schema.prisma`
- `app/api/checkout/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/api/cron/daily-email/route.ts`
- `app/api/cron/weekly-email/route.ts`
- `app/api/cron/monthly-email/route.ts`
- `app/api/cron/process-send-queue/route.ts`
- `app/api/track/route.ts`
- `app/api/webhooks/resend/route.ts`
- `lib/email/sendDailyAction.tsx`
- `lib/email/sendWelcomeEmail.ts`
- `lib/email/sendMonthlyClarity.tsx`
- `lib/cron/email-cron.ts`
- `emails/DailyActionEmail.tsx`
- `emails/WeeklySummaryEmail.tsx`
- `emails/MonthlyClarityEmail.tsx`
- `emails/WelcomeEmail.tsx`
