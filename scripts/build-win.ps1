# Workaround for Next.js EISDIR readlink errors on Windows D: (FAT32).
# Prefer in-place build with fs patch (no full node_modules copy).
# Fallback: stage under .build-tmp with multi-threaded robocopy.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$nextBin = Join-Path $root "node_modules\next\dist\bin\next"
$patch = Join-Path $root "scripts\win-fat32-fs-patch.cjs"

if (-not (Test-Path $nextBin)) {
  throw "Missing Next.js binary at $nextBin — run npm install in project root"
}

$forceStage = $env:MEDSCOPE_FORCE_STAGED_BUILD -eq "1"
$inplaceOk = -not $forceStage

if ($inplaceOk) {
  Write-Host "Building in-place on D: with FAT32 readlink patch..."
  Push-Location $root
  try {
    # Forward slashes survive NODE_OPTIONS parsing on Windows.
    $patchReq = ($patch -replace '\\', '/')
    $prevNodeOpts = $env:NODE_OPTIONS
    $env:NODE_OPTIONS = @($prevNodeOpts, "--require", $patchReq) -join ' '
    & node $nextBin build
    $code = $LASTEXITCODE
    $env:NODE_OPTIONS = $prevNodeOpts
    if ($code -ne 0) {
      Write-Host "In-place build failed (exit $code)."
      if (-not $forceStage) {
        throw "In-place Next build failed. Fix compile errors (or set MEDSCOPE_FORCE_STAGED_BUILD=1)."
      }
      Write-Host "Falling back to staged build..."
      $inplaceOk = $false
    } else {
      Write-Host "In-place Next.js build OK."
      # OpenNext expects middleware.js inside standalone; Next often omits it there.
      $mwSrc = Join-Path $root ".next\server\middleware.js"
      $mwDstDir = Join-Path $root ".next\standalone\.next\server"
      $mwDst = Join-Path $mwDstDir "middleware.js"
      if ((Test-Path $mwSrc) -and -not (Test-Path $mwDst)) {
        New-Item -ItemType Directory -Force -Path $mwDstDir | Out-Null
        Copy-Item $mwSrc $mwDst -Force
        Write-Host "Copied middleware.js into standalone for OpenNext."
      }
      exit 0
    }
  } finally {
    Pop-Location
  }
}

if (-not $forceStage) {
  throw "Staged build disabled (FAT32). Set MEDSCOPE_FORCE_STAGED_BUILD=1 to enable."
}

$stamp = "MedScopeBuild-$([guid]::NewGuid().ToString('N').Substring(0, 8))"
$buildTmp = Join-Path $root ".build-tmp"
if (-not (Test-Path $buildTmp)) {
  New-Item -ItemType Directory -Path $buildTmp | Out-Null
}
$dest = Join-Path $buildTmp $stamp

Write-Host "Staging sources to $dest ..."
New-Item -ItemType Directory -Path $dest | Out-Null
robocopy $root $dest /E /XD node_modules .next .build-tmp .deploy-tmp /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit $LASTEXITCODE" }

Write-Host "Copying node_modules (robocopy /MT:8) ..."
$nmSrc = Join-Path $root "node_modules"
$nmDst = Join-Path $dest "node_modules"
robocopy $nmSrc $nmDst /E /MT:8 /NFL /NDL /NJH /NJS /nc /ns /np /R:1 /W:1 | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy node_modules failed with exit $LASTEXITCODE" }
$LASTEXITCODE = 0
if (Test-Path (Join-Path $root ".env.local")) {
  Copy-Item (Join-Path $root ".env.local") (Join-Path $dest ".env.local") -Force
}

Push-Location $dest
try {
  $patchReq = ($patch -replace '\\', '/')
  $prevNodeOpts = $env:NODE_OPTIONS
  $env:NODE_OPTIONS = @($prevNodeOpts, "--require", $patchReq) -join ' '
  & node $nextBin build
  $code = $LASTEXITCODE
  $env:NODE_OPTIONS = $prevNodeOpts
  if ($code -ne 0) { exit $code }
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
  Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
}
