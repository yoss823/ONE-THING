# ONE THING Environment Setup

Configure environment variables in `Vercel Dashboard -> Project -> Settings -> Environment Variables`.

Set every key for `Production`, `Preview`, and `Development` unless a target-specific note says otherwise.

Rules:

- Do not commit real secrets.
- `NEXT_PUBLIC_` variables are public and are exposed to the browser.
- All other variables are server-only.
- `NEXT_PUBLIC_BASE_URL` must match the exact deployed base URL for that target and must not have a trailing slash.
- `prisma/schema.prisma` already expects both `DATABASE_URL` and `DIRECT_URL`, so both must be configured.

## Required Variables

| Variable | Public | Where to get it | Notes |
| --- | --- | --- | --- |
| `APP_URL` | No | Set this to the app base URL for the target environment. | Production should use `https://onestep.nanocorp.app`. For local development, use `http://localhost:3000`. No trailing slash. |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set this to the public app base URL for the target environment. | Must match the exact deployed URL used for checkout success, cancel, and email links. No trailing slash. |
| `ADMIN_EXPORT_TOKEN` | No | Generate a long random secret with a password manager or `openssl rand -hex 16`. | Server-only admin token from `.env.example`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase -> Project Settings -> API -> Project URL. | Public Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase -> Project Settings -> API -> anon public key. | Safe for browser use. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase -> Project Settings -> API -> service_role key. | Server-only. Never expose this in the client. |
| `DATABASE_URL` | No | Supabase -> Settings -> Database -> Connection string -> URI. | Use the pooled Postgres connection string for the app and Prisma Client. |
| `DIRECT_URL` | No | Supabase -> Settings -> Database -> Direct connection. | Required by Prisma for migrations and direct database access. |
| `CRON_SECRET` | No | Generate with `openssl rand -hex 16`. | Used for `Authorization: Bearer ...` checks on cron routes. |
| `STRIPE_SECRET_KEY` | No | Stripe -> Developers -> API keys. | Start with `sk_test_...` until the live checkout flow is verified, then swap to `sk_live_...`. |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe -> Developers -> Webhooks -> select the endpoint -> Signing secret. | This is only available after the Stripe webhook endpoint is registered. Test and live webhook secrets are different. |
| `STRIPE_PRICE_ID_1CAT` | No | Stripe product setup. | Current test value: `price_1TOkW68Jf6UbCUSKza0ksnKB`. Replace with the live price id at launch. |
| `STRIPE_PRICE_ID_2CAT` | No | Stripe product setup. | Current test value: `price_1TOkXA8Jf6UbCUSKaHcYRnzA`. Replace with the live price id at launch. |
| `STRIPE_PRICE_ID_3CAT` | No | Stripe product setup. | Current test value: `price_1TOkY18Jf6UbCUSKaJykyfqT`. Replace with the live price id at launch. |
| `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` | No | Stripe -> Settings -> Billing -> Customer portal configuration. | Starts with `bpc_...`. Often differs between test and live mode. |
| `RESEND_API_KEY` | No | Resend -> API Keys. | Server-only email delivery key. |
| `RESEND_WEBHOOK_SECRET` | No | Resend -> Webhooks -> endpoint secret. | Needed for the Resend webhook route. |
| `EMAIL_REPLY_TO` | No | Use the inbox the team monitors for replies. | Current recommended value: `hello@onething.so`. |

## Stripe Test to Live Cutover

When switching Stripe from test mode to live mode, update all of the following:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_1CAT`
- `STRIPE_PRICE_ID_2CAT`
- `STRIPE_PRICE_ID_3CAT`

In practice, `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` may also need to change if the live billing portal uses a different configuration.

## Recommended Target Values

- `Production`
  - `APP_URL=https://onestep.nanocorp.app`
  - `NEXT_PUBLIC_BASE_URL=https://onestep.nanocorp.app`
- `Preview`
  - Use the preview deployment alias or stable preview URL for both `APP_URL` and `NEXT_PUBLIC_BASE_URL`.
  - Avoid using the production domain for preview if you need preview-specific Stripe callbacks or email links.
- `Development`
  - `APP_URL=http://localhost:3000`
  - `NEXT_PUBLIC_BASE_URL=http://localhost:3000`

## CRON_SECRET Command

Generate the cron secret with:

```bash
openssl rand -hex 16
```

## Current Vercel Status Checked During This Task

`nanocorp vercel env list` showed:

- `DATABASE_URL` is already present for `production`, `preview`, and `development`.
- `CRON_SECRET`, `NEXT_PUBLIC_BASE_URL`, and `STRIPE_PRICE_ID_{1,2,3}CAT` are present for `production` and `preview`.
- `APP_URL` was missing and was added for `production` and `preview`.
- Remaining variables in this guide still need real values from Stripe, Supabase, and Resend before they can be configured.

The NanoCorp Vercel CLI currently updates `production` and `preview`, but it did not expose a working way to add the missing `development` targets during this task.
