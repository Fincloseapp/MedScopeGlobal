#Requires -Version 5.1
<#
.SYNOPSIS
  Create a dated backup of MedScopeGlobal onto D: (git bundle + .env.local + docs + manifest).

.DESCRIPTION
  Run on the Windows PC. Cloud agents cannot write D:.

  Default destination:
    D:\medscope.data\backups\YYYY-MM-DD\
  Fallback (if data root missing):
    D:\medscope.local\backups\YYYY-MM-DD-HHMM\

  WARNING: .env.local is copied into the backup folder (SENSITIVE). Keep backups offline / ACL-restricted.

.PARAMETER WorkspaceRoot
  Repo root. Default: D:\medscope.local

.PARAMETER BackupDate
  Date stamp (yyyy-MM-dd). Default: today (local).

.PARAMETER IncludeZip
  Also write a source zip excluding node_modules/.next/.git

.PARAMETER BackupRoot
  Override backup parent directory.

.EXAMPLE
  pnpm backup:d
  powershell -File .\scripts\backup-to-d.ps1 -BackupDate 2026-08-26 -IncludeZip
#>
[CmdletBinding()]
param(
  [string]$WorkspaceRoot = "D:\medscope.local",
  [string]$BackupDate = "",
  [switch]$IncludeZip,
  [string]$BackupRoot = ""
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Ok([string]$msg) { Write-Host "OK  $msg" -ForegroundColor Green }
function Write-Err2([string]$msg) { Write-Host "ERR $msg" -ForegroundColor Red }

if (-not (Test-Path "D:\")) {
  Write-Err2 "D: drive is not available on this machine."
  Write-Host @"

Cloud agents cannot write Windows D:. Run on the PC:

  cd D:\medscope.local
  pnpm backup:d

Backup lands under:
  D:\medscope.data\backups\<yyyy-MM-dd>\
  or D:\medscope.local\backups\<yyyy-MM-dd-HHmm>\
"@
  exit 2
}

if (-not (Test-Path $WorkspaceRoot)) {
  Write-Err2 "Workspace not found: $WorkspaceRoot"
  exit 2
}
$WorkspaceRoot = (Resolve-Path $WorkspaceRoot).Path

$now = Get-Date
if (-not $BackupDate) { $BackupDate = $now.ToString("yyyy-MM-dd") }
$timeStamp = $now.ToString("HHmm")

$dataBackups = "D:\medscope.data\backups"
$localBackups = Join-Path $WorkspaceRoot "backups"

if ($BackupRoot) {
  $destParent = $BackupRoot
  $destDir = Join-Path $destParent $BackupDate
} elseif (Test-Path "D:\medscope.data") {
  if (-not (Test-Path $dataBackups)) {
    New-Item -ItemType Directory -Path $dataBackups -Force | Out-Null
  }
  $destParent = $dataBackups
  $destDir = Join-Path $destParent $BackupDate
} else {
  Write-Warning "D:\medscope.data missing — using $localBackups"
  if (-not (Test-Path $localBackups)) {
    New-Item -ItemType Directory -Path $localBackups -Force | Out-Null
  }
  $destParent = $localBackups
  $destDir = Join-Path $destParent ("{0}-{1}" -f $BackupDate, $timeStamp)
}

# If dated folder already exists, nest a HHMM subfolder to avoid clobber
if (Test-Path $destDir) {
  $nested = Join-Path $destDir $timeStamp
  Write-Warning "Backup folder exists; using $nested"
  $destDir = $nested
}
New-Item -ItemType Directory -Path $destDir -Force | Out-Null

Write-Step "Backup destination"
Write-Host $destDir
Write-Host ""
Write-Host "WARNING: This folder may contain .env.local (secrets). Do not sync to public remotes." -ForegroundColor Yellow

$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git) { throw "git not found on PATH" }

Push-Location $WorkspaceRoot
try {
  $branch = (& $git rev-parse --abbrev-ref HEAD 2>$null)
  if ($LASTEXITCODE -ne 0) { $branch = "unknown" }
  $sha = (& $git rev-parse HEAD 2>$null)
  if ($LASTEXITCODE -ne 0) { $sha = "unknown" }
  $shortSha = (& $git rev-parse --short HEAD 2>$null)
  if (-not $shortSha) { $shortSha = $sha }
  $statusPorcelain = (& $git status --porcelain 2>$null) -join "`n"

  Write-Step "Git bundle"
  $bundleName = "medscope-{0}-{1}.bundle" -f $BackupDate, $shortSha
  $bundlePath = Join-Path $destDir $bundleName
  & $git bundle create $bundlePath --all
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "git bundle --all failed; trying HEAD only"
    & $git bundle create $bundlePath HEAD
    if ($LASTEXITCODE -ne 0) { throw "git bundle create failed" }
  }
  Write-Ok $bundlePath

  Write-Step "Copy .env.local (SENSITIVE)"
  $envSrc = Join-Path $WorkspaceRoot ".env.local"
  $envIncluded = $false
  if (Test-Path $envSrc) {
    $envDest = Join-Path $destDir ".env.local"
    Copy-Item -LiteralPath $envSrc -Destination $envDest -Force
    $warnFile = Join-Path $destDir "WARNING-CONTAINS-SECRETS.txt"
    @(
      "SENSITIVE BACKUP — contains .env.local",
      "Do not upload to GitHub, chat, or shared drives.",
      "Created: $($now.ToString('yyyy-MM-dd HH:mm:ss'))",
      "Source: $envSrc"
    ) | Set-Content -LiteralPath $warnFile -Encoding UTF8
    $envIncluded = $true
    Write-Ok "Copied .env.local + WARNING-CONTAINS-SECRETS.txt"
  } else {
    Write-Warning ".env.local not found — secrets not backed up"
  }

  # Optional .dev.vars
  $devVars = Join-Path $WorkspaceRoot ".dev.vars"
  $devIncluded = $false
  if (Test-Path $devVars) {
    Copy-Item -LiteralPath $devVars -Destination (Join-Path $destDir ".dev.vars") -Force
    $devIncluded = $true
    Write-Ok "Copied .dev.vars"
  }

  Write-Step "Key docs"
  $docsCopied = @()
  $docCandidates = @(
    "docs\deploy\RESTORE_FROM_D.md",
    "docs\deploy\production-runbook.md",
    "AGENTS.md",
    "wrangler.jsonc",
    "package.json"
  )
  foreach ($rel in $docCandidates) {
    $src = Join-Path $WorkspaceRoot $rel
    if (Test-Path $src) {
      $out = Join-Path $destDir ($rel -replace '\\', '__')
      Copy-Item -LiteralPath $src -Destination $out -Force
      $docsCopied += $rel
    }
  }
  Write-Ok ("Docs: " + ($(if ($docsCopied.Count) { $docsCopied -join ', ' } else { '(none)' })))

  $zipPath = $null
  if ($IncludeZip) {
    Write-Step "Source zip (excludes node_modules/.next/.git)"
    $zipPath = Join-Path $destDir ("medscope-src-{0}-{1}.zip" -f $BackupDate, $shortSha)
    $stage = Join-Path $destDir "_zip_stage"
    if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
    New-Item -ItemType Directory -Path $stage -Force | Out-Null
    # Prefer robocopy on Windows for exclusions
    $xd = @("node_modules", ".next", ".git", ".deploy-tmp", ".build-tmp", ".tools", ".vercel", "backups", "terminals")
    $robArgs = @($WorkspaceRoot, $stage, "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/nc", "/ns", "/np", "/XD") + $xd
    & robocopy @robArgs | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "robocopy staging failed (exit $LASTEXITCODE)" }
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath -Force
    Remove-Item $stage -Recurse -Force
    Write-Ok $zipPath
  }

  Write-Step "BACKUP_MANIFEST.txt"
  $manifestPath = Join-Path $destDir "BACKUP_MANIFEST.txt"
  $included = @(
    "git bundle: $bundleName",
    ".env.local: $(if ($envIncluded) { 'YES (SENSITIVE)' } else { 'NO' })",
    ".dev.vars: $(if ($devIncluded) { 'YES' } else { 'NO' })",
    "docs: $($docsCopied -join ', ')",
    "source zip: $(if ($zipPath) { Split-Path $zipPath -Leaf } else { 'NO (pass -IncludeZip)' })"
  )
  $manifest = @"
MedScopeGlobal backup manifest
==============================
Date (local):     $($now.ToString('yyyy-MM-dd HH:mm:ss'))
BackupDate arg:   $BackupDate
Destination:      $destDir
Workspace:        $WorkspaceRoot

Git
---
Branch:           $branch
Commit SHA:       $sha
Short SHA:        $shortSha

Dirty working tree:
$($(if ($statusPorcelain) { $statusPorcelain } else { '(clean)' }))

Included
--------
$($included -join "`n")

Restore hints
-------------
1. git clone <bundle>  OR  git fetch $bundleName <branch>
2. Copy .env.local back to D:\medscope.local\.env.local (never commit)
3. pnpm install
4. pnpm restore:d   # re-sync CF JSON / optional GH secrets
5. pnpm deploy:checklist

WARNING: Treat this directory as secret if .env.local was included.
"@
  Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding UTF8
  Write-Ok $manifestPath
} finally {
  Pop-Location
}

Write-Step "Done"
Write-Host "Backup folder: $destDir"
Write-Ok "backup-to-d complete"
