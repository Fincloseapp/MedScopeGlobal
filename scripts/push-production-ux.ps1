# Push UX patch na GitHub main (spusťte v kořeni repozitáře MedScopeGlobal)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
node scripts/push-production-ux.mjs
