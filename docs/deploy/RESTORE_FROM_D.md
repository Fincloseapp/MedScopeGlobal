# Restore secrets from D: (one page)

Cloud agents **cannot** read `D:\medscope.local`. Run this on the Windows PC. Never commit `.env.local` or `.env.cloudflare.json`.

**Goal:** paste real keys into Cursor Secrets + GitHub Actions, then optionally deploy VitaScope to production from D: without waiting for a cloud agent.

---

## 0. Open the repo on the PC

```powershell
cd D:\medscope.local
git fetch origin
git checkout cursor/global-health-ecosystem-2b2d
git pull origin cursor/global-health-ecosystem-2b2d
# keep existing .env.local — do not overwrite with placeholders
```

Confirm secrets exist (names only):

```powershell
Select-String -Path .\.env.local -Pattern '^(CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|SUPABASE_SERVICE_ROLE_KEY|CRON_SECRET|STRIPE_SECRET_KEY|VERCEL_TOKEN)=' |
  ForEach-Object { ($_.Line -split '=',2)[0] }
```

You need at least: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## 1. Sync env → Cloudflare JSON

```powershell
cd D:\medscope.local
pnpm cf:env:sync
# writes scripts\cloudflare\.env.cloudflare.json (gitignored)
```

---

## 2. Push secrets to GitHub Actions

Requires `gh` logged in (`gh auth status`).

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

## 3. Paste into Cursor Secrets (cloud agents)

Dashboard → [medscopeglobal environment](https://cursor.com/dashboard/cloud-agents/environments/e/0aaf8327-9d2a-11f1-a7d1-d6b4613131ce) → **Secrets**.

Paste these from `D:\medscope.local\.env.local` (and JSON from step 1):

| Secret | Source |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | `.env.local` |
| `CLOUDFLARE_ACCOUNT_ID` | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` |
| `CLOUDFLARE_ENV_JSON` | `scripts\cloudflare\.env.cloudflare.json` (entire file) |
| `CRON_SECRET` | `.env.local` (optional) |
| `VERCEL_TOKEN` | `.env.local` (optional — enables cloud `vercel env pull`) |

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

## 4. Optional — deploy production NOW from D:

```powershell
cd D:\medscope.local
git checkout cursor/global-health-ecosystem-2b2d
git pull origin cursor/global-health-ecosystem-2b2d
pnpm cf:deploy
pnpm cf:smoke
# expect VitaScope on https://medscopeglobal.com/cs
curl.exe -sL https://medscopeglobal.com/cs | Select-String -Pattern 'VitaScope|MediFlow'
```

Or merge PR #19 to `main` and let Workers Builds / Actions deploy (only after GH CF secrets are set).

---

## 5. Alternate — recover via Vercel (no D: CF token)

If `.env.local` on D: is missing but GitHub still has `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`:

1. GitHub → **Actions** → **Pull Production Env Local** → **Run workflow** (branch `main`).
2. Download artifact `medscope-env-local` (retention ~1–7 days).
3. Copy needed keys into `D:\medscope.local\.env.local`, then redo steps 1–4.

From D: with `VERCEL_TOKEN` already in `.env.local`:

```powershell
cd D:\medscope.local
$env:VERCEL_TOKEN = (Get-Content .\.env.local | Where-Object { $_ -match '^VERCEL_TOKEN=' } | ForEach-Object { ($_ -split '=',2)[1].Trim().Trim('"') })
$env:VERCEL_ORG_ID = (Get-Content .\.env.local | Where-Object { $_ -match '^VERCEL_ORG_ID=' } | ForEach-Object { ($_ -split '=',2)[1].Trim().Trim('"') })
$env:VERCEL_PROJECT_ID = (Get-Content .\.env.local | Where-Object { $_ -match '^VERCEL_PROJECT_ID=' } | ForEach-Object { ($_ -split '=',2)[1].Trim().Trim('"') })
npx vercel env pull .env.vercel.local --yes --environment=production
# merge selected keys into .env.local manually — never commit either file
```

---

## Smoke after secrets land in Cursor

```text
pnpm verify:articles
pnpm cf:deploy          # from cursor/global-health-ecosystem-2b2d
curl -sL https://medscopeglobal.com/cs | rg -i 'VitaScope'
```
