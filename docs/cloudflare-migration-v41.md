# Cloudflare Workers migration (v41 OpenNext)

## Status
- Runtime target: Cloudflare Workers via `@opennextjs/cloudflare`
- Auto-deploy: `.github/workflows/cloudflare-deploy.yml` on push to `main`
- Cron: `.github/workflows/cloudflare-cron.yml` (HTTP dispatcher with `CRON_SECRET`)

## Required secrets (GitHub Actions)
1. `CLOUDFLARE_API_TOKEN` — Account Workers Scripts Edit + DNS Edit
2. `CLOUDFLARE_ACCOUNT_ID`
3. `CLOUDFLARE_ENV_JSON` — JSON object of all production env vars (see `npm run cf:env:sync`)
4. `CRON_SECRET` — same as app cron auth

## Local one-time setup
```bash
# 1) Put secrets in .env.local (Supabase keys unchanged)
# 2) Export JSON for Cloudflare / GitHub
npm run cf:env:sync
# 3) Create .dev.vars for local wrangler
# 4) Deploy
set CLOUDFLARE_API_TOKEN=...
set CLOUDFLARE_ACCOUNT_ID=...
npm run cf:deploy
# 5) Point DNS (after first workers.dev hostname known)
set CLOUDFLARE_WORKER_HOST=medscopeglobal.<subdomain>.workers.dev
npm run cf:dns
```

## Production host
Production DNS and the Worker already point at Cloudflare (`medscopeglobal.com`). Do not add another origin.

## Supabase
No schema/policy changes. Same `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY`.