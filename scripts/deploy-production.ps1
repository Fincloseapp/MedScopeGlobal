#Requires -Version 5.1
<#
.SYNOPSIS
  One-click production deploy from Windows D: — restore secrets, build+deploy, smoke.

.DESCRIPTION
  Run on the PC (cloud agents cannot access D: or Cloudflare tokens).

  Steps:
    1. restore-from-d.ps1  (secrets → .env.local → cf:env:sync)
    2. pnpm cf:deploy      (OpenNext build + Workers deploy)
    3. pnpm smoke:production

.PARAMETER SkipRestore
  Skip restore-from-d (use existing .env.local).

.PARAMETER SkipValidate
  Skip deploy:checklist during restore.

.PARAMETER SkipGhSecrets
  Skip gh secret set during restore.

.PARAMETER SkipSmoke
  Skip post-deploy smoke:production.

.EXAMPLE
  pnpm deploy:production
  powershell -File .\scripts\deploy-production.ps1 -SkipRestore
#>
[CmdletBinding()]
param(
  [switch]$SkipRestore,
  [switch]$SkipValidate,
  [switch]$SkipGhSecrets,
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

if (-not $SkipRestore) {
  if (-not (Test-Path $restoreScript)) { throw "Missing $restoreScript" }
  Write-Step "1/3 restore-from-d"
  $restoreArgs = @{ WorkspaceRoot = $WorkspaceRoot }
  if ($SkipGhSecrets) { $restoreArgs.SkipGhSecrets = $true }
  if ($SkipValidate) { $restoreArgs.SkipValidate = $true }
  & $restoreScript @restoreArgs
  if ($LASTEXITCODE -ne 0) { throw "restore-from-d failed (exit $LASTEXITCODE)" }
} else {
  Write-Step "1/3 restore skipped (-SkipRestore)"
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

  Write-Step "2/3 cf:deploy"
  $env:CLOUDFLARE_API_TOKEN = (Get-Content $envLocal | Where-Object { $_ -match '^\s*CLOUDFLARE_API_TOKEN=' } | ForEach-Object { ($_ -split '=', 2)[1].Trim() } | Select-Object -First 1)
  $env:CLOUDFLARE_ACCOUNT_ID = (Get-Content $envLocal | Where-Object { $_ -match '^\s*CLOUDFLARE_ACCOUNT_ID=' } | ForEach-Object { ($_ -split '=', 2)[1].Trim() } | Select-Object -First 1)
  & $pnpm cf:deploy
  if ($LASTEXITCODE -ne 0) { throw "pnpm cf:deploy failed (exit $LASTEXITCODE)" }
  Write-Ok "Deploy finished"

  if (-not $SkipSmoke) {
    Write-Step "3/3 smoke:production"
    & $pnpm smoke:production
    if ($LASTEXITCODE -ne 0) { throw "pnpm smoke:production failed (exit $LASTEXITCODE)" }
    Write-Ok "Production smoke passed"
  } else {
    Write-Step "3/3 smoke skipped (-SkipSmoke)"
  }
} finally {
  Pop-Location
}

Write-Ok "deploy-production complete — https://medscopeglobal.com/cs should show VitaScope"
