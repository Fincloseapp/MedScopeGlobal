# Deploy medscopeglobal.com from D:\Medi82026 via Wrangler OAuth.
# The Workers Read-only API token in .env.cloudflare.local returns 403 on deploy.
$ErrorActionPreference = "Stop"

$utils = Join-Path $PSScriptRoot "env-utils.ps1"
$roots = Join-Path $PSScriptRoot "set-roots.ps1"
if (-not (Test-Path -LiteralPath $utils)) { throw "Chybí env-utils.ps1 vedle deploy-from-d.ps1" }
if (-not (Test-Path -LiteralPath $roots)) { throw "Chybí set-roots.ps1 vedle deploy-from-d.ps1" }
. $utils
. $roots

$envLocal = Join-Path $root ".env.local"
if (Test-Path -LiteralPath $envLocal) {
  Import-DotEnvToProcess $envLocal
}

Remove-Item Env:CLOUDFLARE_API_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:MEDSCOPE_RUNTIME -ErrorAction SilentlyContinue
$env:CI = "true"

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  throw "Nainstalujte Node.js LTS (npx), pak spusťte znovu."
}

Write-Host "Deploy z $root"
Write-Host "CLOUDFLARE_API_TOKEN je vypnutý — použije se Wrangler OAuth (dawe.zegzul@seznam.cz)."
Write-Host "Pokud wrangler není přihlášen, spusťte: npx wrangler login"
if (-not $env:CLOUDFLARE_ACCOUNT_ID) {
  Write-Warning "CLOUDFLARE_ACCOUNT_ID není v prostředí. Doplňte ho do .env.local, pokud deploy selže."
}

npx opennextjs-cloudflare build
if ($LASTEXITCODE -ne 0) { throw "opennextjs-cloudflare build selhal" }
npx opennextjs-cloudflare deploy
if ($LASTEXITCODE -ne 0) { throw "opennextjs-cloudflare deploy selhal" }
Write-Host "Hotovo. Živý web: https://medscopeglobal.com"
