# MedScopeGlobal

Production-grade Next.js platform for sharing medical knowledge, articles, events, and B2B partnership leads.

## Quick start

```bash
npm ci
npm run prisma:generate
npm run dev
```

## Environment

```bash
NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
DATABASE_URL=postgresql://...
CONTACT_EMAIL=info@medscopeglobal.com
ADS_EMAIL=ads@medscopeglobal.com
EMAIL_WEBHOOK_URL=
```

If `DATABASE_URL` is not set, write APIs still validate, rate limit, log, and return success so preview deployments remain usable.
