# MedScopeGlobal — automatický commit + push + Vercel production deploy
# Spuštění: powershell -ExecutionPolicy Bypass -File D:\MedScopeGlobal\scripts\auto-deploy.ps1

$ErrorActionPreference = "Stop"
$root = "D:\MedScopeGlobal"
Set-Location $root

Write-Host "=== MedScopeGlobal auto-deploy ===" -ForegroundColor Cyan

# Načtení .env.local
$envFile = Join-Path $root ".env.local"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
      [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
    }
  }
  Write-Host "Loaded .env.local" -ForegroundColor Green
} else {
  Write-Host "Warning: .env.local not found — Vercel API deploy may fail" -ForegroundColor Yellow
}

# Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: git not in PATH" -ForegroundColor Red
  exit 1
}

Write-Host "`n--- Git status ---" -ForegroundColor Cyan
git status -sb

git add -A
$status = git status --porcelain
if ($status) {
  git commit -m "feat: cesky UX, segmenty ctenaru, hlavicka, homepage, sitemap"
  Write-Host "Committed changes." -ForegroundColor Green
} else {
  Write-Host "Nothing to commit (working tree clean)." -ForegroundColor Yellow
}

Write-Host "`n--- Git push ---" -ForegroundColor Cyan
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
try {
  git push origin $branch 2>&1
  Write-Host "Pushed to origin/$branch" -ForegroundColor Green
} catch {
  Write-Host "Trying: git push -u origin HEAD" -ForegroundColor Yellow
  git push -u origin HEAD
}

# Vercel CLI
Write-Host "`n--- Vercel deploy ---" -ForegroundColor Cyan
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: npx not found. Install Node.js LTS." -ForegroundColor Red
  exit 1
}

if ($env:VERCEL_TOKEN) {
  $env:VERCEL_ORG_ID = $env:VERCEL_ORG_ID
  $env:VERCEL_PROJECT_ID = $env:VERCEL_PROJECT_ID
}

npx vercel deploy --prod --yes 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "vercel deploy failed, trying: npx vercel --prod --yes" -ForegroundColor Yellow
  npx vercel --prod --yes
}

Write-Host "`n=== Done ===" -ForegroundColor Green
Write-Host "Check: https://www.medscopeglobal.com"
Write-Host "Check: https://www.medscopeglobal.com/sitemap.xml"
Write-Host "Check: https://www.medscopeglobal.com/pro-koho/laik-student"
