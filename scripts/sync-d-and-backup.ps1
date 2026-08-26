#Requires -Version 5.1
<#
.SYNOPSIS
  One-shot: restore secrets from D:, verify, then dated backup to D:.

.DESCRIPTION
  Run on the Windows PC (cloud agents cannot access D:).

  Steps:
    1. restore-from-d.ps1
    2. validation (via restore, unless -SkipValidate)
    3. backup-to-d.ps1 with today's date
    4. Print Cloudflare deploy next steps if token present

.PARAMETER Deploy
  Also run production deploy after restore/validate.

.PARAMETER IncludeZip
  Pass -IncludeZip to backup-to-d.

.PARAMETER SkipGhSecrets
  Skip gh secret set during restore.

.PARAMETER SkipValidate
  Skip deploy:checklist / typecheck+test.

.PARAMETER BackupDate
  Override backup date stamp (default: today yyyy-MM-dd).

.EXAMPLE
  pnpm sync:d
  powershell -File .\scripts\sync-d-and-backup.ps1 -Deploy -IncludeZip
#>
[CmdletBinding()]
param(
  [switch]$Deploy,
  [switch]$IncludeZip,
  [switch]$SkipGhSecrets,
  [switch]$SkipValidate,
  [string]$BackupDate = "",
  [string]$WorkspaceRoot = "D:\medscope.local"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) { Write-Host "`n######## $msg ########" -ForegroundColor Magenta }
function Write-Ok([string]$msg) { Write-Host "OK  $msg" -ForegroundColor Green }
function Write-Err2([string]$msg) { Write-Host "ERR $msg" -ForegroundColor Red }

if (-not (Test-Path "D:\")) {
  Write-Err2 "D: drive is not available on this machine."
  Write-Host @"

Cloud agents cannot access Windows D:. On the PC run:

  cd D:\medscope.local
  git pull origin cursor/global-health-ecosystem-2b2d   # or your branch
  pnpm sync:d

This will:
  1) restore-from-d  (select keys → .env.local → cf:env:sync → optional gh secrets → verify)
  2) backup-to-d     → D:\medscope.data\backups\<yyyy-MM-dd>\
"@
  exit 2
}

$scriptDir = $PSScriptRoot
$restoreScript = Join-Path $scriptDir "restore-from-d.ps1"
$backupScript = Join-Path $scriptDir "backup-to-d.ps1"

if (-not (Test-Path $restoreScript)) { throw "Missing $restoreScript" }
if (-not (Test-Path $backupScript)) { throw "Missing $backupScript" }

if (-not $BackupDate) { $BackupDate = (Get-Date).ToString("yyyy-MM-dd") }

Write-Step "1/3 restore-from-d"
$restoreArgs = @{
  WorkspaceRoot = $WorkspaceRoot
  SourceRoot    = "D:\medscope.local"
}
if ($SkipGhSecrets) { $restoreArgs.SkipGhSecrets = $true }
if ($SkipValidate) { $restoreArgs.SkipValidate = $true }
if ($Deploy) { $restoreArgs.Deploy = $true }

& $restoreScript @restoreArgs
if ($LASTEXITCODE -ne 0) { throw "restore-from-d failed (exit $LASTEXITCODE)" }

Write-Step "2/3 verify summary"
$envLocal = Join-Path $WorkspaceRoot ".env.local"
$hasToken = $false
$hasAccount = $false
if (Test-Path $envLocal) {
  foreach ($line in Get-Content -LiteralPath $envLocal) {
    if ($line -match '^\s*CLOUDFLARE_API_TOKEN=(.+)$' -and $matches[1].Trim()) { $hasToken = $true }
    if ($line -match '^\s*CLOUDFLARE_ACCOUNT_ID=(.+)$' -and $matches[1].Trim()) { $hasAccount = $true }
  }
}
Write-Ok "env present: $(Test-Path $envLocal); CF token: $hasToken; CF account: $hasAccount"

Write-Step "3/3 backup-to-d ($BackupDate)"
$backupArgs = @{
  WorkspaceRoot = $WorkspaceRoot
  BackupDate    = $BackupDate
}
if ($IncludeZip) { $backupArgs.IncludeZip = $true }

& $backupScript @backupArgs
if ($LASTEXITCODE -ne 0) { throw "backup-to-d failed (exit $LASTEXITCODE)" }

Write-Step "Next steps (Cloudflare)"
if ($hasToken -and $hasAccount) {
  Write-Host @"
Cloudflare credentials found in .env.local.

Deploy production from D: (if not already done with -Deploy):
  cd D:\medscope.local
  pnpm deploy:production

Or merge to main + Cloudflare Workers Builds — see docs\deploy\CF_DASHBOARD_DEPLOY.md

Cursor Cloud: paste CLOUDFLARE_* + SUPABASE_* + CLOUDFLARE_ENV_JSON into the environment Secrets dashboard, then start a NEW agent run.
Docs: docs\deploy\RESTORE_FROM_D.md
"@
} else {
  Write-Host @"
CLOUDFLARE_API_TOKEN and/or CLOUDFLARE_ACCOUNT_ID missing — deploy skipped.

Add them to D:\medscope.local\.env.local, then:
  pnpm deploy:production

Or deploy without tokens: docs\deploy\CF_DASHBOARD_DEPLOY.md
"@
}

Write-Ok "sync-d-and-backup complete (backup date $BackupDate)"
