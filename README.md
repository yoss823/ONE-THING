# onestep
Repository for OneStep - We are building a subscription-based product called ONE THING. Each morning at 8am, users receive by email ONE simple, concrete action per selected category (5–15 minutes max), so they never have to

## Cron Email Delivery

The Vercel daily email worker runs at `/api/cron/daily-email` every 10 minutes and requires:

- `CRON_SECRET` for the `Authorization: Bearer ...` header Vercel sends
- `RESEND_API_KEY` for outbound email delivery

The route only sends when it is 8:00 AM through 8:10 AM in the subscriber's stored IANA timezone.

### Production Monitoring Routine

Run a quick production cron check after every deploy:

```bash
BASE_URL=https://your-domain.vercel.app CRON_SECRET=your-secret ./scripts/test-cron.sh
```

What to look for in responses:

- Daily: `ok: true`, `kind: "daily"`, and no endpoint `error`.
- Monthly: `ok: true`, `kind: "monthly_clarity"`, and no endpoint `error`.
- Weekly: no endpoint `error`.
- If `errors` is non-empty, inspect user-specific delivery failures and retry next cron window.
