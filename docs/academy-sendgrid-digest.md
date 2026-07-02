# Academy weekly digest — SendGrid setup

MedScope Academy weekly digest uses the v28 email engine. Without `SENDGRID_API_KEY` in `.env.local`, digest runs in **log-only** mode (no emails sent).

## Required env vars (`.env.local` / Vercel)

| Variable | Purpose |
|----------|---------|
| `SENDGRID_API_KEY` | SendGrid API key (starts with `SG.`) |
| `SENDGRID_FROM_EMAIL` | Verified sender, e.g. `academy@medscopeglobal.com` |
| `SENDGRID_ACADEMY_LIST_ID` | Optional Marketing list for bulk digest |
| `ACADEMY_NEWSLETTER_TO` | Fallback single recipient when no list ID |

## Cron

- Weekly: `GET /api/cron/academy-weekly` with `CRON_SECRET`
- Digest builder includes **videokurzy** (courses with `metadata.has_video`)

## Verify

```bash
node scripts/academy-v35-smoke.mjs
curl https://medscopeglobal.com/api/academy/health
# digestDeliveryMode: "sendgrid" when key is set
```

## SMTP fallback

If SendGrid fails, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — see `.env.example`.
