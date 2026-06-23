# Production environment checklist

Use this list when configuring **Vercel → Settings → Environment Variables** (Production) or `.env.production.local`. Copy names from `.env.example` and `.env.production.local.example`.

## Required (site will not run correctly without these)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (auth + data) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase (ingestion, admin, RLS bypass) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, OG tags, redirects (`https://medscopeglobal.com`) |
| `DATABASE_URL` | Runtime DB (PgBouncer pooler, port 6543) |
| `DIRECT_URL` | Prisma migrations (direct Postgres, port 5432) |
| `CRON_SECRET` | Protects `/api/cron/*` ingest and scheduled jobs |

## Required for paid features

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Subscriptions, Academy marketplace |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe checkout |

## Required for AI (at least one provider)

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Primary free-tier LLM (recommended) |
| `OPENAI_API_KEY` | Fallback ingestion + chat (`OPENAI_MODEL` optional) |
| `GEMINI_API_KEY` | Optional Gemini fallback (`GEMINI_MODEL` optional) |

## Security & forms

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile server verification |
| `AUTH_SECRET` | Session/auth signing (if using NextAuth-style secrets) |

## Email & notifications

| Variable | Purpose |
|----------|---------|
| `ADMIN_NOTIFY_EMAIL` | Admin alerts (ad campaigns, ops) |
| `CONTACT_EMAIL` | Contact form recipient (optional override) |
| `ADS_EMAIL` | Advertising inquiries (optional override) |
| `RESEND_API_KEY` | Outbound transactional email via Resend |

## Ingestion & locale

| Variable | Purpose |
|----------|---------|
| `INGESTION_LOCALE` | Default locale for ingested articles (`cs`) |
| `DEFAULT_SITE_LOCALE` | Site default locale (`cs`) |
| `NCBI_CONTACT_EMAIL` | PubMed E-utilities contact (reduces 429s) |
| `NCBI_TOOL` | PubMed tool name (`medscopeglobal`) |
| `NCBI_API_KEY` | Optional PubMed API key |
| `INGESTION_AUTHOR_ID` | Fixed author UUID for ingested articles (optional) |
| `INGEST_MAX_ARTICLES` | Cap per ingest run (optional) |

## Analytics (optional)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |

## Academy video / marketing (optional modules)

| Variable | Purpose |
|----------|---------|
| `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID` | HeyGen video generation |
| `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET` | Mux video hosting |
| `SYNTHESIA_API_KEY` | Synthesia avatar videos |
| `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_ACADEMY_LIST_ID` | Academy newsletter |
| `SMTP_HOST` (+ related SMTP vars) | Alternative email delivery |

## Translation (optional)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_TRANSLATE_KEY` | Fallback article translation |

## Deploy / CI (local or GitHub Actions only — never commit secrets)

| Variable | Purpose |
|----------|---------|
| `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID` | Vercel CLI deploy |
| `GITHUB_TOKEN` | Push-triggered deploy scripts |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` | `npm run db:apply-pg` automation |

## Verification commands

```bash
npm run db:verify
npm run build
```

After deploy, confirm:

- `https://medscopeglobal.com/.well-known/security.txt` returns 200
- Canonical tags use `NEXT_PUBLIC_SITE_URL` (not Vercel preview URL)
- `/api/cron/ingest` rejects requests without `CRON_SECRET`
