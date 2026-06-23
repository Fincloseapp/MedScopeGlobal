# ENV Manifest — MedScopeGlobal (Vercel-ready)

Generated from codebase scan (`process.env.*`, `NEXT_PUBLIC_*`, `Deno.env.get`, `.env.example`).  
Use this as the single checklist when configuring **Vercel → Project → Settings → Environment Variables** (Production, Preview, Development).

**Sync script keys:** `scripts/env-keys.mjs` → `VERCEL_SYNC_KEYS` (subset auto-synced by deploy scripts).

**Validate locally:** `node scripts/validate-production-env.mjs`

---

## Required (production)

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL (`https://*.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon/public key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role — bypasses RLS; **never** expose to client |
| `NEXT_PUBLIC_SITE_URL` | All | Canonical site URL, e.g. `https://medscopeglobal.com` |
| `CRON_SECRET` | Server only | Bearer/query secret for `/api/cron/*` (≥16 chars) |

---

## Stripe (payments / VIP / marketplace)

| Variable | Scope | Required when |
|----------|-------|---------------|
| `STRIPE_SECRET_KEY` | Server | Checkout, webhooks, marketplace |
| `STRIPE_WEBHOOK_SECRET` | Server | `/api/stripe/webhook` signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Pricing / checkout UI |

**Used in:** `app/api/v27/checkout/route.ts`, `app/api/stripe/webhook/route.ts`, `app/api/academy/marketplace/checkout/route.ts`, `lib/academy/marketplace-purchase.ts`

---

## AI providers (ingestion, translation, Academy)

| Variable | Scope | Notes |
|----------|-------|-------|
| `GROQ_API_KEY` | Server | Primary free-tier LLM (`gsk_…`) |
| `GROQ_MODEL_PRIMARY` | Server | Default: `llama-3.3-70b-versatile` |
| `GROQ_MODEL_FALLBACK` | Server | Default: `llama-3.1-8b-instant` |
| `GROQ_MODEL_FALLBACK_2` | Server | Default: `openai/gpt-oss-20b` |
| `OPENAI_API_KEY` | Server | Must start with `sk-` |
| `OPENAI_MODEL` | Server | Default: `gpt-4o-mini` |
| `OPENAI_TTS_MODEL` | Server | Academy TTS video |
| `OPENAI_TTS_VOICE` | Server | Default: `alloy` |
| `OPEN_API_KEY` | Server | Legacy alias for OpenAI |
| `GEMINI_API_KEY` | Server | Google AI Studio |
| `GEMINI_MODEL` | Server | Default: `gemini-2.0-flash` |
| `GOOGLE_AI_API_KEY` | Server | Alias |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Server | Alias |
| `GOOGLE_TRANSLATE_KEY` | Server | Article translation fallback |
| `AI_MODEL` | Server | Override model slug |
| `AI_MODEL_PROVIDER` | Server | Provider selection (sync list) |

**At least one** of `GROQ_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `GOOGLE_TRANSLATE_KEY` is required for non-Czech content.

---

## Email & newsletters

| Variable | Scope | Notes |
|----------|-------|-------|
| `SENDGRID_API_KEY` | Server | Primary transactional + Academy digest |
| `SENDGRID_FROM_EMAIL` | Server | Default: `noreply@medscopeglobal.com` |
| `SENDGRID_ACADEMY_LIST_ID` | Server | Marketing list for bulk digest |
| `SENDGRID_WEBHOOK_SECRET` | Server | Event webhook auth |
| `ACADEMY_NEWSLETTER_TO` | Server | Fallback single recipient |
| `SMTP_HOST` | Server | SMTP fallback when SendGrid unavailable |
| `SMTP_PORT` | Server | Default: `587` |
| `SMTP_USER` | Server | |
| `SMTP_PASS` | Server | |
| `SMTP_FROM_EMAIL` | Server | |
| `SMTP_SECURE` | Server | `true` for port 465 |
| `RESEND_API_KEY` | Server | Contact form (`lib/services/contact-mail.ts`) |
| `CONTACT_EMAIL` | Server | Contact form recipient |
| `ADS_EMAIL` | Server | Ad inquiry recipient |
| `ADMIN_NOTIFY_EMAIL` | Server | Admin alerts; default in code |
| `NEWSLETTER_PUBLIC_LIST` | Server | AI newsletter segments |
| `NEWSLETTER_PUBLIC_TO` | Server | |
| `NEWSLETTER_STUDENTS_LIST` | Server | |
| `NEWSLETTER_STUDENTS_TO` | Server | |
| `NEWSLETTER_DOCTORS_LIST` | Server | |
| `NEWSLETTER_DOCTORS_TO` | Server | |

---

## Security & admin

| Variable | Scope | Notes |
|----------|-------|-------|
| `ADMIN_GATE_PASSWORD` | Server | `/admin/login` gate |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | Cloudflare Turnstile widget |
| `TURNSTILE_SECRET_KEY` | Server | Turnstile server verification |
| `ADMIN_IP_ALLOWLIST` | Server | Comma-separated IPs for admin guard |
| `AUTH_SECRET` | Server | Auth/session (see `.env.production.local.example`) |
| `CLK_API_URL` | Server | Czech medical registry (optional) |
| `CLK_API_KEY` | Server | |
| `MEDSCOPE_CLK_JSON` | Server | Local CLK data path override |

---

## Academy video providers (optional)

| Variable | Provider |
|----------|----------|
| `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID`, `HEYGEN_LOCALE` | HeyGen |
| `SYNTHESIA_API_KEY`, `SYNTHESIA_AVATAR_ID`, `SYNTHESIA_VOICE` | Synthesia |
| `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET` | Mux |
| `D_ID_API_KEY`, `D_ID_PRESENTER_URL` | D-ID |
| `VIDEO_WEBHOOK_SECRET` | Shared webhook secret |
| `EDGE_TTS_URL` | Custom TTS endpoint |
| `FFMPEG_PATH`, `FFMPEG_AVAILABLE` | Local/server video merge (not on Vercel by default) |

---

## Analytics & PubMed

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Client | Google Analytics 4 |
| `NCBI_TOOL` | Server | Default: `medscopeglobal` |
| `NCBI_CONTACT_EMAIL` | Server | E-utilities contact |
| `NCBI_API_KEY` | Server | Reduces PubMed rate limits |

---

## Ingestion & content pipeline

| Variable | Default | Notes |
|----------|---------|-------|
| `INGESTION_LOCALE` | `cs` | Ingested article language |
| `DEFAULT_SITE_LOCALE` | `cs` | Site default locale |
| `INGESTION_AUTHOR_ID` | auto | Fixed author UUID for cron ingest |
| `INGEST_MAX_ARTICLES` | `80` | Per-run ingest cap |
| `PUBLIC_WRITER_LIMIT` | `4` | V25 public writers |
| `V26_FOREIGN_MAX` | `12` | Foreign news ingest |
| `V26_REWRITE_BATCH` | `8` | Backfill batch size |
| `ACADEMY_EXPERT_REVIEW_AUTO_PUBLISH` | — | `true` to auto-publish approved drafts |

---

## Database (local scripts / Prisma — not runtime Next.js)

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Pooled Postgres (Supabase port 6543) |
| `DIRECT_URL` | Direct Postgres for migrations (port 5432) |
| `SUPABASE_ACCESS_TOKEN` | CLI migrations |
| `SUPABASE_PROJECT_REF` | CLI project ref |

---

## Rate limiting (optional)

| Variable | Notes |
|----------|-------|
| `UPSTASH_REDIS_REST_URL` | Preferred on Vercel |
| `UPSTASH_REDIS_REST_TOKEN` | |
| `REDIS_URL` | Fallback |
| `REDIS_TOKEN` | Fallback |

---

## Mobile app (Expo — separate from Vercel web)

| Variable | Notes |
|----------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | |
| `EXPO_PUBLIC_API_BASE` | Default: `https://medscopeglobal.com` |
| `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` | OAuth (see `mobile/.env.example`) |

---

## Local filesystem (Windows NTFS — not Vercel)

| Variable | Default (local NTFS) |
|----------|---------------------|
| `MEDSCOPE_PROJECT_ROOT` | `C:\_NTFS\MedScopeGlobal\repo-temp` |
| `MEDSCOPE_DATA_ROOT` | `C:\_NTFS\MedScopeGlobal\data` |
| `MEDSCOPE_LOGS_ROOT` | `C:\_NTFS\MedScopeGlobal\logs` |
| `MEDSCOPE_LOCAL_DATA_DIR` | `{PROJECT_ROOT}/.data` |
| `MEDSCOPE_LOGO_SOURCE` | `C:\_NTFS\MedScopeGlobal\logo` |
| `MEDSCOPE_ALLOW_C_DRIVE` | `1` when using other `C:\` paths (auto-allowed under `C:\_NTFS\`) |
| `MEDSCOPE_SKIP_ENV_CHECK` | `1` to allow build without Supabase (CI only) |

---

## Vercel / deploy / CI (scripts only)

| Variable | Purpose |
|----------|---------|
| `VERCEL` | Auto-set by Vercel (`1`) |
| `VERCEL_URL` | Auto-set preview URL |
| `VERCEL_ENV` | `production` / `preview` / `development` |
| `VERCEL_TOKEN` | Deploy & env sync scripts |
| `VERCEL_PROJECT_ID` | |
| `VERCEL_ORG_ID` / `VERCEL_TEAM_ID` | |
| `GITHUB_TOKEN` / `GH_TOKEN` | CI push & workflow scripts |
| `PROD_BASE_URL`, `PROD_APEX_URL`, `PROD_WWW_URL` | Production test scripts |
| `PRODUCTION_URL` | Smoke / audit scripts |

---

## Supabase Edge Functions (Deno)

Set in Supabase dashboard → Edge Functions → Secrets:

| Secret | Used by |
|--------|---------|
| `SUPABASE_URL` | rate-limit, medical-ai-fetch |
| `SUPABASE_SERVICE_ROLE_KEY` | rate-limit, medical-ai-fetch |
| `NEXT_PUBLIC_SITE_URL` | All cron proxy functions |
| `CRON_SECRET` | trend-analysis, pubmed-*, regulatory-*, autopublish, etc. |

---

## Build-time safety

When env vars are missing during `next build`, the app uses placeholders via `lib/env.ts` (`NEXT_PHASE` / `MEDSCOPE_SKIP_ENV_CHECK`). **Runtime** still requires real Supabase keys — placeholders are not valid for production traffic.

`next.config.mjs` already ignores invalid Supabase URL at build time for `images.remotePatterns`.

---

## Vercel import checklist

1. Copy **Required** block above into Vercel Production.
2. Add Stripe keys if payments enabled.
3. Add at least one AI key (`GROQ_API_KEY` recommended).
4. Add `SENDGRID_API_KEY` or SMTP for email.
5. Add Turnstile keys if captcha enabled on forms.
6. Run `node scripts/validate-production-env.mjs` with `.env.local` mirroring Vercel.
7. Sync: `node scripts/diff-vercel-env.mjs` (requires `VERCEL_TOKEN`).

**Never commit:** `.env.local`, `.env.production.local`, or any file containing live secrets.
