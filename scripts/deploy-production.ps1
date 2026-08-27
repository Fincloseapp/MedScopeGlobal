#Requires -Version 5.1
<#
.SYNOPSIS
  One-click production deploy from Windows D: — restore secrets, build+deploy, smoke.

.DESCRIPTION
  Run on the PC (cloud agents cannot access D: or Cloudflare tokens).

  Steps:
    1. restore-from-d.ps1       (secrets → .env.local → cf:env:sync)
    2. pnpm db:verify           (Supabase schema — run after sync:d on PC)
    3. pnpm cf:deploy           (OpenNext build + Workers deploy)
    4. pnpm smoke:production    (homepage / API smoke)
    5. pnpm smoke:ecosystem:production  (MediFlow / editorial smoke)

  Typical PC flow (backup first):
    git pull origin main
    pnpm sync:d                 # restore + D:\medscope.data\backups\<date>\
    pnpm deploy:production -- -SkipRestore

.PARAMETER SkipRestore
  Skip restore-from-d (use after pnpm sync:d).

.PARAMETER SkipValidate
  Skip deploy:checklist during restore.

.PARAMETER SkipGhSecrets
  Skip gh secret set during restore.

.PARAMETER SkipDbVerify
  Skip pnpm db:verify before deploy.

.PARAMETER SkipSmoke
  Skip post-deploy smoke:production and smoke:ecosystem:production.

.EXAMPLE
  pnpm deploy:production
  powershell -File .\scripts\deploy-production.ps1 -SkipRestore
#>
[CmdletBinding()]
param(
  [switch]$SkipRestore,
  [switch]$SkipValidate,
  [switch]$SkipGhSecrets,
  [switch]$SkipDbVerify,
  [switch]$SkipSmoke,
  [string]$WorkspaceRoot = "D:\medscope.local"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) { Write-Host "`n######## $msg ########" -ForegroundColor Magenta }
function Write-Ok([string]$msg) { Write-Host "OK  $msg" -ForegroundColor Green }
function Write-Err2([string]$msg) { Write-Host "ERR $msg" -ForegroundColor Red }

if (-not (Test-Path "D:\")) {
  Write-Err2 "D: drive is not available on this machine."
  Write-Host @"

Cloud agents cannot deploy to production. On the PC run:

  cd D:\medscope.local
  git pull origin main
  pnpm deploy:production

Without D:, use Cloudflare Workers Builds — see docs\deploy\CF_DASHBOARD_DEPLOY.md
"@
  exit 2
}

$scriptDir = $PSScriptRoot
$restoreScript = Join-Path $scriptDir "restore-from-d.ps1"

$step = 1
$totalSteps = 6

if (-not $SkipRestore) {
  if (-not (Test-Path $restoreScript)) { throw "Missing $restoreScript" }
  Write-Step "$step/$totalSteps restore-from-d"
  $restoreArgs = @{ WorkspaceRoot = $WorkspaceRoot }
  if ($SkipGhSecrets) { $restoreArgs.SkipGhSecrets = $true }
  if ($SkipValidate) { $restoreArgs.SkipValidate = $true }
  & $restoreScript @restoreArgs
  if ($LASTEXITCODE -ne 0) { throw "restore-from-d failed (exit $LASTEXITCODE)" }
  $step++
} else {
  Write-Step "$step/$totalSteps restore skipped (-SkipRestore; run pnpm sync:d first for backup)"
  $step++
}

$envLocal = Join-Path $WorkspaceRoot ".env.local"
$hasToken = $false
$hasAccount = $false
if (Test-Path $envLocal) {
  foreach ($line in Get-Content -LiteralPath $envLocal) {
    if ($line -match '^\s*CLOUDFLARE_API_TOKEN=(.+)$' -and $matches[1].Trim()) { $hasToken = $true }
    if ($line -match '^\s*CLOUDFLARE_ACCOUNT_ID=(.+)$' -and $matches[1].Trim()) { $hasAccount = $true }
  }
}

if (-not ($hasToken -and $hasAccount)) {
  Write-Err2 "CLOUDFLARE_API_TOKEN and/or CLOUDFLARE_ACCOUNT_ID missing in $envLocal"
  Write-Host @"

Add Cloudflare credentials to D:\medscope.local\.env.local, then re-run:
  pnpm deploy:production

Or deploy via dashboard (no token on PC):
  docs\deploy\CF_DASHBOARD_DEPLOY.md
"@
  exit 3
}

Push-Location $WorkspaceRoot
try {
  $pnpm = (Get-Command pnpm -ErrorAction SilentlyContinue).Source
  if (-not $pnpm) { throw "pnpm not found on PATH" }

  if (-not $SkipDbVerify) {
    Write-Step "$step/$totalSteps db:verify"
    & $pnpm db:verify
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "db:verify failed — migrations may be pending."
      Write-Host @"

Run one of:
  pnpm db:trigger-ecosystem-cron   # POST /api/cron/apply-ecosystem-migrations on production
  pnpm db:migrate                  # needs SUPABASE_ACCESS_TOKEN on PC
  Manual SQL — see docs\deploy\MANUAL_OPERATOR_CHECKLIST.md §A

Then re-run: pnpm db:verify
"@
      throw "pnpm db:verify failed (exit $LASTEXITCODE)"
    }
    Write-Ok "db:verify passed"
    $step++
  } else {
    Write-Step "$step/$totalSteps db:verify skipped (-SkipDbVerify)"
    $step++
  }

  Write-Step "$step/$totalSteps cf:deploy"
  $env:CLOUDFLARE_API_TOKEN = (Get-Content $envLocal | Where-Object { $_ -match '^\s*CLOUDFLARE_API_TOKEN=' } | ForEach-Object { ($_ -split '=', 2)[1].Trim() } | Select-Object -First 1)
  $env:CLOUDFLARE_ACCOUNT_ID = (Get-Content $envLocal | Where-Object { $_ -match '^\s*CLOUDFLARE_ACCOUNT_ID=' } | ForEach-Object { ($_ -split '=', 2)[1].Trim() } | Select-Object -First 1)
  & $pnpm cf:deploy
  if ($LASTEXITCODE -ne 0) { throw "pnpm cf:deploy failed (exit $LASTEXITCODE)" }
  Write-Ok "Deploy finished"
  $step++

  if (-not $SkipSmoke) {
    Write-Step "$step/$totalSteps smoke:production"
    & $pnpm smoke:production
    if ($LASTEXITCODE -ne 0) { throw "pnpm smoke:production failed (exit $LASTEXITCODE)" }
    Write-Ok "Production smoke passed"
    $step++

    Write-Step "$step/$totalSteps smoke:ecosystem:production"
    & $pnpm smoke:ecosystem:production
    if ($LASTEXITCODE -ne 0) { throw "pnpm smoke:ecosystem:production failed (exit $LASTEXITCODE)" }
    Write-Ok "Ecosystem production smoke passed"
    $step++

    Write-Step "$step/$totalSteps probe:prod:stripe (donate + mediflow.webp)"
    & $pnpm probe:prod:stripe
    if ($LASTEXITCODE -ne 0) { throw "pnpm probe:prod:stripe failed (exit $LASTEXITCODE)" }
    Write-Ok "Stripe/mediflow probe passed"
  } else {
    Write-Step "$step/$totalSteps smoke skipped (-SkipSmoke)"
  }
} finally {
  Pop-Location
}

Write-Host @"

Stripe webhook reminder (if Worker still shows webhookSecretConfigured=false):
  node scripts\setup-stripe-webhook.mjs
  → paste whsec_… into Worker STRIPE_WEBHOOK_SECRET
"@
Write-Ok "deploy-production complete — https://medscopeglobal.com/cs should show VitaScope"
