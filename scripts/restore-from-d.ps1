#Requires -Version 5.1
<#
.SYNOPSIS
  Restore / select required secrets from D:\medscope.local into the workspace .env.local,
  sync Cloudflare env JSON, optionally push GitHub secrets, validate, and optionally deploy.

.DESCRIPTION
  Run on the Windows PC (cloud agents cannot read D:). Never commit .env.local.

  Sources (in order, later does not overwrite existing target keys unless -ForceKeys):
    1. D:\medscope.local\.env.local
    2. D:\medscope.local\.dev.vars (if present)
    3. Optional -SourceEnv path

.PARAMETER WorkspaceRoot
  Target repo root. Default: D:\medscope.local (or parent of this script if already on D:).

.PARAMETER SourceRoot
  Canonical secrets root. Default: D:\medscope.local

.PARAMETER SkipGhSecrets
  Do not run `gh secret set`.

.PARAMETER SkipValidate
  Skip pnpm deploy:checklist / typecheck+test.

.PARAMETER Deploy
  After validation, run `pnpm cf:deploy`.

.PARAMETER ForceKeys
  Overwrite existing workspace .env.local keys with values from D: sources.

.EXAMPLE
  pnpm restore:d
  powershell -ExecutionPolicy Bypass -File .\scripts\restore-from-d.ps1 -Deploy
#>
[CmdletBinding()]
param(
  [string]$WorkspaceRoot = "",
  [string]$SourceRoot = "D:\medscope.local",
  [switch]$SkipGhSecrets,
  [switch]$SkipValidate,
  [switch]$Deploy,
  [switch]$ForceKeys
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Ok([string]$msg) { Write-Host "OK  $msg" -ForegroundColor Green }
function Write-Warn2([string]$msg) { Write-Warning $msg }
function Write-Err2([string]$msg) { Write-Host "ERR $msg" -ForegroundColor Red }

# --- Required / recommended key selection from D: ---
$RequiredKeys = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
)

$RecommendedKeys = @(
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "CRON_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "VERCEL_TOKEN",
  "VERCEL_ORG_ID",
  "VERCEL_PROJECT_ID",
  "GITHUB_TOKEN",
  "GH_TOKEN",
  "OPENAI_API_KEY",
  "GROQ_API_KEY",
  "SENDGRID_API_KEY",
  "NEXT_PUBLIC_SITE_URL"
)

$AllSelectKeys = @($RequiredKeys + $RecommendedKeys | Select-Object -Unique)

function Test-DDriveAvailable {
  if (-not (Test-Path "D:\")) {
    Write-Err2 "D: drive is not available on this machine."
    Write-Host @"

Cloud agents cannot access Windows D:. Run this script on the PC:

  cd D:\medscope.local
  pnpm restore:d

Canonical paths:
  Project  D:\medscope.local
  Data     D:\medscope.data
  Logs     D:\medscope.logs
"@
    exit 2
  }
}

function Resolve-WorkspaceRoot {
  param([string]$Hint)
  if ($Hint -and (Test-Path $Hint)) { return (Resolve-Path $Hint).Path }
  if (Test-Path $SourceRoot) { return (Resolve-Path $SourceRoot).Path }
  $scriptParent = Split-Path -Parent $PSScriptRoot
  if (Test-Path (Join-Path $scriptParent "package.json")) { return $scriptParent }
  throw "Cannot resolve workspace root. Pass -WorkspaceRoot D:\medscope.local"
}

function Read-EnvFile([string]$path) {
  $map = [ordered]@{}
  if (-not (Test-Path $path)) { return $map }
  foreach ($line in Get-Content -LiteralPath $path -Encoding UTF8) {
    if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }
    if ($line -match '^\s*([^=]+)=(.*)$') {
      $k = $matches[1].Trim()
      $v = $matches[2].Trim().Trim('"').Trim("'")
      if ($k) { $map[$k] = $v }
    }
  }
  return $map
}

function Merge-EnvMaps {
  param(
    [System.Collections.IDictionary]$Target,
    [System.Collections.IDictionary]$Source,
    [string[]]$Keys,
    [bool]$Force
  )
  $copied = @()
  foreach ($k in $Keys) {
    if (-not $Source.Contains($k)) { continue }
    $val = [string]$Source[$k]
    if ([string]::IsNullOrWhiteSpace($val)) { continue }
    if ($Force -or -not $Target.Contains($k) -or [string]::IsNullOrWhiteSpace([string]$Target[$k])) {
      $Target[$k] = $val
      $copied += $k
    }
  }
  return $copied
}

function Write-EnvFile([string]$path, [System.Collections.IDictionary]$map) {
  $lines = @(
    "# MedScopeGlobal — local environment (do not commit)",
    "# Restored/merged from D:\medscope.local by scripts/restore-from-d.ps1",
    "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  )
  foreach ($k in $map.Keys) {
    $v = [string]$map[$k]
    if ($v -match '[\s#"\\]') {
      $escaped = $v.Replace('\', '\\').Replace('"', '\"')
      $lines += "$k=`"$escaped`""
    } else {
      $lines += "$k=$v"
    }
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllLines($path, $lines, $utf8NoBom)
}

function Get-EnvValueFromMap([System.Collections.IDictionary]$map, [string]$key) {
  if ($map.Contains($key)) { return [string]$map[$key] }
  return $null
}

# ----- main -----
Test-DDriveAvailable

if (-not (Test-Path $SourceRoot)) {
  Write-Err2 "Source root not found: $SourceRoot"
  Write-Host "Clone the repo first: git clone <repo-url> D:\medscope.local"
  exit 2
}

$WorkspaceRoot = Resolve-WorkspaceRoot -Hint $WorkspaceRoot
Write-Step "Workspace: $WorkspaceRoot"
Write-Host "Source:    $SourceRoot"

$sourceEnv = Join-Path $SourceRoot ".env.local"
$sourceDevVars = Join-Path $SourceRoot ".dev.vars"
$targetEnv = Join-Path $WorkspaceRoot ".env.local"

function Find-LatestBackupEnvFile {
  $candidates = [System.Collections.Generic.List[string]]::new()
  foreach ($bRoot in @("D:\medscope.data\backups", (Join-Path $SourceRoot "backups"))) {
    if (-not (Test-Path $bRoot)) { continue }
    Get-ChildItem -Path $bRoot -Directory -ErrorAction SilentlyContinue |
      Sort-Object Name -Descending |
      ForEach-Object {
        $p = Join-Path $_.FullName ".env.local"
        if (Test-Path $p) { $candidates.Add($p) }
      }
  }
  if ($candidates.Count -eq 0) { return $null }
  return $candidates[0]
}

if (-not (Test-Path $sourceEnv)) {
  Write-Warn2 "Missing $sourceEnv — searching D: backups..."
  $backupEnv = Find-LatestBackupEnvFile
  if ($backupEnv) {
    Write-Ok "Using backup copy: $backupEnv"
    $sourceEnv = $backupEnv
  } else {
    Write-Err2 "Missing $sourceEnv and no backup .env.local under D:\medscope.data\backups or D:\medscope.local\backups"
    Write-Host "Run on PC: pnpm find:d — then recover (see docs/deploy/RESTORE_FROM_D.md §5–7)."
    exit 2
  }
}

Write-Step "Reading D: env sources"
$fromLocal = Read-EnvFile $sourceEnv
Write-Ok ".env.local keys: $($fromLocal.Count)"
$fromDev = Read-EnvFile $sourceDevVars
if ($fromDev.Count -gt 0) { Write-Ok ".dev.vars keys: $($fromDev.Count)" }

$target = Read-EnvFile $targetEnv
$beforeCount = $target.Count

$copied1 = Merge-EnvMaps -Target $target -Source $fromLocal -Keys $AllSelectKeys -Force:$ForceKeys
$copied2 = Merge-EnvMaps -Target $target -Source $fromDev -Keys $AllSelectKeys -Force:$ForceKeys
# Also merge any CLOUDFLARE_* / SUPABASE_* / STRIPE_* present in sources beyond the list
$extraPattern = '^(NEXT_PUBLIC_SUPABASE_|SUPABASE_|CLOUDFLARE_|STRIPE_|CRON_SECRET|NEXT_PUBLIC_STRIPE_)'
foreach ($src in @($fromLocal, $fromDev)) {
  foreach ($k in @($src.Keys)) {
    if ($k -match $extraPattern -and ($ForceKeys -or -not $target.Contains($k) -or [string]::IsNullOrWhiteSpace([string]$target[$k]))) {
      if (-not [string]::IsNullOrWhiteSpace([string]$src[$k])) {
        $target[$k] = $src[$k]
        if ($copied1 -notcontains $k -and $copied2 -notcontains $k) { $copied1 += $k }
      }
    }
  }
}

Write-Step "Writing workspace .env.local (never commit)"
Write-EnvFile -path $targetEnv -map $target
$allCopied = @($copied1 + $copied2 | Select-Object -Unique)
Write-Ok "Merged $($allCopied.Count) selected key(s); file now has $($target.Count) keys (was $beforeCount)"
if ($allCopied.Count -gt 0) {
  Write-Host "Updated: $($allCopied -join ', ')"
}

Write-Step "Validating required keys (names only)"
$missing = @()
foreach ($k in $RequiredKeys) {
  $v = Get-EnvValueFromMap $target $k
  if ([string]::IsNullOrWhiteSpace($v)) { $missing += $k; Write-Err2 "MISSING $k" }
  else { Write-Ok "$k (len=$($v.Length))" }
}
$recMissing = @()
foreach ($k in @("CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "CRON_SECRET")) {
  $v = Get-EnvValueFromMap $target $k
  if ([string]::IsNullOrWhiteSpace($v)) { $recMissing += $k; Write-Warn2 "recommended missing: $k" }
  else { Write-Ok "$k (len=$($v.Length))" }
}
if ($missing.Count -gt 0) {
  Write-Err2 "Required keys missing: $($missing -join ', ')"
  exit 1
}

Push-Location $WorkspaceRoot
try {
  $pnpm = (Get-Command pnpm -ErrorAction SilentlyContinue).Source
  if (-not $pnpm) { throw "pnpm not found on PATH" }

  Write-Step "pnpm cf:env:sync"
  & $pnpm cf:env:sync
  if ($LASTEXITCODE -ne 0) { throw "pnpm cf:env:sync failed (exit $LASTEXITCODE)" }
  $cfJson = Join-Path $WorkspaceRoot "scripts\cloudflare\.env.cloudflare.json"
  if (Test-Path $cfJson) { Write-Ok "Wrote $cfJson" }
  else { Write-Warn2 "Expected $cfJson not found after sync" }

  if (-not $SkipGhSecrets) {
    Write-Step "GitHub secrets (optional)"
    $gh = (Get-Command gh -ErrorAction SilentlyContinue).Source
    if (-not $gh) {
      Write-Warn2 "gh not on PATH — skip GitHub secrets. Install GitHub CLI or re-run after auth."
    } else {
      $authOk = $false
      & $gh auth status 2>$null | Out-Null
      if ($LASTEXITCODE -eq 0) { $authOk = $true }
      if (-not $authOk) {
        Write-Warn2 "gh not authenticated — skip. Run: gh auth login"
      } else {
        function Set-GhSecretFromMap([string]$name) {
          $body = Get-EnvValueFromMap $target $name
          if ([string]::IsNullOrWhiteSpace($body)) {
            Write-Warn2 "skip gh secret $name (empty)"
            return
          }
          $body | & $gh secret set $name
          if ($LASTEXITCODE -ne 0) { throw "gh secret set $name failed" }
          Write-Ok "gh secret set $name"
        }
        Set-GhSecretFromMap "CLOUDFLARE_API_TOKEN"
        Set-GhSecretFromMap "CLOUDFLARE_ACCOUNT_ID"
        Set-GhSecretFromMap "CRON_SECRET"
        if (Test-Path $cfJson) {
          & $gh secret set CLOUDFLARE_ENV_JSON --body (Get-Content -LiteralPath $cfJson -Raw)
          if ($LASTEXITCODE -ne 0) { throw "gh secret set CLOUDFLARE_ENV_JSON failed" }
          Write-Ok "gh secret set CLOUDFLARE_ENV_JSON"
        }
        Write-Host "Verify names only: gh secret list"
      }
    }
  } else {
    Write-Host "Skipping GitHub secrets (-SkipGhSecrets)"
  }

  if (-not $SkipValidate) {
    Write-Step "Validation"
    & $pnpm deploy:checklist
    if ($LASTEXITCODE -ne 0) {
      Write-Warn2 "deploy:checklist failed — trying typecheck + test"
      & $pnpm typecheck
      if ($LASTEXITCODE -ne 0) { throw "pnpm typecheck failed" }
      & $pnpm test
      if ($LASTEXITCODE -ne 0) { throw "pnpm test failed" }
    } else {
      Write-Ok "deploy:checklist passed"
    }
  }

  if ($Deploy) {
    Write-Step "pnpm cf:deploy"
    $token = Get-EnvValueFromMap $target "CLOUDFLARE_API_TOKEN"
    $acct = Get-EnvValueFromMap $target "CLOUDFLARE_ACCOUNT_ID"
    if ([string]::IsNullOrWhiteSpace($token) -or [string]::IsNullOrWhiteSpace($acct)) {
      throw "Cannot deploy: CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID missing"
    }
    $env:CLOUDFLARE_API_TOKEN = $token
    $env:CLOUDFLARE_ACCOUNT_ID = $acct
    & $pnpm cf:deploy
    if ($LASTEXITCODE -ne 0) { throw "pnpm cf:deploy failed" }
    Write-Ok "Deploy finished — smoke: pnpm cf:smoke"
  }
} finally {
  Pop-Location
}

Write-Step "Next steps"
Write-Host @"
1. Paste secrets into Cursor Cloud Agents environment (see docs/deploy/RESTORE_FROM_D.md §3)
2. Backup:  pnpm backup:d
3. One-shot: pnpm sync:d
4. Deploy:  pnpm restore:d -- -Deploy   (or pnpm cf:deploy)
5. Smoke:   pnpm cf:smoke
"@
Write-Ok "restore-from-d complete"
