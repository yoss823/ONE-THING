# ONE THING Stripe Test Mode E2E Checklist

Use this checklist to validate the full ONE THING user journey in Stripe test mode before switching any Stripe keys or webhook secrets to live mode.

Notes:

- Replace `https://[domain]` with the active deployment URL you are testing. Production is currently `https://onestep.nanocorp.app`.
- The Stripe webhook endpoint for this app is `https://[domain]/api/webhooks/stripe`.
- The checkout success redirect is `https://[domain]/welcome?session_id=cs_test_...`.
- The tracking redirect destination is `https://[domain]/tracked?response=done|skip`.

## Test Data

- Test email: use a unique inbox you control, for example `qa+stripe-test-YYYYMMDD@example.com`
- Stripe test card:
  - Card number: `4242 4242 4242 4242`
  - Expiration: `12/29`
  - CVC: `123`
  - ZIP: `10001`

## Pre-flight checks

- [ ] All Vercel env vars are set (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, `NEXT_PUBLIC_BASE_URL`, `CRON_SECRET`)
- [ ] Stripe webhook endpoint is registered and showing "Enabled" in Stripe dashboard
- [ ] Stripe webhook endpoint URL matches `https://[domain]/api/webhooks/stripe`
- [ ] Resend domain `onething.so` is verified (or a test domain is verified)
- [ ] Vercel deployment is live (check deployment URL)
- [ ] Stripe checkout is still using test mode keys and test price ids
- [ ] `CRON_SECRET` value is available locally for manual cron calls

## Step 1 - Landing page

- [ ] Visit `https://[domain]/`
- [ ] Verify headline: `ONE THING — Stop deciding. Start doing.`
- [ ] Verify pricing shows: `$4.99 / $7.99 / $9.99`
- [ ] Click `Start — choose your category` -> confirms navigation to `/onboarding`

## Step 2 - Onboarding flow

- [ ] Select 1 category -> price shows `$4.99/month`
- [ ] Try to select 4 categories -> confirm 4th is blocked
- [ ] Select 2 categories -> price shows `$7.99/month`
- [ ] Click `Continue` -> Step 2: Energy level (`Low` / `Medium` / `High` options visible)
- [ ] Select energy level -> Click `Continue` -> Step 3: Time (`5` / `10` / `15 min`)
- [ ] Select time -> Click `Continue` -> Step 4: Email input
- [ ] Enter test email -> Click `Continue to payment`
- [ ] Confirms `POST` to `/api/checkout` and redirect to Stripe hosted checkout

## Step 3 - Stripe checkout (test mode)

- [ ] Stripe checkout page loads with correct price
- [ ] Use test card: `4242 4242 4242 4242`, exp `12/29`, CVC `123`, ZIP `10001`
- [ ] Complete payment
- [ ] Redirected to `/welcome?session_id=cs_test_...`

## Step 4 - Welcome page

- [ ] Page shows `You're in.`
- [ ] Categories are displayed
- [ ] Energy level and time are displayed
- [ ] Confirmation email address matches the submitted email
- [ ] Page does NOT crash or show error

## Step 5 - Webhook activation

- [ ] Check Stripe dashboard -> Webhooks -> recent deliveries
- [ ] Confirm `checkout.session.completed` webhook was delivered with status `200`
- [ ] Check database: confirm new user row was created with correct email
- [ ] Check database: confirm `user_preferences` row has correct categories, energy level, and available minutes
- [ ] Check database: confirm `subscriptions.plan` matches the selected tier
- [ ] Check database: confirm subscription status = `active`

Suggested SQL:

```sql
SELECT u.id, u.email, u.timezone, u.created_at
FROM users u
WHERE u.email = 'qa+stripe-test@example.com';

SELECT s.user_id, s.plan, s.status, s.stripe_customer_id, s.stripe_subscription_id
FROM subscriptions s
JOIN users u ON u.id = s.user_id
WHERE u.email = 'qa+stripe-test@example.com';

SELECT up.user_id, up.categories, up.energy_level, up.available_minutes
FROM user_preferences up
JOIN users u ON u.id = up.user_id
WHERE u.email = 'qa+stripe-test@example.com';
```

## Step 6 - Cron job test

- [ ] Manually trigger cron: `curl -H "Authorization: Bearer $CRON_SECRET" https://[domain]/api/cron/daily-email`
- [ ] Confirm response includes `"sent": 1` (or more)
- [ ] Check inbox: daily action email received
- [ ] Email contains correct action text and tracking links

## Step 7 - Tracking links

- [ ] Click `Done` link in the email
- [ ] Confirm redirect to `/tracked?response=done` with correct copy
- [ ] Trigger another daily email if needed to test the alternate path cleanly
- [ ] Click `Skip` link
- [ ] Confirm redirect to `/tracked?response=skip` with correct copy
- [ ] Check database: `daily_delivery_logs.status` updated to `completed` and `skipped`
- [ ] Check database: `user_events` entries were created for both click types

Suggested SQL:

```sql
SELECT ddl.type, ddl.status, ddl.local_date, ddl.sent_at, ddl.responded_at, a.text
FROM daily_delivery_logs ddl
LEFT JOIN actions a ON a.id = ddl.action_id
JOIN users u ON u.id = ddl.user_id
WHERE u.email = 'qa+stripe-test@example.com'
ORDER BY ddl.sent_at DESC;

SELECT ue.event_type, ue.created_at, a.text
FROM user_events ue
LEFT JOIN actions a ON a.id = ue.action_id
JOIN users u ON u.id = ue.user_id
WHERE u.email = 'qa+stripe-test@example.com'
ORDER BY ue.created_at DESC;
```

## Step 8 - Weekly cron test

- [ ] Manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://[domain]/api/cron/weekly-email`
- [ ] Confirm weekly summary email received

## Step 9 - Monthly cron test

- [ ] Manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://[domain]/api/cron/monthly-email`
- [ ] Confirm monthly clarity email received
- [ ] Trigger daily cron again -> confirm user is skipped when a same-day monthly email already exists

## Step 10 - Subscription cancellation

- [ ] In Stripe test dashboard, cancel the test subscription
- [ ] Confirm `customer.subscription.deleted` webhook delivered with `200`
- [ ] Check database: user subscription status updated to `canceled`

Suggested SQL:

```sql
SELECT s.user_id, s.plan, s.status, s.stripe_customer_id, s.stripe_subscription_id
FROM subscriptions s
JOIN users u ON u.id = s.user_id
WHERE u.email = 'qa+stripe-test@example.com';
```

## Automation Helpers

- Cron helper: `BASE_URL=https://[domain] CRON_SECRET=... ./scripts/test-cron.sh`
- Webhook helper: `./scripts/test-webhook.sh`

If using Stripe CLI against a local server, start forwarding first:

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

If using Stripe CLI against the deployed site, forward to:

```bash
stripe listen --forward-to https://[domain]/api/webhooks/stripe
```
