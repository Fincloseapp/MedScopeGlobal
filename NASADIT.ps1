# Jednorázové nasazení na https://medscopeglobal.com
# Spusťte v PowerShellu (mimo sandbox): pravý klik -> Spustit, nebo:
#   powershell -ExecutionPolicy Bypass -File C:\Users\zegzulka\MedScopeGlobal\NASADIT.ps1

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
Set-Location $Root

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) {
  $node = "c:\Users\zegzulka\Links\cursor\resources\app\resources\helpers\node.exe"
}

function Load-EnvFile($path) {
  if (-not (Test-Path $path)) { return }
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
      [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
    }
  }
}

Load-EnvFile (Join-Path $Root ".env.local")
Load-EnvFile (Join-Path $Root ".env")
Load-EnvFile "D:\MedScopeGlobal\.env.local"

$gh = Get-ChildItem (Join-Path $Root ".tools\gh") -Recurse -Filter gh.exe -ErrorAction SilentlyContinue | Select-Object -First 1
if ($gh -and $env:GITHUB_TOKEN) {
  $env:GITHUB_TOKEN | & $gh.FullName auth login --with-token 2>$null
}

Write-Host "=== MedScopeGlobal NASADIT ===" -ForegroundColor Cyan
& $node (Join-Path $Root "scripts\deploy-now.mjs")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nKontrola webu za 90 s..." -ForegroundColor Cyan
Start-Sleep -Seconds 90
try {
  $html = (Invoke-WebRequest -Uri "https://www.medscopeglobal.com/" -UseBasicParsing -TimeoutSec 60).Content
  if ($html -match "Laik a student|Odborný medicínský magazín pro každého") {
    Write-Host "OK — nová homepage je na webu." -ForegroundColor Green
  } else {
    Write-Host "Commit odeslán; Vercel může ještě buildit. Obnovte stránku za chvíli." -ForegroundColor Yellow
  }
} catch {
  Write-Host "Web zatím neodpovídá — zkontrolujte Vercel dashboard." -ForegroundColor Yellow
}
