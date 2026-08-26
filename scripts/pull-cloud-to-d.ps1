# Pull current cloud/GitHub state into D:\medscope.local for local PC work.
# Run in PowerShell on the Windows machine (not in Cursor Cloud).
$ErrorActionPreference = "Stop"
$root = "D:\medscope.local"
if (-not (Test-Path $root)) {
  throw "D:\medscope.local not found. Clone the repo there first: git clone <repo-url> D:\medscope.local"
}

Set-Location $root
$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git) { throw "git not found on PATH" }

Write-Host "=== Fetch origin ==="
& $git fetch origin
if ($LASTEXITCODE -ne 0) { throw "git fetch failed" }

# Prefer main (production). Override with: $env:MEDSCOPE_PULL_REF = "cursor/some-branch-cd52"
$ref = if ($env:MEDSCOPE_PULL_REF) { $env:MEDSCOPE_PULL_REF } else { "main" }
Write-Host "=== Checkout + pull $ref ==="
& $git checkout $ref
if ($LASTEXITCODE -ne 0) { throw "git checkout $ref failed" }
& $git pull --rebase origin $ref
if ($LASTEXITCODE -ne 0) {
  Write-Warning "rebase failed — trying merge pull"
  & $git pull origin $ref
  if ($LASTEXITCODE -ne 0) { throw "git pull failed — resolve conflicts in D:\medscope.local" }
}

Write-Host "=== pnpm install ==="
$pnpm = (Get-Command pnpm -ErrorAction SilentlyContinue).Source
if ($pnpm) {
  & $pnpm install
} else {
  Write-Warning "pnpm not on PATH — run pnpm install manually in D:\medscope.local"
}

Write-Host "Done. Local tree matches origin/$ref."
$sha = & $git rev-parse --short HEAD
Write-Host "HEAD=$sha"
Write-Host "Keep .env.local on D: (do not overwrite). Start: pnpm dev"
Write-Host ""
Write-Host "=== Recommended next steps ==="
Write-Host "  pnpm sync:d                              # restore secrets + backup to D:\medscope.data\backups\<date>\"
Write-Host "  pnpm db:verify                           # Supabase schema check"
Write-Host "  pnpm db:trigger-ecosystem-cron           # if migrations pending"
Write-Host "  pnpm deploy:production -- -SkipRestore   # cf:deploy + smoke:production + smoke:ecosystem:production"
Write-Host "  pnpm images:backfill                     # optional editorial cover suggestions"
Write-Host ""
Write-Host "Verify articles: pnpm verify:articles   (or MEDSCOPE_ORIGIN=http://localhost:3000 pnpm verify:articles)"
