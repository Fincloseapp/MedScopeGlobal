# Manual operator checklist

One-page runbook for tasks that **cannot** be done inside a Cloud Agent pod alone: Supabase DDL,
PC secret sync, production cron migrations, and Cursor Secrets for the next agent run.

| Doc | When to use |
|-----|-------------|
| **This file** | Day-to-day manual steps (migrations, sync, secrets) |
| [`PC_ARTICLE_EXPAND_BACKFILL.md`](./PC_ARTICLE_EXPAND_BACKFILL.md) | PC: restore secrets → expand shorts → image backfill / cron |
| [`POST_MERGE_CHECKLIST.md`](./POST_MERGE_CHECKLIST.md) | After merging ecosystem PR to `main` |
| [`CLOUD_AGENT_ENV_SETUP.md`](./CLOUD_AGENT_ENV_SETUP.md) | Agent pod without Cursor Secrets |
| [`RESTORE_FROM_D.md`](./RESTORE_FROM_D.md) | Full D: restore / backup / GH secrets |
| [`QUICK_START_PC.md`](./QUICK_START_PC.md) | Fast deploy from Windows PC |
| [`production-runbook.md`](./production-runbook.md) | Full production deploy reference |

---

## A. Supabase SQL Editor — ecosystem migrations (20260825*)

**When:** Before or immediately after deploying code that uses MediFlow / editorial queue.  
**Where:** [Supabase dashboard](https://supabase.com/dashboard) → project → **SQL → New query**.

Apply **in this order** (idempotent — safe to re-run):

| Step | File |
|-----:|------|
| 1 | `supabase/migrations/20260825120000_mediflow_ecosystem.sql` |
| 2 | `supabase/migrations/20260825220000_editorial_redakce.sql` |
| 3 | `supabase/migrations/20260825230000_editorial_images.sql` |

For each step: open the file in the repo → copy full contents → paste into SQL Editor → **Run** → confirm no errors.

**Verify** (on PC or agent with `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`):

```bash
cd D:\medscope.local   # or /workspace on cloud
pnpm db:verify
```

Expect ✓ for `mediflow_*`, `article_syndications`, `editorial_queue`, `article_image_suggestions`.  
Anon REST returning `PGRST205` means migrations are still pending.

**CLI alternative** (PC only — needs `SUPABASE_ACCESS_TOKEN`):

```bash
pnpm db:migrate
pnpm db:verify
```

---

## B. PC sync — `pnpm sync:d` from `D:\medscope.local`

Cloud agents **cannot** read or write the Windows D: drive. Run on the PC after `git pull`:

```powershell
cd D:\medscope.local
git fetch origin
git checkout main
git pull origin main
pnpm sync:d
# optional deploy + zip backup:
# pnpm sync:d -- -Deploy -IncludeZip
```

**What `sync:d` does:**

1. `pnpm restore:d` — merge selected keys from D: `.env.local` → workspace `.env.local`, run `pnpm cf:env:sync`, optional `gh secret set`, `pnpm deploy:checklist`
2. `pnpm backup:d` — dated backup under `D:\medscope.data\backups\YYYY-MM-DD\` (git bundle + `.env.local` + manifest)

**Minimum keys restored:** `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CRON_SECRET`, Stripe keys if present.

See [`RESTORE_FROM_D.md`](./RESTORE_FROM_D.md) for step-by-step restore, GitHub secrets, and deploy.

**Pull cloud work to PC** (git only — no secret overwrite):

```powershell
pnpm pull:d
# then: pnpm sync:d && pnpm db:verify && pnpm deploy:production -- -SkipRestore
```

---

## G. Canonical PC deploy flow (after cloud merge)

Cloud agents update scripts in git; **you** run this on the Windows PC. D: is not mountable from cloud pods.

```powershell
cd D:\medscope.local
git fetch origin
git checkout main
git pull origin main

# Restore secrets + dated backup
pnpm sync:d
# Backup lands at: D:\medscope.data\backups\YYYY-MM-DD\  (today's date)

# Verify Supabase (MediFlow, editorial_queue, article_image_suggestions)
pnpm db:verify

# If db:verify fails — apply ecosystem migrations:
pnpm db:trigger-ecosystem-cron
pnpm db:verify

# Deploy + post-deploy smoke (sync:d already restored secrets)
pnpm deploy:production -- -SkipRestore

# Optional editorial cover suggestions
pnpm images:backfill
```

**What each step does:**

| Step | Command | Result |
|------|---------|--------|
| Pull | `git pull origin main` | Latest scripts from GitHub |
| Sync | `pnpm sync:d` | `.env.local` + CF JSON + backup under `D:\medscope.data\backups\<date>\` |
| Verify DB | `pnpm db:verify` | Confirms `20260825*` migrations applied |
| Cron fallback | `pnpm db:trigger-ecosystem-cron` | POSTs production Worker migration route |
| Deploy | `pnpm deploy:production -- -SkipRestore` | `cf:deploy` + `smoke:production` + `smoke:ecosystem:production` |
| Images | `pnpm images:backfill` | Editorial cover suggestions for articles without images |

**Shortcut** (no separate backup step):

```powershell
cd D:\medscope.local; git pull origin main; pnpm deploy:production
```

**One-liner after cloud merge** (pull + sync + verify + deploy + smoke):

```powershell
cd D:\medscope.local; git pull origin main; pnpm sync:d; pnpm db:verify; pnpm deploy:production -- -SkipRestore
```

---

## C. Trigger ecosystem migrations on production Worker

After `/api/cron/apply-ecosystem-migrations` is deployed (on `main`), the **Worker** already holds
`SUPABASE_ACCESS_TOKEN` and `CRON_SECRET`. You trigger from any machine that has one of those secrets.

### Option 1 — `pnpm db:trigger-ecosystem-cron` (recommended)

Reads `CRON_SECRET` or `CLOUDFLARE_API_TOKEN` from `.env.local` and POSTs to production:

```bash
cd D:\medscope.local
pnpm db:trigger-ecosystem-cron
```

### Option 2 — curl with `CRON_SECRET`

```bash
# Bash — CRON_SECRET from D:\medscope.local\.env.local
curl -s -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://medscopeglobal.com/api/cron/apply-ecosystem-migrations | jq .
```

```powershell
# PowerShell
$secret = (Get-Content D:\medscope.local\.env.local | Where-Object { $_ -match '^CRON_SECRET=' } | ForEach-Object { ($_ -split '=',2)[1].Trim().Trim('"') })
Invoke-RestMethod -Method POST -Uri "https://medscopeglobal.com/api/cron/apply-ecosystem-migrations" -Headers @{ Authorization = "Bearer $secret" }
```

**Expected success:**

```json
{
  "ok": true,
  "projectRef": "xcydgqnivxfhprbmdyym",
  "results": [
    { "name": "20260825120000_mediflow_ecosystem", "ok": true },
    { "name": "20260825220000_editorial_redakce", "ok": true },
    { "name": "20260825230000_editorial_images", "ok": true }
  ]
}
```

### Option 3 — Cloudflare API token fallback

If you have `CLOUDFLARE_API_TOKEN` but not `CRON_SECRET`, the route accepts a valid CF token in the Bearer header (verified via Cloudflare API):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://medscopeglobal.com/api/cron/apply-ecosystem-migrations | jq .
```

### After trigger

```bash
pnpm db:verify
pnpm smoke:production
pnpm smoke:ecosystem:production
```

**Do not** rely on Cloud Agent pods for this unless `CRON_SECRET` or `CLOUDFLARE_API_TOKEN` is in Cursor Secrets or `.env.local`.

---

## D. Add secrets to a **new** Cloud Agent run

Existing agent pods **do not** pick up new secrets. Save secrets in the dashboard, then **start a new run**.

1. On PC: `cd D:\medscope.local` → `pnpm cf:env:sync` (writes `scripts\cloudflare\.env.cloudflare.json`).
2. Open **Cursor → Cloud Agents → Environments → medscopeglobal → Secrets**.
3. Paste from D: `.env.local` (never commit):

| Secret | Purpose |
|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dev server boot |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev server boot |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs (`https://medscopeglobal.com`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Article SSR, `db:verify`, editorial backfill |
| `SUPABASE_ACCESS_TOKEN` | `pnpm db:migrate`, Management API |
| `CRON_SECRET` | Trigger production crons from agent |
| `CLOUDFLARE_API_TOKEN` | Optional `pnpm cf:deploy` from agent |
| `CLOUDFLARE_ACCOUNT_ID` | Optional `pnpm cf:deploy` from agent |
| `CLOUDFLARE_ENV_JSON` | Full Worker vars (entire `.env.cloudflare.json` file) |

4. **Start a new Cloud Agent run** on the branch you need.

**Minimum boot-only** (no service role): public Supabase URL + anon key + `NEXT_PUBLIC_SITE_URL` — enough for `pnpm dev`, typecheck, lint, test, and PWA smoke. See [`CLOUD_AGENT_ENV_SETUP.md`](./CLOUD_AGENT_ENV_SETUP.md).

**PowerShell — copy one key to clipboard** (review before paste; do not log):

```powershell
cd D:\medscope.local
function Copy-EnvKey([string]$Key) {
  $line = Get-Content .\.env.local | Where-Object { $_ -match "^$Key=" } | Select-Object -First 1
  if (-not $line) { Write-Host "MISSING $Key"; return }
  ($line -split '=',2)[1].Trim().Trim('"') | Set-Clipboard
  Write-Host "Copied $Key to clipboard"
}
Copy-EnvKey SUPABASE_SERVICE_ROLE_KEY
Copy-EnvKey CRON_SECRET
Get-Content .\scripts\cloudflare\.env.cloudflare.json -Raw | Set-Clipboard
Write-Host "Copied CLOUDFLARE_ENV_JSON to clipboard"
```

---

## E. Local verification (cloud agent or PC)

```bash
export MEDSCOPE_PROJECT_ROOT=/workspace   # cloud Linux only
pnpm typecheck    # exit 0
pnpm lint         # exit 0 (img warnings OK)
pnpm test         # functional-check + i18n smoke
pnpm dev          # http://localhost:3000 — /cs → 200, / → 307→/cs
```

On branches with `dev:d` script: `pnpm dev:d` binds `0.0.0.0:3000` for remote browser testing.

---

## F. GitHub Actions secrets (CI deploy + migrations)

Push to `main` triggers two workflows. Both **fail fast** if secrets are missing:

| Workflow | Required GitHub Actions secrets | Fallback |
|----------|--------------------------------|----------|
| `cloudflare-deploy.yml` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Workers Builds dashboard |
| `apply-ecosystem-migrations.yml` | `DATABASE_URL` or `SUPABASE_ACCESS_TOKEN`, `CRON_SECRET`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Manual SQL Editor or `pnpm db:trigger-ecosystem-cron` from PC |

Populate from PC after `pnpm sync:d` (runs `gh secret set` unless `-SkipGhSecrets`):

```powershell
cd D:\medscope.local
pnpm sync:d    # restores .env.local + pushes keys to GitHub Actions secrets
```

Optional: `CLOUDFLARE_ENV_JSON` (full Worker vars from `pnpm cf:env:sync`) for deploy workflow.

**Note:** Cloud Agent pods cannot deploy — CF tokens in Cursor Secrets are often invalid/expired. Use PC `pnpm cf:deploy` or Workers Builds dashboard.

---

## Sign-off (operator)

- [ ] Migrations 1–3 applied (SQL Editor **or** cron **or** `pnpm db:migrate`)
- [ ] `pnpm db:verify` exit 0 on PC
- [ ] `pnpm sync:d` run after cloud merge (backup at `D:\medscope.data\backups\<date>\`)
- [ ] Cursor Secrets updated if next agent needs DB/deploy
- [ ] `pnpm cf:deploy` or `pnpm deploy:production -- -SkipRestore` exit 0
- [ ] `pnpm smoke:production` exit 0
- [ ] `pnpm smoke:ecosystem:production` exit 0
