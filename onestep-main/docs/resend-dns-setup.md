# Resend DNS Setup for `onething.so`

Use this guide to verify `onething.so` in Resend and send mail from `ONE THING <hello@onething.so>`.

Important:

- Add exactly the records Resend shows for `onething.so` in the dashboard.
- Different DNS providers want either the full hostname (`send.onething.so`) or just the host label (`send`). Follow the provider-specific instructions below.
- Resend's current domain setup commonly uses the `send` subdomain for SPF and MX, even when you are sending from `hello@onething.so`. If the Resend dashboard shows a different hostname, trust the dashboard.

## Step 1 - Add the domain in Resend

1. Go to `https://resend.com/domains`.
2. Click `Add Domain`.
3. Enter `onething.so`.
4. Select region:
   - `US East` is the recommended default for lowest latency.
5. Click `Add`.
6. Resend will display the DNS records required for this domain. Copy every record exactly as shown.

## Step 2 - Add the DNS records

Resend typically asks for these record categories for a sending domain:

| Purpose | Type | Typical Name | Typical Value |
| --- | --- | --- | --- |
| DKIM | `TXT` or `CNAME` | `resend._domainkey.onething.so` or provider host `resend._domainkey` | Resend-provided DKIM value |
| SPF / Return-Path | `TXT` | Usually `send.onething.so` or provider host `send` | `v=spf1 include:amazonses.com ~all` |
| Bounce handling | `MX` | Usually `send.onething.so` or provider host `send` | Resend-provided MX target, usually `feedback-smtp.<region>.amazonses.com` with priority `10` |
| Tracking (optional) | `CNAME` | Resend-provided tracking subdomain | Resend-provided tracking target |

Notes:

- Some older examples show apex records like `onething.so` for SPF or MX. Resend's current setup usually uses the `send` subdomain instead.
- Some accounts show a single DKIM `TXT` record; others show DKIM `CNAME` records. Add exactly what Resend shows in the dashboard.
- If you enable open/click tracking later, Resend will provide an additional `CNAME` record and may also require a `CAA` record if your DNS already uses CAA.

### Cloudflare

1. Open Cloudflare for `onething.so`.
2. Go to `DNS` -> `Records`.
3. If Resend offers `Sign in to Cloudflare`, you can use that automatic flow instead of manual entry.
4. For manual entry:
   - Click `Add record`.
   - Create each Resend record one at a time.
   - For the `Name` field, use only the host label:
     - `send` instead of `send.onething.so`
     - `resend._domainkey` instead of `resend._domainkey.onething.so`
   - For `MX`, copy the Resend target into `Mail server` and set `Priority` to the Resend value, typically `10`.
   - For `TXT`, paste the value exactly, including quotes if Cloudflare preserves them.
   - For any `CNAME`, set `Proxy status` to `DNS only`, not proxied.
   - Leave TTL at `Auto` unless your DNS policy requires something else.

### Namecheap

1. Open Namecheap and select `Domain List` -> `Manage` for `onething.so`.
2. Open the `Advanced DNS` tab.
3. In `Host Records`, add each Resend record:
   - Use `send` for SPF and MX hostnames when Resend shows `send.onething.so`.
   - Use `resend._domainkey` for the DKIM hostname when Resend shows the full FQDN.
   - For `MX`, enter the Resend hostname in `Value`, set `Priority` to the Resend value, and keep the default TTL unless you need a specific one.
   - For `TXT`, paste the value exactly as shown in Resend.
   - For `CNAME`, use the host label only and paste the target from Resend exactly.
4. Save each record after entry.

### GoDaddy

1. Open GoDaddy and go to `DNS` for `onething.so`.
2. If Resend offers `Auto Configure`, you can use that automatic flow instead of manual entry.
3. For manual entry:
   - Click `Add New Record`.
   - Enter each Resend record one at a time.
   - Use the short host label in `Name`:
     - `send`
     - `resend._domainkey`
     - the tracking subdomain host only
   - For `MX`, paste the Resend destination into `Value`, set `Priority` to the Resend value, and use TTL `600` or GoDaddy's default.
   - For `TXT`, paste the SPF or DKIM value exactly as shown.
   - For `CNAME`, paste the destination exactly as shown by Resend.
4. Save each record.

### Generic provider instructions

If DNS is managed somewhere else:

1. Find the DNS zone editor for `onething.so`.
2. Add every record from Resend exactly as shown.
3. If your provider auto-appends the domain name, enter only the host label:
   - `send`
   - `resend._domainkey`
   - the tracking subdomain host
4. If your provider expects a fully qualified domain name, enter the full Resend hostname instead.
5. For `MX`, make sure:
   - the host is correct
   - the priority matches Resend
   - the region in the MX target matches the Resend region you selected
6. For `CNAME`, do not enable proxying or CDN features.
7. If the provider turns `feedback-smtp.us-east-1.amazonses.com` into `feedback-smtp.us-east-1.amazonses.com.onething.so`, add a trailing `.` to the target and save again.

## Step 3 - Verify the domain

1. Return to Resend -> `Domains`.
2. Find `onething.so`.
3. Click `Verify`.
4. DNS propagation usually finishes within `10-60 minutes`, though many providers update faster.
5. The status should move from `Pending` to `Verified`.

If verification fails:

- Confirm you added the records at the DNS provider that actually controls the nameservers for `onething.so`.
- Confirm the MX record region matches the region selected in Resend.
- Confirm hostnames were entered in the right format for your provider (`send` vs full FQDN).
- Confirm the tracking `CNAME` is not proxied.

## Step 4 - Get the API key

1. In Resend, go to `API Keys`.
2. Create a new key with `Sending access`.
3. Copy the `re_...` value immediately.
4. Add it to Vercel as `RESEND_API_KEY`.

NanoCorp CLI example:

```bash
echo '[{"key":"RESEND_API_KEY","value":"re_..."}]' | nanocorp vercel env set
```

## Step 5 - Confirm sender addresses in code

The repo now uses a shared sender constant:

- `lib/email/sender.ts`

The sending paths that already use `ONE THING <hello@onething.so>` are:

- `lib/email/sendDailyAction.tsx`
- `lib/email/sendMonthlyClarity.tsx`
- `app/api/cron/weekly-email/route.ts`

No additional sender-domain change is required after Resend verifies `onething.so`.

## Final checklist

- `onething.so` added in Resend
- All Resend DNS records added in the correct DNS provider
- Domain status shows `Verified`
- `RESEND_API_KEY` added to Vercel
- App senders use `ONE THING <hello@onething.so>`
