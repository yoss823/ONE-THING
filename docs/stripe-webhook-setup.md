# ONE THING Stripe Webhook Setup

Use this guide to register the Stripe webhook endpoint that activates subscriptions for ONE THING.

## Canonical Production Endpoint

The current custom production domain is:

`https://onestep.nanocorp.app/api/webhooks/stripe`

Use that URL for the live production webhook. If you intentionally validate against a Vercel preview deployment first, replace it with that preview deployment URL for the test-only endpoint.

## Webhook Handler Status

`app/api/webhooks/stripe/route.ts` already matches the required Stripe signature verification contract:

- It reads the raw request body with `request.text()`.
- It reads the `stripe-signature` header.
- It calls `stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)`.
- It handles `checkout.session.completed`.
- It handles `customer.subscription.updated`.
- It handles `customer.subscription.deleted`.
- It returns `400` when signature verification fails.
- It returns `200` on successful processing.

No code change was required in the webhook route during this task.

## Test Mode Registration

Do this first in Stripe test mode.

1. Go to `https://dashboard.stripe.com/test/webhooks`.
2. Click `Add endpoint`.
3. For `Endpoint URL`, enter:

   `https://onestep.nanocorp.app/api/webhooks/stripe`

   If you want to validate on a preview deployment before touching production, use the preview deployment URL instead.
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click `Add endpoint`.
6. Open the new endpoint.
7. Under `Signing secret`, click `Reveal`.
8. Copy the `whsec_...` value. This is `STRIPE_WEBHOOK_SECRET`.
9. Add that secret to Vercel immediately in the environment that serves the URL from step 3:
   - `Preview` if you registered a preview deployment URL
   - `Production` only if you registered the production domain while the app is still using Stripe test keys
10. Save the environment variable and redeploy that environment before testing events against it.

## Live Mode Registration

After test mode is validated, register the live endpoint.

1. Go to `https://dashboard.stripe.com/webhooks`.
2. Click `Add endpoint`.
3. For `Endpoint URL`, enter:

   `https://onestep.nanocorp.app/api/webhooks/stripe`

4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click `Add endpoint`.
6. Open the new endpoint.
7. Under `Signing secret`, click `Reveal`.
8. Copy the new live `whsec_...` value.
9. Update `STRIPE_WEBHOOK_SECRET` in Vercel for the `Production` environment only.
10. Redeploy Production so the live webhook secret is active.

Important:

- Test and live webhook secrets are different.
- Do not reuse the test-mode signing secret in Production after live cutover.

## Where To Store `STRIPE_WEBHOOK_SECRET`

Use the Vercel project settings UI:

1. Open `Vercel Dashboard -> Project -> Settings -> Environment Variables`.
2. Add or update `STRIPE_WEBHOOK_SECRET`.
3. Scope it to the correct environment:
   - `Preview` for a preview deployment endpoint
   - `Production` for the live custom-domain endpoint
4. Redeploy the affected environment.

## Local Stripe CLI Testing

Use Stripe CLI to test the webhook route locally.

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI will output a whsec_... — use this as STRIPE_WEBHOOK_SECRET in .env.local

# Trigger a test event
stripe trigger checkout.session.completed
```

After adding the CLI-provided `whsec_...` to `.env.local`, restart `npm run dev` so the local webhook route picks up the new secret.

## Post-Setup Check

After the secret is stored in Vercel and the deployment is refreshed:

1. Send a `checkout.session.completed` test event from Stripe test mode.
2. Confirm the webhook endpoint returns HTTP `200`.
3. Check the app logs if Stripe reports a signature verification error or a `400` response.
