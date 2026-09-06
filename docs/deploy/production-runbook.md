# Production deploy runbook — medscopeglobal.com (Cloudflare Workers)

Canonical production host: **https://medscopeglobal.com**  
Runtime: **Cloudflare Workers** via OpenNext (`@opennextjs/cloudflare`).  
Data: **Supabase** (Postgres + Auth + Storage).  
**No Vercel** — deploy only through Cloudflare Workers Builds or GitHub Actions.

---

## Quick path (experienced operator)

```bash
# 1. Pre-flight (local, D:\medscope.local or cloud workspace with .env.local)
pnpm deploy:checklist

# 2. Apply ecosystem migrations (see §1)
pnpm db:migrate

# 3. Sync env → Cloudflare / GitHub (see §2)
pnpm cf:env:sync
# paste scripts/cloudflare/.env.cloudflare.json into CLOUDFLARE_ENV_JSON

# 4. Deploy (Workers Builds on push to main, or manual)
pnpm cf:deploy

# 5. Post-deploy (see §3)
node scripts/editorial/backfill-article-images.mjs --apply --limit=50
pnpm db:verify
pnpm cf:smoke

# 6. Verify crons (see §4)
```

---

## 1. Supabase migrations (ecosystem branch)

Apply these **three migrations in order** before or immediately after deploying code that uses MediFlow / autonomous editorial:

| Order | File | Purpose |
|------:|------|---------|
| 1 | `supabase/migrations/20260825120000_mediflow_ecosystem.sql` | MediFlow tables (`mediflow_notes`, `mediflow_symptoms`, `mediflow_supplements`, `mediflow_saved_articles`), RLS, donation index on `v27_orders` |
| 2 | `supabase/migrations/20260825220000_editorial_redakce.sql` | `article_syndications`, `editorial_queue`, article-tip index on `v27_orders` |
| 3 | `supabase/migrations/20260825230000_editorial_images.sql` | `article_image_suggestions`, `editorial_queue.task_type` column |

### Option A — Supabase SQL Editor (manual, safest for prod)

1. Open [Supabase SQL Editor](https://supabase.com/dashboard) → your project → **SQL → New query**.
2. Paste and run each file **in order** (1 → 2 → 3).
3. Confirm no errors; re-running is mostly idempotent (`IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`).

### Option B — `pnpm db:migrate` (Management API, all pending migrations)

Requires `.env.local` on the operator machine (Windows: `D:\medscope.local\.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ACCESS_TOKEN=<from https://supabase.com/dashboard/account/tokens>
# optional explicit ref if URL is non-standard:
# SUPABASE_PROJECT_REF=<ref>
```

Then:

```bash
pnpm db:migrate
# alias: pnpm db:setup
```

This runs **every** file in `supabase/migrations/` sorted by filename (not just the three above). Safe for greenfield; on long-lived prod DBs prefer Option A for the three new files only.

Alternative auth: `npx supabase login` (stores token in `~/.supabase/access-token`) instead of `SUPABASE_ACCESS_TOKEN`.

### Option C — direct Postgres (`pnpm db:apply-pg`)

If `DATABASE_URL=postgresql://postgres.[ref]:…@db.[ref].supabase.co:5432/postgres` is set, you can apply a single file via `pnpm db:apply-pg`. Rarely needed for routine deploys.

### Verify migrations

```bash
pnpm db:verify
```

Expect ✓ for ecosystem tables: `mediflow_*`, `article_syndications`, `editorial_queue`, `article_image_suggestions`.

---

## 2. Cloudflare Workers environment variables

Production secrets live on the **Worker**, not in git. Source of truth for local dev: **`D:\medscope.local\.env.local`** (Windows) or `.env.local` in the repo root.

### Required (production will degrade without these)

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only; articles SSR, editorial cron, backfill |
| `CRON_SECRET` | Bearer token for all cron routes; must match GitHub Actions `CRON_SECRET` |
| `NEXT_PUBLIC_SITE_URL` | `https://medscopeglobal.com` |
| `STRIPE_SECRET_KEY` | Live `sk_live_…` for checkout, tringelt tips, donations |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook `https://www.medscopeglobal.com/api/stripe/webhook` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Live `pk_live_…` |

### Recommended (feature-complete production)

| Variable | Notes |
|----------|-------|
| `GROQ_API_KEY` | Primary LLM for ingestion / editorial (`gsk_…`) |
| `ADMIN_GATE_PASSWORD` | `/admin/login` gate (default `David` if unset) |
| `SENDGRID_API_KEY` / SMTP vars | Email engine (see `.env.example`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Anti-bot |

### Optional (ecosystem / editorial images)

| Variable | Notes |
|----------|-------|
| `UNSPLASH_ACCESS_KEY` | Enables live Unsplash search in editorial image pipeline; without it, curated static Unsplash URLs + SVG fallbacks still work |

Full optional list: `.env.example` and `scripts/env-keys.mjs` (`CLOUDFLARE_SYNC_KEYS`).

### Sync from D: drive `.env.local` → Cloudflare

On Windows (`D:\medscope.local`):

```powershell
cd D:\medscope.local
pnpm cf:env:sync
```

Writes `scripts/cloudflare/.env.cloudflare.json` — a JSON object of production keys (no comments, no placeholders).

**Path A — GitHub Actions (automated deploy on `main` push)**

1. Repo → **Settings → Secrets and variables → Actions**
2. Set `CLOUDFLARE_ENV_JSON` = entire contents of `.env.cloudflare.json` (single-line JSON is fine)
3. Also required: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CRON_SECRET`
4. Workflow `.github/workflows/cloudflare-deploy.yml` writes `.dev.vars` via `scripts/cloudflare/write-dev-vars-from-json.mjs` then runs `pnpm cf:deploy`

**Path B — Cloudflare Dashboard (Workers Builds)**

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → project **`medscopeglobal`**
2. **Settings → Variables and Secrets**
3. Add each key from `.env.cloudflare.json`:
   - **Plain text** vars: `NEXT_PUBLIC_*`, `MEDSCOPE_RUNTIME`, `NEXT_PUBLIC_SITE_URL`
   - **Secrets** (encrypted): `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CRON_SECRET`, `GROQ_API_KEY`, etc.
4. Workers Builds config (`wrangler.jsonc` comments):
   - **Production branch:** `main`
   - **Root directory:** `/`
   - **Build command:** `npm run cf:build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy` *(or `npm run deploy`)*

**Path C — Local CLI deploy**

```bash
# after cf:env:sync, copy JSON to .dev.vars manually OR:
node scripts/cloudflare/write-dev-vars-from-json.mjs   # needs CLOUDFLARE_ENV_JSON in env

export CLOUDFLARE_API_TOKEN=…
export CLOUDFLARE_ACCOUNT_ID=…
pnpm cf:deploy
```

`scripts/cloudflare/deploy.mjs` refuses deploy if Supabase vars contain `placeholder` or site URL is `localhost`.

### Runtime markers (set automatically)

```
MEDSCOPE_RUNTIME=cloudflare-workers
NEXTJS_ENV=production
NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com
```

---

## 3. Deploy (Cloudflare Workers)

### Preferred: Cloudflare Workers Builds

Connect GitHub repo → **Create and deploy** → project name **`medscopeglobal`**, branch **`main`**.  
Push to `main` triggers build + deploy. There is no `vercel.json`. The Vercel GitHub App was uninstalled from `Fincloseapp/MedScopeGlobal`; production is Cloudflare only. A red “Vercel / Account is blocked” status on older commits is leftover history and can be ignored.

### Alternative: GitHub Actions

`.github/workflows/cloudflare-deploy.yml` — same OpenNext build, runs smoke after deploy.

### Manual one-off

```bash
pnpm cf:deploy    # build + deploy via wrangler/opennext
# or
pnpm deploy       # opennextjs-cloudflare build && deploy
```

DNS: routes in `wrangler.jsonc` bind `medscopeglobal.com/*` and `www.medscopeglobal.com/*`.  
First-time DNS helper: `pnpm cf:dns` (after workers.dev hostname is known).

---

## 4. Post-deploy scripts

Run from machine with real `.env.local` (service role required for writes).

### 4.1 Editorial image backfill

Populates `cover_image_url` + hero alt metadata for published articles missing images.

```bash
# Dry-run — lists candidates, no writes
node scripts/editorial/backfill-article-images.mjs

# Apply (recommended first prod pass)
node scripts/editorial/backfill-article-images.mjs --apply --limit=50
```

Requires `SUPABASE_SERVICE_ROLE_KEY`. Optional `UNSPLASH_ACCESS_KEY` for expanded image search.

### 4.2 Supabase verify

```bash
pnpm db:verify
# alias: node scripts/verify-supabase.mjs
```

Read-only checks: env keys, required + ecosystem tables, `articles` column shape. Exit code 0 = ready.

### 4.3 Production smoke

```bash
pnpm cf:smoke
# optional override: SMOKE_BASE_URL=https://medscopeglobal.com pnpm cf:smoke
```

Hits homepage, three PWAs, manifests, demo APIs (`/api/medipacient/timeline`, `/api/mediprep/dashboard`), health. Fails on 5xx or missing surfaces. Also runs automatically at end of `cloudflare-deploy.yml`.

---

## 5. Cron verification

Cron auth: `Authorization: Bearer <CRON_SECRET>` (same value in Worker secrets and GitHub Actions).

Dispatcher: `.github/workflows/cloudflare-cron.yml` (UTC schedules). Ecosystem tasks can also be invoked manually.

### 5.1 `ecosystem-mediflow`

- **Endpoint:** `POST /api/cron/ecosystem-mediflow`
- **Schedule:** 04:00 UTC daily (via `cloudflare-cron.yml`)
- **Action:** Resets MediFlow `mediflow_supplements.taken_today` flags

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://medscopeglobal.com/api/cron/ecosystem-mediflow | jq .
```

Expect: `"ok": true`, `"task": "mediflow-daily-reset"`.

### 5.2 `editorial-queue`

- **Endpoint:** `POST /api/ecosystem/autonomous` with body `{"task":"editorial-queue"}`
- **Schedule:** 05:00 UTC (`AUTONOMOUS_SCHEDULE` in `lib/ecosystem/autonomous.ts`)
- **Action:** Enqueues editorial tasks per locale desk into `editorial_queue`

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"task":"editorial-queue"}' \
  https://medscopeglobal.com/api/ecosystem/autonomous | jq .
```

Expect: `"status": "queued"`, `"items"` ≈ primary desks (≥10). Confirm rows in Supabase `editorial_queue`.

### 5.2b `generate-articles` / `syndicate-articles`

```bash
curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://medscopeglobal.com/api/cron/ecosystem-generate-articles | jq .
curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://medscopeglobal.com/api/cron/ecosystem-syndicate | jq .
```

Expect generate: `"legacyCronEndpoint": "/api/cron/public-articles"`.  
Expect syndicate: `"status": "queued"` with `plan` and optional `persistedSyndications` when service role is set.

List all autonomous tasks (no auth):

```bash
curl -s https://medscopeglobal.com/api/ecosystem/autonomous | jq '.tasks[] | select(.id | test("editorial|mediflow"))'
```

### 5.3 `editorial-images`

- **Endpoint:** `POST /api/ecosystem/editorial/images`
- **Schedule:** 10:00 UTC
- **Action:** Matches hero images to articles; writes `article_image_suggestions`; optional apply via `{"apply":true}`

```bash
# Dry batch (default — suggestions only)
curl -s -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"limit":5,"dryRun":true}' \
  https://medscopeglobal.com/api/ecosystem/editorial/images | jq .

# Status (no auth)
curl -s https://medscopeglobal.com/api/ecosystem/editorial/images | jq .
```

Expect: `"task": "editorial-images"`, `candidates` ≥ 0, `suggestions` array. With service role configured, queue rows with `task_type: "image"` appear in `editorial_queue`.

### GitHub Actions manual cron

Workflow dispatch → **Cloudflare Cron Dispatcher** → set path e.g. `/api/cron/ecosystem-mediflow`.

Ensure GitHub secret `CRON_SECRET` matches Worker `CRON_SECRET`.

---

## 6. Pre-deploy checklist script

```bash
pnpm deploy:checklist
```

Runs, in order:

1. `pnpm typecheck`
2. `pnpm test` (functional-check + i18n smoke)
3. `pnpm db:verify` (skips with guidance if `.env.local` missing)

Fix all failures before merging to `main` or triggering Workers Builds.

---

## 7. Rollback / troubleshooting

| Symptom | Check |
|---------|-------|
| 503 / empty articles | `SUPABASE_SERVICE_ROLE_KEY` on Worker; anon alone cannot `select=*` on `articles` |
| Cron 401 | `CRON_SECRET` mismatch between Worker and caller |
| Stripe donate POST hangs ~4 min then 503 | Node Stripe HTTP client on Workers — deploy `createFetchHttpClient` (`lib/stripe/client.ts`); expect `<5s` + `{url}` or actionable `detail` |
| Stripe tips / donate 503 with `enabled:false` | `STRIPE_SECRET_KEY` missing on Worker |
| Stripe 503 with auth/`detail` message | Invalid/restricted live key — rotate `sk_live_…` in Workers Variables |
| `webhookSecretConfigured: false` | Checkout still works; set `STRIPE_WEBHOOK_SECRET` for VIP/fulfillment (see `docs/deploy/STRIPE_DONATIONS.md`) |
| Stripe tips 503 (generic) | Live Stripe trio on Worker; webhook URL on Stripe dashboard |
| MediFlow reset fails | Migration 1 applied; `mediflow_supplements` exists |
| Editorial queue empty | Migration 2 applied; service role present at cron time |
| Images not applied | Migration 3 + run backfill or cron with `"apply":true` |
| Build uses placeholder Supabase | Run `pnpm cf:env:sync`; remove placeholders from secrets |

Health: `GET https://medscopeglobal.com/api/health` → `"ok": true`, `"cloudflare": true`.

---

## Related docs

- `docs/cloudflare-migration-v41.md` — OpenNext / Workers migration notes
- `docs/editorial/autonomous-redakce.md` — editorial desks, personas, image policy
- `AGENTS.md` — dev server, smoke targets, Workers Builds dashboard fields
- `.env.example` — full env var reference
