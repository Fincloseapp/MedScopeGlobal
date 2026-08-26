#Requires -Version 5.1
<#
.SYNOPSIS
  List every MedScope env / secrets file on Windows D: (names only — never prints values).

.DESCRIPTION
  Run on the PC. Cloud agents cannot mount D:. Use this before restore:d or when
  troubleshooting missing CLOUDFLARE_* / SUPABASE_* keys.

  Searches:
    D:\medscope.local
    D:\medscope.data  (+ backups\, secrets\)
    D:\medscope.logs

.PARAMETER MaxDepth
  Max directory depth for recursive file search (default 6).

.PARAMETER IncludeBackups
  Also scan D:\medscope.data\backups and D:\medscope.local\backups (default true).

.EXAMPLE
  pnpm find:d
  powershell -ExecutionPolicy Bypass -File .\scripts\find-d-drive.ps1
#>
[CmdletBinding()]
param(
  [int]$MaxDepth = 6,
  [switch]$IncludeBackups = $true
)

$ErrorActionPreference = "Continue"

$CanonicalRoots = @(
  "D:\medscope.local",
  "D:\medscope.data",
  "D:\medscope.logs"
)

$EnvPatterns = @(
  ".env.local",
  ".env.production.local",
  ".env.vercel.local",
  ".dev.vars",
  ".env.cloudflare.json"
)

$KeyPatterns = @(
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_ENV_JSON",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "CRON_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "VERCEL_TOKEN",
  "VERCEL_ORG_ID",
  "VERCEL_PROJECT_ID",
  "GITHUB_TOKEN",
  "GH_TOKEN"
)

function Write-Step([string]$msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Ok([string]$msg) { Write-Host "OK  $msg" -ForegroundColor Green }
function Write-Warn2([string]$msg) { Write-Warning $msg }
function Write-Err2([string]$msg) { Write-Host "ERR $msg" -ForegroundColor Red }

function Get-EnvKeyNames([string]$path) {
  $names = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  if (-not (Test-Path -LiteralPath $path)) { return @() }
  try {
    foreach ($line in Get-Content -LiteralPath $path -Encoding UTF8 -ErrorAction Stop) {
      if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }
      if ($line -match '^\s*([^=]+)=') {
        [void]$names.Add($matches[1].Trim())
      }
    }
  } catch {
    Write-Warn2 "Could not read $path : $_"
  }
  return @($names)
}

function Get-JsonTopKeys([string]$path) {
  if (-not (Test-Path -LiteralPath $path)) { return @() }
  try {
    $obj = Get-Content -LiteralPath $path -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($obj -is [System.Collections.IDictionary]) {
      return @($obj.Keys)
    }
    return @($obj.PSObject.Properties.Name)
  } catch {
    Write-Warn2 "Could not parse JSON $path : $_"
    return @()
  }
}

function Test-HasKey([string[]]$keys, [string]$name) {
  return $keys -contains $name
}

Write-Step "D: drive availability"
if (-not (Test-Path "D:\")) {
  Write-Err2 "D: drive is NOT mounted on this machine."
  Write-Host @"

Cloud agents cannot access Windows D:. Run this script on the PC:

  cd D:\medscope.local
  pnpm find:d

Canonical paths (expected on PC):
  Project  D:\medscope.local
  Data     D:\medscope.data
  Logs     D:\medscope.logs
"@
  exit 2
}
Write-Ok "D: drive present"

Write-Step "Canonical roots"
$foundRoots = @()
foreach ($root in $CanonicalRoots) {
  if (Test-Path $root) {
    $foundRoots += $root
    $item = Get-Item $root
    Write-Ok "$root (exists, last write $($item.LastWriteTime.ToString('yyyy-MM-dd HH:mm')))"
  } else {
    Write-Warn2 "Missing: $root"
  }
}

Write-Step "Known env file locations (exact paths)"
$exactCandidates = @(
  "D:\medscope.local\.env.local",
  "D:\medscope.local\.dev.vars",
  "D:\medscope.local\scripts\cloudflare\.env.cloudflare.json",
  "D:\medscope.local\.env.production.local",
  "D:\medscope.local\.env.vercel.local",
  "D:\medscope.data\secrets\stripe-webhook-secret.txt"
)
foreach ($p in $exactCandidates) {
  if (Test-Path -LiteralPath $p) {
    $fi = Get-Item -LiteralPath $p
    Write-Ok "$p ($($fi.Length) bytes, $($fi.LastWriteTime.ToString('yyyy-MM-dd HH:mm')))"
  } else {
    Write-Host "  — $p"
  }
}

Write-Step "Recursive search (depth $MaxDepth) for env patterns"
$searchRoots = @($foundRoots)
if ($IncludeBackups) {
  foreach ($b in @("D:\medscope.data\backups", "D:\medscope.local\backups")) {
    if (Test-Path $b) { $searchRoots += $b }
  }
}

$discovered = [System.Collections.Generic.List[object]]::new()
foreach ($root in ($searchRoots | Select-Object -Unique)) {
  foreach ($pat in $EnvPatterns) {
    try {
      Get-ChildItem -Path $root -Filter $pat -Recurse -Depth $MaxDepth -File -ErrorAction SilentlyContinue |
        ForEach-Object {
          $discovered.Add([PSCustomObject]@{
            Path       = $_.FullName
            Length     = $_.Length
            Modified   = $_.LastWriteTime
            Pattern    = $pat
          })
        }
    } catch {
      Write-Warn2 "Search failed under $root for $pat : $_"
    }
  }
}

$uniqueFiles = $discovered | Sort-Object Path -Unique
if ($uniqueFiles.Count -eq 0) {
  Write-Err2 "No env / secrets files found on D:"
} else {
  Write-Ok "Found $($uniqueFiles.Count) file(s)"
  $uniqueFiles | ForEach-Object {
    Write-Host ("  {0}  ({1} bytes, {2})" -f $_.Path, $_.Length, $_.Modified.ToString("yyyy-MM-dd HH:mm"))
  }
}

Write-Step "Key names per file (values NEVER printed)"
$summary = @{}
foreach ($f in $uniqueFiles) {
  $path = $f.Path
  $keys = @()
  if ($path -match '\.json$') {
    $keys = Get-JsonTopKeys $path
  } else {
    $keys = Get-EnvKeyNames $path
  }
  Write-Host "`n--- $path ---"
  if ($keys.Count -eq 0) {
    Write-Warn2 "  (empty or unreadable)"
    continue
  }
  Write-Host "  Keys ($($keys.Count)): $($keys -join ', ')"
  $present = @()
  $missing = @()
  foreach ($k in $KeyPatterns) {
    if (Test-HasKey $keys $k) { $present += $k } else { $missing += $k }
  }
  if ($present.Count -gt 0) {
    Write-Ok "  Important present: $($present -join ', ')"
    $summary[$path] = $present
  }
  if ($missing.Count -gt 0) {
    Write-Host "  Important missing: $($missing -join ', ')" -ForegroundColor DarkYellow
  }
}

Write-Step "Backup folders with .env.local"
$backupEnvHits = @()
foreach ($bRoot in @("D:\medscope.data\backups", "D:\medscope.local\backups")) {
  if (-not (Test-Path $bRoot)) { continue }
  Get-ChildItem -Path $bRoot -Directory -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    ForEach-Object {
      $envCopy = Join-Path $_.FullName ".env.local"
      if (Test-Path $envCopy) {
        $backupEnvHits += [PSCustomObject]@{
          BackupDir = $_.FullName
          EnvFile   = $envCopy
          Modified  = (Get-Item $envCopy).LastWriteTime
        }
      }
    }
}
if ($backupEnvHits.Count -eq 0) {
  Write-Warn2 "No .env.local copies in backup folders"
} else {
  $backupEnvHits | Select-Object -First 10 | ForEach-Object {
    Write-Ok "$($_.EnvFile) (backup $($_.BackupDir), $($_.Modified.ToString('yyyy-MM-dd HH:mm')))"
  }
  if ($backupEnvHits.Count -gt 10) {
    Write-Host "  ... and $($backupEnvHits.Count - 10) more"
  }
}

Write-Step "Recommended next steps"
Write-Host @"
1. Primary restore:  cd D:\medscope.local && pnpm restore:d
2. If .env.local missing, copy from newest backup above, then restore:d
3. Full PC flow:
     git pull origin main
     pnpm sync:d
     pnpm db:verify
     pnpm deploy:production -- -SkipRestore
4. Push secrets to GitHub / Cursor — see docs/deploy/RESTORE_FROM_D.md §4–5
5. Migrations pending? pnpm db:trigger-ecosystem-cron && pnpm db:verify
6. Editorial images: pnpm images:backfill
"@

if ($summary.ContainsKey("D:\medscope.local\.env.local")) {
  $cf = @("CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID") | Where-Object {
    $summary["D:\medscope.local\.env.local"] -contains $_
  }
  if ($cf.Count -eq 2) {
    Write-Ok "D:\medscope.local\.env.local has both CLOUDFLARE_* keys — ready for restore:d -Deploy"
  } else {
    Write-Warn2 "D:\medscope.local\.env.local missing CLOUDFLARE_* — check backups or Cloudflare dashboard"
  }
} else {
  Write-Err2 "D:\medscope.local\.env.local not found — create or recover from backup / Vercel pull"
}

Write-Ok "find-d-drive complete (names only, no secret values logged)"
