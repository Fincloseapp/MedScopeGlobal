# In-place Next.js build on D: only. Do not copy the tree to C: or %TEMP%.
# FAT32 EISDIR is handled by scripts/win-fat32-fs-patch.cjs via NODE_OPTIONS.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if ($root -notmatch '^[Dd]:\\') {
  throw "PC build must run from D: — got $root"
}
$nextBin = Join-Path $root "node_modules\next\dist\bin\next"
if (-not (Test-Path $nextBin)) {
  throw "Missing Next.js binary at $nextBin — run npm install in project root"
}
$patch = (Join-Path $root "scripts\win-fat32-fs-patch.cjs") -replace '\\', '/'
$env:NODE_OPTIONS = "--require=$patch"
Set-Location $root
Write-Host "next build in place on $root"
& node $nextBin build
exit $LASTEXITCODE
