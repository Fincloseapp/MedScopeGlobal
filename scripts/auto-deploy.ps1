# PC production upload — Cloudflare Workers only. D: in-place, no Vercel.
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\auto-deploy.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if ($root -notmatch '^[Dd]:\\') {
  throw "PC deploy must run from D: — got $root"
}
Set-Location $root
Write-Host "=== MedScopeGlobal Cloudflare deploy (D: in-place) ===" -ForegroundColor Cyan
Write-Host "Worker medscopeglobal — npm run deploy"
npm run deploy
exit $LASTEXITCODE
