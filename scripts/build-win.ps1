# Workaround for Next.js EISDIR readlink errors on some Windows drives (e.g. D: FAT32).
# Staging build workspace stays on D: under project .build-tmp (never system TEMP).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$stamp = "MedScopeBuild-$([guid]::NewGuid().ToString('N').Substring(0, 8))"
$buildTmp = Join-Path $root ".build-tmp"
if (-not (Test-Path $buildTmp)) {
  New-Item -ItemType Directory -Path $buildTmp | Out-Null
}
$dest = Join-Path $buildTmp $stamp

Write-Host "Staging sources to $dest ..."
New-Item -ItemType Directory -Path $dest | Out-Null
robocopy $root $dest /E /XD node_modules .next .build-tmp .deploy-tmp .tools .git .vercel repo-temp github-production /NFL /NDL /NJH /NJS /nc /ns /np /R:2 /W:2 | Out-Null
$rc = $LASTEXITCODE
if ($rc -ge 8) { throw "robocopy failed with exit $rc" }

Write-Host "Linking node_modules (junction) ..."
$destNm = Join-Path $dest "node_modules"
$rootNm = Join-Path $root "node_modules"
if (-not (Test-Path $rootNm)) {
  throw "Missing node_modules at $rootNm - run npm install in project root"
}
$mklinkOk = $false
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
cmd /c mklink /J "$destNm" "$rootNm" 1>$null 2>$null
if ($LASTEXITCODE -eq 0) { $mklinkOk = $true }
$ErrorActionPreference = $prevEap
if (-not $mklinkOk) {
  Write-Host "Junction unavailable (non-NTFS or permissions). Copying node_modules to staging workspace ..."
  robocopy $rootNm $destNm /E /NFL /NDL /NJH /NJS /nc /ns /np /R:2 /W:2 | Out-Null
  $rcNm = $LASTEXITCODE
  if ($rcNm -ge 8) { throw "robocopy node_modules failed with exit $rcNm" }
}
if (Test-Path (Join-Path $root ".env.local")) {
  Copy-Item (Join-Path $root ".env.local") (Join-Path $dest ".env.local") -Force
}

$patchFile = Join-Path $root "scripts\patch-fat32-readlink.cjs"
$env:NODE_OPTIONS = "--require $patchFile"

$nextBin = Join-Path $root "node_modules\next\dist\bin\next"
if (-not (Test-Path $nextBin)) {
  throw "Missing Next.js binary at $nextBin - run npm install in project root"
}

Push-Location $dest
try {
  & node $nextBin build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "Build OK in temp workspace. Copying .next to project root..."

  if (Test-Path (Join-Path $dest ".next")) {
    if (Test-Path (Join-Path $root ".next")) {
      Remove-Item (Join-Path $root ".next") -Recurse -Force
    }
    Copy-Item (Join-Path $dest ".next") (Join-Path $root ".next") -Recurse -Force
    Write-Host ".next copied to project root."
  }
} finally {
  Pop-Location
  $savedNodeOpts = $env:NODE_OPTIONS
  $env:NODE_OPTIONS = ""
  Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
  $env:NODE_OPTIONS = $savedNodeOpts
}
