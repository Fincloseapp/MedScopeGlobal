# Deployment environment variables

Production keys synced to Vercel are defined in `scripts/env-keys.mjs` (`VERCEL_SYNC_KEYS`).

## Required for runtime
- `NEXT_PUBLIC_SITE_URL` — canonical site URL (SEO, links)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — server-side Supabase (keep secret)

## Cron & admin
- `CRON_SECRET` — authenticates `/api/cron/*` on Vercel

## AI / ingestion (as used)
- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `GROQ_API_KEY`, `GROQ_MODEL_PRIMARY`, `GROQ_MODEL_FALLBACK`, `GROQ_MODEL_FALLBACK_2`
- `GEMINI_API_KEY`, `GEMINI_MODEL`
- `INGESTION_LOCALE`, `DEFAULT_SITE_LOCALE`

## Payments & forms
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- `ADMIN_NOTIFY_EMAIL`

## Deploy scripts
Local file `D:\MedScopeGlobal\.env.local` should hold secrets. `npm run deploy:vercel` uses `GITHUB_TOKEN` and/or `VERCEL_TOKEN` (+ `VERCEL_PROJECT_ID` from `.vercel/project.json`).

See also `vercel.json` for non-secret defaults (`INGESTION_LOCALE`, `OPENAI_MODEL`, etc.).
