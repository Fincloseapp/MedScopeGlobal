# MedScopeGlobal — automatický deploy NENÍ lokální push hook.
# Preferovaná cesta: Cloudflare Workers Builds (git push → Cloudflare build).
# Záloha: GitHub Actions (.github/workflows/cloudflare-deploy.yml) po nastavení secrets.
#
# Tento skript jen připomene workflow; nespouští wrangler upload.
# Návod: docs/cloudflare-auto-deploy.md

Write-Host ""
Write-Host "MedScopeGlobal auto-deploy" -ForegroundColor Cyan
Write-Host "  1. Workers Builds (doporuceno): dash.cloudflare.com -> medscopeglobal -> Settings -> Builds -> Connect"
Write-Host "  2. GitHub Actions: repo secrets CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID"
Write-Host "  3. Po nastaveni: git push origin main -> live na medscopeglobal.com"
Write-Host ""
Write-Host "Lokalni rucni upload z D: (jen kdyz CI nefunguje): npm run deploy"
Write-Host "Podrobnosti: docs/cloudflare-auto-deploy.md"
Write-Host ""
