# onestep
Repository for OneStep - We are building a subscription-based product called ONE THING. Each morning at 8am, users receive by email ONE simple, concrete action per selected category (5–15 minutes max), so they never have to

## Cron Email Delivery

The Vercel daily email worker runs at `/api/cron/daily-email` every 10 minutes and requires:

- `CRON_SECRET` for the `Authorization: Bearer ...` header Vercel sends
- `RESEND_API_KEY` for outbound email delivery

The route only sends when it is 8:00 AM through 8:10 AM in the subscriber's stored IANA timezone.
