# ONE THING — Complete Activation Guide

> **Goal:** Take a fresh Vercel account from zero to first test payment in one sitting.
> Follow every step in order. Do not skip ahead.

---

## SECTION 1: Import GitHub Repo into Vercel

- [ ] Go to [vercel.com](https://vercel.com) → click **Add New…** → **Project**
- [ ] Click **Import Git Repository**
- [ ] Authorize Vercel to access your GitHub account if prompted
- [ ] Find and select the **ONE THING** repository (nanocorp-hq/onestep or your fork)
- [ ] Under **Configure Project**, set:
  - **Framework Preset:** `Next.js`
  - **Root Directory:** `/` (leave as-is — `next.config.ts` is at repo root)
- [ ] ⚠️ **DO NOT click Deploy yet.** Scroll down to "Environment Variables" first.

---

## SECTION 2: Environment Variables

Add all variables below in Vercel's **Environment Variables** panel **before** clicking Deploy.

For each variable: enter the **Name**, paste the **Value**, leave Environment as `Production, Preview, Development`, click **Add**.

---

### 2.1 Database (Supabase)

#### `DATABASE_URL`
Pooled connection string for the app (used by Prisma at runtime).
- Go to [supabase.com](https://supabase.com) → your project → **Settings** → **Database** → **Connection string** → select **URI** tab → choose **Transaction pooler (port 6543)**

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### `DIRECT_URL`
Direct (non-pooled) connection used for Prisma migrations.
- Same page in Supabase → choose **Direct connection (port 5432)**

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### `NEXT_PUBLIC_SUPABASE_URL`
- Supabase → **Settings** → **API** → **Project URL**

```
https://[PROJECT-REF].supabase.co
```

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase → **Settings** → **API** → **Project API Keys** → `anon public`

```
eyJ...  (long JWT string)
```

#### `SUPABASE_SERVICE_ROLE_KEY`
- Supabase → **Settings** → **API** → **Project API Keys** → `service_role` (⚠️ keep secret)

```
eyJ...  (long JWT string)
```

---

### 2.2 Stripe

#### `STRIPE_SECRET_KEY`
- [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **API keys** → **Secret key** → click **Reveal**
- Use **test mode** key for now (starts with `sk_test_`)

```
sk_test_...
```

#### `STRIPE_WEBHOOK_SECRET`
⚠️ You do not have this value yet — it is generated in Section 4.
Add a placeholder now. You will return here to update it after Section 4.

```
whsec_placeholder
```

#### `STRIPE_PRICE_ID_1CAT`
Hardcode exactly:

```
price_1TOkW68Jf6UbCUSKza0ksnKB
```

#### `STRIPE_PRICE_ID_2CAT`
Hardcode exactly:

```
price_1TOkXA8Jf6UbCUSKaHcYRnzA
```

#### `STRIPE_PRICE_ID_3CAT`
Hardcode exactly:

```
price_1TOkY18Jf6UbCUSKaJykyfqT
```

#### `STRIPE_BILLING_PORTAL_CONFIGURATION_ID`
- Stripe Dashboard → **Settings** → **Billing** → **Customer portal** → copy the configuration ID

```
bpc_...
```

---

### 2.3 Email (Resend)

#### `RESEND_API_KEY`
- [resend.com](https://resend.com) → **API Keys** → **Create API Key** → copy

```
re_...
```

#### `RESEND_WEBHOOK_SECRET`
⚠️ Resend webhook secret (for inbound email event verification). If you have not set up a Resend webhook yet, add a placeholder for now.

```
replace-me
```

#### `EMAIL_REPLY_TO`
Hardcode exactly:

```
hello@onething.so
```

---

### 2.4 App Config

#### `APP_URL`
⚠️ You don't have your Vercel URL yet. Add this placeholder now. **You will update it after Section 3.**

```
https://your-deployment.vercel.app
```

#### `NEXT_PUBLIC_BASE_URL`
Same placeholder — update after Section 3.

```
https://your-deployment.vercel.app
```

#### `CRON_SECRET`
Generate a random secret. Run this command in your terminal and copy the output:

```bash
openssl rand -hex 16
```

Paste the output (a 32-character hex string) as the value.

#### `ADMIN_EXPORT_TOKEN`
Used for admin data export endpoints. Generate a separate random secret:

```bash
openssl rand -hex 16
```

---

### 2.5 Final Variable Checklist

Before clicking Deploy, confirm all 16 variables are set:

- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET` *(placeholder — update after Section 4)*
- [ ] `STRIPE_PRICE_ID_1CAT`
- [ ] `STRIPE_PRICE_ID_2CAT`
- [ ] `STRIPE_PRICE_ID_3CAT`
- [ ] `STRIPE_BILLING_PORTAL_CONFIGURATION_ID`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_WEBHOOK_SECRET` *(placeholder ok for now)*
- [ ] `EMAIL_REPLY_TO`
- [ ] `APP_URL` *(placeholder — update after Section 3)*
- [ ] `NEXT_PUBLIC_BASE_URL` *(placeholder — update after Section 3)*
- [ ] `CRON_SECRET`
- [ ] `ADMIN_EXPORT_TOKEN`

---

## SECTION 3: First Deploy

- [ ] Click **Deploy**
- [ ] Wait for the build to complete (typically 2–4 minutes)
- [ ] On the success screen, copy the deployment URL — it looks like:

```
https://onething-abc123xyz.vercel.app
```

- [ ] Go to Vercel → your project → **Settings** → **Environment Variables**
- [ ] Find `APP_URL` → click **Edit** → replace the placeholder with your real URL → **Save**
- [ ] Find `NEXT_PUBLIC_BASE_URL` → click **Edit** → replace the placeholder with the same URL → **Save**

⚠️ **You must redeploy for these values to take effect.**

- [ ] Go to **Deployments** tab → find the latest deployment → click **…** → **Redeploy**
- [ ] Wait for redeployment to complete

---

## SECTION 4: Stripe Webhook Registration (Test Mode)

⚠️ Complete this before the E2E test. Payments will not activate subscriptions without a working webhook.

- [ ] Go to [Stripe Dashboard](https://dashboard.stripe.com) → make sure you are in **Test mode** (toggle in top-left)
- [ ] Go to **Developers** → **Webhooks** → click **Add endpoint**
- [ ] In the **Endpoint URL** field, enter your deployment URL + the webhook path:

```
https://[your-deployment-url]/api/webhooks/stripe
```

*(Replace `[your-deployment-url]` with your actual Vercel URL from Section 3)*

- [ ] Under **Select events to listen to**, add these three events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] Click **Add endpoint**
- [ ] On the webhook detail page, find **Signing secret** → click **Reveal**
- [ ] Copy the `whsec_...` value

Now update the env var in Vercel:

- [ ] Go to Vercel → your project → **Settings** → **Environment Variables**
- [ ] Find `STRIPE_WEBHOOK_SECRET` → click **Edit** → replace `whsec_placeholder` with the real `whsec_...` value → **Save**

⚠️ **You must redeploy again for this to take effect.**

- [ ] Go to **Deployments** → latest deployment → **…** → **Redeploy**
- [ ] Wait for redeployment to complete

---

## SECTION 5: Resend Domain Verification (onething.so)

> **⚠️ DNS verification is NOT required to run the E2E test.** Resend can send emails from a sandbox domain while DNS is pending. You can proceed to Section 6 immediately and complete DNS setup in parallel.

- [ ] Go to [resend.com](https://resend.com) → **Domains** → **Add Domain**
- [ ] Enter: **`onething.so`**
- [ ] Resend will display 3–4 DNS records (mix of TXT and CNAME records)
- [ ] Log in to your domain registrar (Cloudflare, Namecheap, GoDaddy, etc.)
- [ ] Add each DNS record **exactly** as shown in Resend — copy/paste the Name and Value fields, do not type them
- [ ] Return to Resend → click **Verify Domain**
  - On Cloudflare: typically verified within **5 minutes**
  - On other registrars: may take up to **24 hours**
- [ ] Once the status shows **Verified**, emails from `hello@onething.so` will deliver with full authentication

---

## SECTION 6: End-to-End Test Checklist

Use Stripe test card **`4242 4242 4242 4242`** to simulate a real payment.

### 6.1 User Journey

- [ ] **1.** Open your deployment URL in a browser (incognito window recommended)

```
https://[your-deployment-url].vercel.app
```

- [ ] **2.** Click the primary **CTA button** on the landing page (e.g., "Get Started" or "Start Today")
- [ ] **3.** Complete the **4-step onboarding**:
  1. Pick a **category** (e.g., Fitness, Focus, Sleep)
  2. Select your **energy level**
  3. Choose your **time preference** (morning / evening)
  4. Enter your **email address**
- [ ] **4.** Confirm you are redirected to **Stripe Checkout** (url starts with `checkout.stripe.com`)
- [ ] **5.** Enter the test card details:
  - **Card number:** `4242 4242 4242 4242`
  - **Expiry:** any future date (e.g., `12/28`)
  - **CVC:** any 3 digits (e.g., `123`)
  - **ZIP:** any 5 digits (e.g., `10001`)
- [ ] **6.** Click **Subscribe** / **Pay**
- [ ] **7.** Confirm redirect to `/welcome` page showing:

> **"Your first email arrives tomorrow at 8:00 AM"**

---

### 6.2 Backend Verification

- [ ] **8.** Go to [Stripe Dashboard](https://dashboard.stripe.com) (Test mode) → **Customers**
  - Confirm a new customer record was created with your test email
  - Confirm the subscription status is **Active**

- [ ] **9.** Go to [Supabase](https://supabase.com) → your project → **Table Editor**
  - Open the **`User`** table → confirm a row exists with your test email
  - Open the **`Subscription`** table → confirm a row exists with status **`active`**

---

### 6.3 Email Delivery Test

- [ ] **10.** Trigger the daily email cron manually (replace `[url]` and `[CRON_SECRET]` with your actual values):

```bash
curl -X POST https://[url]/api/cron/daily-email \
  -H "Authorization: Bearer [CRON_SECRET]"
```

Expected response:

```json
{ "sent": 1, "skippedMonthly": 0 }
```

- [ ] **11.** Check the inbox for your test email address
  - You should receive the **daily action email** from `hello@onething.so`
  - *(If Resend DNS is not yet verified, it will arrive from Resend's sandbox domain)*

- [ ] **12.** In the email, click the **✅ Done** or **⏸ Skip** link
  - Confirm the link loads the `/tracked` page without errors

---

### 6.4 All checks passed ✅

If all 12 steps completed successfully, the product is working end-to-end.

---

## SECTION 7: Go-Live Checklist (After Successful Test)

When you are ready to accept real payments, follow these steps **in order**:

- [ ] **1.** In Vercel → **Environment Variables**:
  - Update `STRIPE_SECRET_KEY` → replace `sk_test_...` with **`sk_live_...`**
  - *(Get live key from Stripe Dashboard → toggle to Live mode → Developers → API Keys)*

- [ ] **2.** In Vercel → **Environment Variables**:
  - Update `NEXT_PUBLIC_BASE_URL` → set to **`https://onething.so`** (your custom domain)
  - Update `APP_URL` → set to **`https://onething.so`**

- [ ] **3.** Register a **new webhook in Stripe Live mode**:
  - Stripe Dashboard → switch to **Live mode** → **Developers** → **Webhooks** → **Add endpoint**
  - Same endpoint URL: `https://onething.so/api/webhooks/stripe`
  - Same three events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Copy the new `whsec_...` signing secret

- [ ] **4.** In Vercel → **Environment Variables**:
  - Update `STRIPE_WEBHOOK_SECRET` with the **live** `whsec_...` value

- [ ] **5.** Trigger a **Redeploy** in Vercel (all env var changes require a redeploy to take effect)

- [ ] **6.** Confirm [Resend domain verification](#section-5-resend-domain-verification-onethingso) for `onething.so` is **Verified** (green checkmark in Resend dashboard)

- [ ] **7.** Visit **`https://onething.so`** → complete one real test purchase with a real card to confirm end-to-end in live mode

**Product is live. You are ready for real payments. 🎉**

---

## Quick Reference

| What | Where |
|---|---|
| Stripe Dashboard | [dashboard.stripe.com](https://dashboard.stripe.com) |
| Supabase Dashboard | [supabase.com/dashboard](https://supabase.com/dashboard) |
| Resend Dashboard | [resend.com](https://resend.com) |
| Vercel Dashboard | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Stripe test card | `4242 4242 4242 4242` |
| Webhook path | `/api/webhooks/stripe` |
| Daily email cron | `/api/cron/daily-email` |
| Post-payment page | `/welcome` |
| Email tracking page | `/tracked` |

---

*Last updated: 2026-04-22*
