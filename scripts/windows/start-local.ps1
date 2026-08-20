# Start Next.js from D:\Medi82026. Merges env without wiping filled keys.
$ErrorActionPreference = "Stop"

$utils = Join-Path $PSScriptRoot "env-utils.ps1"
$roots = Join-Path $PSScriptRoot "set-roots.ps1"
if (-not (Test-Path -LiteralPath $utils)) { throw "Chybí env-utils.ps1 vedle start-local.ps1" }
if (-not (Test-Path -LiteralPath $roots)) { throw "Chybí set-roots.ps1 vedle start-local.ps1" }
. $utils
. $roots

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "Nainstalujte Node.js LTS a npm, pak spusťte znovu."
}

$envLocal = Join-Path $root ".env.local"
$sources = @()
foreach ($name in @(
  ".env.example",
  ".env.production.local.example",
  ".dev.vars",
  ".env.cloudflare.local"
)) {
  $p = Join-Path $root $name
  if (Test-Path -LiteralPath $p) { $sources += $p }
}
$oldLocal = "D:\medscope.local\.env.local"
if (Test-Path -LiteralPath $oldLocal) { $sources += $oldLocal }
if (Test-Path -LiteralPath $envLocal) { $sources += $envLocal }

$maps = @()
foreach ($src in $sources) { $maps += ,(Get-DotEnvMap $src) }
$merged = Merge-DotEnvMaps $maps
$merged["MEDSCOPE_PROJECT_ROOT"] = $root
$merged["MEDSCOPE_DATA_ROOT"] = $env:MEDSCOPE_DATA_ROOT
$merged["MEDSCOPE_LOGS_ROOT"] = $env:MEDSCOPE_LOGS_ROOT
if (-not $merged["NEXT_PUBLIC_SITE_URL"]) {
  $merged["NEXT_PUBLIC_SITE_URL"] = "https://medscopeglobal.com"
}
if (-not $merged["DEFAULT_SITE_LOCALE"]) { $merged["DEFAULT_SITE_LOCALE"] = "cs" }
if (-not $merged["INGESTION_LOCALE"]) { $merged["INGESTION_LOCALE"] = "cs" }

Write-DotEnvFile -Path $envLocal -Map $merged
Write-EnvStatusFile -Path (Join-Path $root "NASTAVENI-STAV.txt") -Map $merged
Write-Host "Aktualizováno .env.local (klíče ze starého D:\medscope.local se doplní, vyplněné se nepřepíší prázdnými)."

$env:SKIP_OPENNEXT_DEV = "1"
Remove-Item Env:OPENNEXT_CLOUDFLARE_DEV -ErrorAction SilentlyContinue
Remove-Item Env:MEDSCOPE_RUNTIME -ErrorAction SilentlyContinue
$env:NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
$env:DEFAULT_SITE_LOCALE = "cs"
$env:INGESTION_LOCALE = "cs"
$env:PORT = "3000"

if (-not (Test-Path (Join-Path $root "node_modules"))) {
  Write-Host "Instaluji závislosti (jednou)…"
  npm install
  if ($LASTEXITCODE -ne 0) { throw "npm install selhal" }
}

Write-Host "Otevřete http://localhost:3000  (zastavení: Ctrl+C)"
npm run dev:d
