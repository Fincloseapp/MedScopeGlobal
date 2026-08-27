#Requires -Version 5.1
<#
.SYNOPSIS
  Fully automatic D: restore → Cloudflare/GitHub sync → verify → production deploy → Stripe probe.

.DESCRIPTION
  Run ON the Windows PC (cloud agents cannot mount D:).

  Pipeline:
    1. find-d-drive.ps1          — inventory env files (names only)
    2. Pick best .env.local source (project root, then newest backup)
    3. restore-from-d.ps1 -ForceKeys — merge into workspace, cf:env:sync, gh secrets
    4. backup-to-d.ps1           — dated backup under D:\medscope.data\backups\
    5. db:verify + deploy:production (default)
    6. Stripe webhook reminder + pnpm probe:prod:stripe (donate + mediflow.webp)

  Cloud agents without D: use: pnpm auto:continue

.PARAMETER SkipDeploy
  Stop after restore + backup + db:verify (no Cloudflare deploy).

.PARAMETER IncludeZip
  Pass -IncludeZip to backup-to-d.

.PARAMETER SkipGhSecrets
  Do not push GitHub Actions secrets.

.EXAMPLE
  pnpm auto:d
  powershell -ExecutionPolicy Bypass -File .\scripts\auto-restore-from-d.ps1
  powershell -File .\scripts\auto-restore-from-d.ps1 -SkipDeploy
#>
[CmdletBinding()]
param(
  [switch]$SkipDeploy,
  [switch]$IncludeZip,
  [switch]$SkipGhSecrets,
  [switch]$SkipValidate,
  [string]$WorkspaceRoot = "D:\medscope.local"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) { Write-Host "`n######## $msg ########" -ForegroundColor Magenta }
function Write-Ok([string]$msg) { Write-Host "OK  $msg" -ForegroundColor Green }
function Write-Warn2([string]$msg) { Write-Warning $msg }
function Write-Err2([string]$msg) { Write-Host "ERR $msg" -ForegroundColor Red }

if (-not (Test-Path "D:\")) {
  Write-Err2 "D: drive is not available on this machine."
  Write-Host @"

Cloud agents cannot access Windows D:. On the PC:

  cd D:\medscope.local
  git pull origin main
  pnpm auto:d

This auto-applies secrets from D: (or newest backup), syncs Cloudflare/GitHub,
backs up, verifies DB, deploys production, reminds Stripe webhook, and probes donate.

From a cloud agent with Cursor Secrets instead:
  pnpm auto:continue
"@
  exit 2
}

$scriptDir = $PSScriptRoot
$findScript = Join-Path $scriptDir "find-d-drive.ps1"
$restoreScript = Join-Path $scriptDir "restore-from-d.ps1"
$backupScript = Join-Path $scriptDir "backup-to-d.ps1"
$deployScript = Join-Path $scriptDir "deploy-production.ps1"

foreach ($s in @($findScript, $restoreScript, $backupScript)) {
  if (-not (Test-Path $s)) { throw "Missing $s" }
}

if (-not (Test-Path $WorkspaceRoot)) {
  Write-Err2 "Workspace not found: $WorkspaceRoot"
  Write-Host "Clone the repo to D:\medscope.local first."
  exit 2
}

Write-Step "0/6 ensure git on main (best-effort)"
Push-Location $WorkspaceRoot
try {
  $git = (Get-Command git -ErrorAction SilentlyContinue).Source
  if ($git) {
    & $git fetch origin 2>$null
    & $git checkout main 2>$null
    & $git pull origin main 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Ok "git pull origin main" }
    else { Write-Warn2 "git pull failed — continuing with current tree" }
  } else {
    Write-Warn2 "git not on PATH — skip pull"
  }
} finally {
  Pop-Location
}

Write-Step "1/6 inventory D: (names only)"
& powershell -ExecutionPolicy Bypass -File $findScript
# find script exits 2 when D: missing — already gated above; non-zero otherwise is soft
if ($LASTEXITCODE -notin @(0, $null)) {
  Write-Warn2 "find-d-drive exited $LASTEXITCODE — continuing"
}

Write-Step "2/6 ensure primary .env.local (auto-recover from backup if needed)"
$primaryEnv = Join-Path $WorkspaceRoot ".env.local"
function Find-LatestBackupEnv {
  $hits = @()
  foreach ($bRoot in @("D:\medscope.data\backups", (Join-Path $WorkspaceRoot "backups"))) {
    if (-not (Test-Path $bRoot)) { continue }
    Get-ChildItem -Path $bRoot -Directory -ErrorAction SilentlyContinue |
      Sort-Object Name -Descending |
      ForEach-Object {
        $p = Join-Path $_.FullName ".env.local"
        if (Test-Path $p) {
          $hits += [PSCustomObject]@{ Path = $p; Modified = (Get-Item $p).LastWriteTime; Dir = $_.FullName }
        }
      }
  }
  if ($hits.Count -eq 0) { return $null }
  return ($hits | Sort-Object Modified -Descending | Select-Object -First 1)
}

if (-not (Test-Path $primaryEnv)) {
  $backup = Find-LatestBackupEnv
  if ($backup) {
    Copy-Item -LiteralPath $backup.Path -Destination $primaryEnv -Force
    Write-Ok "Restored .env.local from backup $($backup.Dir)"
  } else {
    # Also check D:\medscope.data\secrets for stripe webhook file to at least warn
    Write-Err2 "No D:\medscope.local\.env.local and no backup copies found."
    Write-Host "Recover via Vercel env pull or Cloudflare dashboard — see docs/deploy/RESTORE_FROM_D.md"
    exit 2
  }
} else {
  Write-Ok "Primary .env.local present"
  # If key CF tokens missing, try merge from newest backup without overwriting existing non-empty
  $needed = @("CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "SUPABASE_SERVICE_ROLE_KEY", "STRIPE_SECRET_KEY")
  $primaryText = Get-Content -LiteralPath $primaryEnv -Raw -ErrorAction SilentlyContinue
  $missing = @()
  foreach ($k in $needed) {
    if ($primaryText -notmatch "(?m)^$k=.+") { $missing += $k }
  }
  if ($missing.Count -gt 0) {
    $backup = Find-LatestBackupEnv
    if ($backup -and $backup.Path -ne $primaryEnv) {
      Write-Warn2 "Primary missing $($missing -join ', ') — merging from $($backup.Path)"
      $backupMap = @{}
      foreach ($line in Get-Content -LiteralPath $backup.Path -Encoding UTF8) {
        if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }
        if ($line -match '^\s*([^=]+)=(.*)$') { $backupMap[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'") }
      }
      $primaryMap = @{}
      foreach ($line in Get-Content -LiteralPath $primaryEnv -Encoding UTF8) {
        if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }
        if ($line -match '^\s*([^=]+)=(.*)$') { $primaryMap[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'") }
      }
      $filled = @()
      foreach ($k in $missing) {
        if ($backupMap.ContainsKey($k) -and -not [string]::IsNullOrWhiteSpace($backupMap[$k])) {
          $primaryMap[$k] = $backupMap[$k]
          $filled += $k
        }
      }
      # Also merge STRIPE_WEBHOOK_SECRET / CRON if present in backup and missing
      foreach ($k in @("STRIPE_WEBHOOK_SECRET", "CRON_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")) {
        if ((-not $primaryMap.ContainsKey($k) -or [string]::IsNullOrWhiteSpace($primaryMap[$k])) -and $backupMap.ContainsKey($k)) {
          $primaryMap[$k] = $backupMap[$k]
          $filled += $k
        }
      }
      if ($filled.Count -gt 0) {
        $lines = @(
          "# MedScopeGlobal — local environment (do not commit)",
          "# Auto-merged from backup by scripts/auto-restore-from-d.ps1",
          "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        )
        foreach ($k in $primaryMap.Keys) {
          $v = [string]$primaryMap[$k]
          if ($v -match '[\s#"\\]') {
            $escaped = $v.Replace('\', '\\').Replace('"', '\"')
            $lines += "$k=`"$escaped`""
          } else {
            $lines += "$k=$v"
          }
        }
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllLines($primaryEnv, $lines, $utf8NoBom)
        Write-Ok "Filled from backup: $($filled -join ', ')"
      }
    }
  }
}

# Optional stripe webhook file
$stripeSecretFile = "D:\medscope.data\secrets\stripe-webhook-secret.txt"
if (Test-Path $stripeSecretFile) {
  $wh = (Get-Content -LiteralPath $stripeSecretFile -Raw).Trim()
  if ($wh -and (Get-Content -LiteralPath $primaryEnv -Raw) -notmatch '(?m)^STRIPE_WEBHOOK_SECRET=.+') {
    Add-Content -LiteralPath $primaryEnv -Value "STRIPE_WEBHOOK_SECRET=$wh"
    Write-Ok "Appended STRIPE_WEBHOOK_SECRET from D:\medscope.data\secrets\"
  }
}

Write-Step "3/6 restore-from-d (ForceKeys + cf:env:sync + gh secrets)"
$restoreArgs = @{
  WorkspaceRoot = $WorkspaceRoot
  SourceRoot    = $WorkspaceRoot
  ForceKeys     = $true
}
if ($SkipGhSecrets) { $restoreArgs.SkipGhSecrets = $true }
if ($SkipValidate) { $restoreArgs.SkipValidate = $true }
& powershell -ExecutionPolicy Bypass -File $restoreScript @restoreArgs
if ($LASTEXITCODE -ne 0) { throw "restore-from-d failed (exit $LASTEXITCODE)" }
Write-Ok "restore-from-d complete"

Write-Step "4/6 dated backup"
$backupArgs = @{
  WorkspaceRoot = $WorkspaceRoot
  BackupDate    = (Get-Date).ToString("yyyy-MM-dd")
}
if ($IncludeZip) { $backupArgs.IncludeZip = $true }
& powershell -ExecutionPolicy Bypass -File $backupScript @backupArgs
if ($LASTEXITCODE -ne 0) { Write-Warn2 "backup-to-d exited $LASTEXITCODE" }
else { Write-Ok "backup written under D:\medscope.data\backups\" }

Write-Step "5/6 db:verify + deploy"
Push-Location $WorkspaceRoot
try {
  $pnpm = (Get-Command pnpm -ErrorAction SilentlyContinue).Source
  if ($pnpm) {
    & $pnpm db:verify
    if ($LASTEXITCODE -ne 0) {
      Write-Warn2 "db:verify failed — try: pnpm db:trigger-ecosystem-cron && pnpm db:verify"
    } else {
      Write-Ok "db:verify passed"
    }
  }

  if (-not $SkipDeploy) {
    if (-not (Test-Path $deployScript)) { throw "Missing $deployScript" }
    & powershell -ExecutionPolicy Bypass -File $deployScript -SkipRestore
    if ($LASTEXITCODE -ne 0) { throw "deploy:production failed (exit $LASTEXITCODE)" }
    Write-Ok "deploy:production finished"
  } else {
    Write-Host "Skipping deploy (-SkipDeploy). When ready:"
    Write-Host "  pnpm deploy:production -- -SkipRestore"
  }
} finally {
  Pop-Location
}

Write-Step "6/6 Stripe webhook reminder + prod probe"
$envLocalText = if (Test-Path $primaryEnv) { Get-Content -LiteralPath $primaryEnv -Raw } else { "" }
$hasWhsec = $envLocalText -match '(?m)^STRIPE_WEBHOOK_SECRET=.+'
if (-not $hasWhsec) {
  Write-Warn2 "STRIPE_WEBHOOK_SECRET missing — Checkout redirect works without it; fulfillment does not."
  Write-Host @"

Stripe webhook (one-time on PC):
  cd D:\medscope.local
  node scripts\setup-stripe-webhook.mjs
  # Endpoint: https://medscopeglobal.com/api/stripe/webhook
  # Copy whsec_… → Worker secret STRIPE_WEBHOOK_SECRET  (or append to .env.local + pnpm cf:env:sync)
"@
} else {
  Write-Ok "STRIPE_WEBHOOK_SECRET present in .env.local — ensure it is synced to the Worker"
}

Push-Location $WorkspaceRoot
try {
  $pnpm = (Get-Command pnpm -ErrorAction SilentlyContinue).Source
  if ($pnpm) {
    & $pnpm probe:prod:stripe
    if ($LASTEXITCODE -eq 0) {
      Write-Ok "probe:prod:stripe passed (fetch client + mediflow.webp)"
    } else {
      Write-Warn2 "probe:prod:stripe failed — deploy may still be propagating; re-run: pnpm probe:prod:stripe"
    }
  }
} finally {
  Pop-Location
}

Write-Step "Done — also paste into Cursor Secrets"
Write-Host @"
Cursor Dashboard → Cloud Agents → medscopeglobal → Secrets:
  CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CRON_SECRET
  (+ CLOUDFLARE_ENV_JSON from scripts\cloudflare\.env.cloudflare.json)

Then start a NEW cloud agent run (existing pods do not pick up new secrets).

One-button (this script):  pnpm auto:d
Cloud without D::         pnpm auto:continue

Smoke:
  pnpm probe:prod:stripe
  pnpm smoke:production
  curl.exe -sI https://medscopeglobal.com/assets/marketing/mediflow.webp
"@
Write-Ok "auto-restore-from-d complete"
