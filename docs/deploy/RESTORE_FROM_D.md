# Restore secrets from D: (one page)

Cloud agents **cannot** read or write `D:\medscope.local`. Run these scripts on the Windows PC.
Never commit `.env.local` or `.env.cloudflare.json`.

**Canonical PC paths**

| Role | Path |
|------|------|
| Project | `D:\medscope.local` |
| Data | `D:\medscope.data` |
| Logs | `D:\medscope.logs` |
| Dated backups | `D:\medscope.data\backups\YYYY-MM-DD\` |

**Goal:** select required keys from D:, sync Cloudflare/GitHub, verify, and create a dated backup — then optionally deploy VitaScope to production without waiting for a cloud agent.

---

## Quick one-shot (recommended) — fully automatic

After any cloud agent says “run on D:”, paste this on the PC:

```powershell
cd D:\medscope.local
git pull origin main
pnpm auto:d
```

`pnpm auto:d` (`scripts/auto-restore-from-d.ps1`) does everything in order:

1. `git pull origin main` (best-effort)
2. `pnpm find:d` — inventory all env files on D: (key **names** only)
3. Auto-recover `.env.local` from newest `D:\medscope.data\backups\*\.env.local` if missing/incomplete
4. Merge Stripe webhook from `D:\medscope.data\secrets\stripe-webhook-secret.txt` when present
5. `pnpm restore:d -ForceKeys` → `.env.local` → `cf:env:sync` → `gh secret set`
6. `pnpm backup:d` → `D:\medscope.data\backups\<today>\`
7. `pnpm db:verify`
8. `pnpm deploy:production -- -SkipRestore` (`cf:deploy` + smokes)

Skip deploy: `pnpm auto:d -- -SkipDeploy`

### Manual step-by-step (same outcome)

```powershell
cd D:\medscope.local
git pull origin main
pnpm sync:d
pnpm db:verify
pnpm deploy:production -- -SkipRestore
# optional zip backup during sync:
# pnpm sync:d -- -IncludeZip
```

| Command | Script |
|---------|--------|
| `pnpm auto:d` | `scripts/auto-restore-from-d.ps1` — **full auto** find → restore → backup → verify → deploy |
| `pnpm find:d` | `scripts/find-d-drive.ps1` — list all env files on D: (key names only) |
| `pnpm find:d:cloud` | `scripts/find-d-drive.mjs` — Linux/cloud probe (mounts + local copies; names only) |
| `pnpm restore:d` | `scripts/restore-from-d.ps1` |
| `pnpm backup:d` | `scripts/backup-to-d.ps1` |
| `pnpm sync:d` | `scripts/sync-d-and-backup.ps1` |
| `pnpm pull:d` | `scripts/pull-cloud-to-d.ps1` (git pull cloud → D: only) |
| `pnpm deploy:production` | `scripts/deploy-production.ps1` — db:verify + cf:deploy + smokes |
| `pnpm db:verify` | Supabase schema verification |
| `pnpm db:trigger-ecosystem-cron` | POST production migration cron |
| `pnpm smoke:ecosystem:production` | MediFlow / editorial production smoke |
| `pnpm images:backfill` | Editorial cover image suggestions |

Cloud agents implement/update these scripts in git; **you** must execute them on D:.

### Cloud agent probe (no D: mount)

On a Linux cloud VM:

```bash
export MEDSCOPE_PROJECT_ROOT=/workspace
pnpm find:d:cloud
```

Expected: D: **not** mounted; public Supabase keys may already be in `.env.local`;
`CLOUDFLARE_*` / `STRIPE_*` / `SUPABASE_SERVICE_ROLE_KEY` still missing until PC `pnpm auto:d`
or Cursor Secrets are filled.

---

## 0. Open the repo on the PC

```powershell
cd D:\medscope.local
git fetch origin
git checkout main
git pull origin main
# keep existing .env.local — do not overwrite with placeholders
```

List all env files on D: (key **names** only):

```powershell
pnpm find:d
# or: powershell -ExecutionPolicy Bypass -File .\scripts\find-d-drive.ps1
```

Confirm secrets exist (names only):

```powershell
Select-String -Path .\.env.local -Pattern '^(CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|SUPABASE_SERVICE_ROLE_KEY|CRON_SECRET|STRIPE_SECRET_KEY)=' |
  ForEach-Object { ($_.Line -split '=',2)[0] }
```

You need at least: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## 1. Restore / select keys (`pnpm restore:d`)

```powershell
cd D:\medscope.local
pnpm restore:d
# deploy after verify:
pnpm restore:d -- -Deploy
# skip GitHub secrets / checklist:
pnpm restore:d -- -SkipGhSecrets -SkipValidate
```

What it does:

1. Reads `D:\medscope.local\.env.local` (and `.dev.vars` if present)
2. Copies required selection into workspace `.env.local` (never commit):
   - `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`
   - `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
   - `STRIPE_*`, `CRON_SECRET`, plus other CF/Supabase keys present
3. Runs `pnpm cf:env:sync` → `scripts\cloudflare\.env.cloudflare.json` (gitignored)
4. If `gh` is authenticated: `gh secret set` for CF token/account, `CRON_SECRET`, `CLOUDFLARE_ENV_JSON`
5. Validates with `pnpm deploy:checklist` (fallback: typecheck + test)
6. With `-Deploy`: `pnpm cf:deploy`

---

## 2. Dated backup (`pnpm backup:d`)

```powershell
cd D:\medscope.local
pnpm backup:d
# force today's stamp + full source zip:
pnpm backup:d -- -BackupDate 2026-08-26 -IncludeZip
```

Destination pattern:

- Preferred: `D:\medscope.data\backups\2026-08-26\`
- Fallback: `D:\medscope.local\backups\2026-08-26-HHMM\`

Includes:

- Git bundle (`medscope-<date>-<shortsha>.bundle`)
- Copy of `.env.local` + `WARNING-CONTAINS-SECRETS.txt` (treat as secret)
- Key docs (`RESTORE_FROM_D.md`, runbook, `AGENTS.md`, …)
- Optional source zip excluding `node_modules` / `.next` / `.git` (`-IncludeZip`)
- `BACKUP_MANIFEST.txt` (date, branch, commit SHA, what was included)

---

## 3. Manual sync env → Cloudflare JSON (same as restore step)

```powershell
cd D:\medscope.local
pnpm cf:env:sync
# writes scripts\cloudflare\.env.cloudflare.json (gitignored)
```

---

## 4. Push secrets to GitHub Actions (manual alternative)

Requires `gh` logged in (`gh auth status`). Prefer `pnpm restore:d` which does this automatically.

```powershell
cd D:\medscope.local

# Required for Actions + agent deploy
gh secret set CLOUDFLARE_API_TOKEN --body (Get-Content .\.env.local | Where-Object { $_ -match '^CLOUDFLARE_API_TOKEN=' } | ForEach-Object { ($_ -split '=',2)[1].Trim().Trim('"') })
gh secret set CLOUDFLARE_ACCOUNT_ID --body (Get-Content .\.env.local | Where-Object { $_ -match '^CLOUDFLARE_ACCOUNT_ID=' } | ForEach-Object { ($_ -split '=',2)[1].Trim().Trim('"') })
gh secret set CLOUDFLARE_ENV_JSON < .\scripts\cloudflare\.env.cloudflare.json

# Strongly recommended
if (Select-String -Path .\.env.local -Pattern '^CRON_SECRET=' -Quiet) {
  gh secret set CRON_SECRET --body (Get-Content .\.env.local | Where-Object { $_ -match '^CRON_SECRET=' } | ForEach-Object { ($_ -split '=',2)[1].Trim().Trim('"') })
}
```

Verify names only: `gh secret list`

---

## 5. Paste into Cursor Secrets (cloud agents)

Dashboard → [medscopeglobal environment](https://cursor.com/dashboard/cloud-agents/environments/e/0aaf8327-9d2a-11f1-a7d1-d6b4613131ce) → **Secrets**.

Paste these from `D:\medscope.local\.env.local` (and JSON from sync):

| Secret | Source |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | `.env.local` |
| `CLOUDFLARE_ACCOUNT_ID` | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` |
| `CLOUDFLARE_ENV_JSON` | `scripts\cloudflare\.env.cloudflare.json` (entire file) |
| `CRON_SECRET` | `.env.local` (optional) |

Print values to clipboard one at a time (review before paste; do not log):

```powershell
cd D:\medscope.local
function Copy-EnvKey([string]$Key) {
  $line = Get-Content .\.env.local | Where-Object { $_ -match "^$Key=" } | Select-Object -First 1
  if (-not $line) { Write-Host "MISSING $Key"; return }
  ($line -split '=',2)[1].Trim().Trim('"') | Set-Clipboard
  Write-Host "Copied $Key to clipboard (len=$((Get-Clipboard).Length))"
}
Copy-EnvKey CLOUDFLARE_API_TOKEN
Copy-EnvKey CLOUDFLARE_ACCOUNT_ID
Copy-EnvKey SUPABASE_SERVICE_ROLE_KEY
Copy-EnvKey CRON_SECRET
Get-Content .\scripts\cloudflare\.env.cloudflare.json -Raw | Set-Clipboard
Write-Host "Copied CLOUDFLARE_ENV_JSON to clipboard"
```

After saving secrets, **start a new cloud agent run** (existing pods do not pick up new secrets).

---

## 6. Deploy production from D:

```powershell
cd D:\medscope.local
git checkout main
git pull origin main
pnpm find:d          # confirm CLOUDFLARE_* key names exist on D:
pnpm sync:d          # restore + backup → D:\medscope.data\backups\<today>\
pnpm db:verify
# if migrations pending:
pnpm db:trigger-ecosystem-cron
pnpm db:verify
pnpm deploy:production -- -SkipRestore
# or all-in-one (no separate backup):
pnpm deploy:production
# optional editorial images:
pnpm images:backfill
# expect VitaScope on https://medscopeglobal.com/cs
curl.exe -sL https://medscopeglobal.com/cs | Select-String -Pattern 'VitaScope|MediFlow'
```

Workers Builds / GitHub Actions on `main` also deploy after push — only if `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` are set (GH secrets or dashboard).

---

## 7. Recover secrets from D: (no Cloudflare token in Cursor)

If Cursor secrets are missing, copy `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_ENV_JSON` from `D:\medscope.local\.env.local` / `scripts\cloudflare\.env.cloudflare.json`. Do not pull env from any other host.

---

## Smoke after secrets land in Cursor

```text
pnpm db:verify
pnpm cf:deploy
pnpm smoke:production
pnpm smoke:ecosystem:production
curl -sL https://medscopeglobal.com/cs | rg -i 'VitaScope'
```

---

## Windows operator command block (copy/paste)

Run in **PowerShell** on the PC. Cloud agents cannot access D:.

**Preferred one-liner (auto find + restore + backup + verify + deploy):**

```powershell
cd D:\medscope.local; git pull origin main; pnpm auto:d
```

**Expanded (same as `auto:d`, for debugging):**

```powershell
cd D:\medscope.local
git fetch origin
git checkout main
git pull origin main

# 1) Restore secrets + dated backup (D:\medscope.data\backups\<today>\)
pnpm sync:d
# pnpm sync:d -- -IncludeZip   # optional full source zip

# 2) Verify Supabase schema
pnpm db:verify
# if FAIL — apply migrations via cron or SQL Editor:
pnpm db:trigger-ecosystem-cron
pnpm db:verify

# 3) Deploy + post-deploy smoke (skip restore — sync:d already ran)
pnpm deploy:production -- -SkipRestore

# 4) Optional editorial cover suggestions
pnpm images:backfill

# 5) Confirm live site
curl.exe -sL https://medscopeglobal.com/cs | Select-String -Pattern 'VitaScope|MediFlow'
curl.exe -sI https://medscopeglobal.com/assets/marketing/mediflow.webp
```

**Minimal deploy-only** (when `.env.local` already complete):

```powershell
cd D:\medscope.local; git pull origin main; pnpm deploy:production
```
