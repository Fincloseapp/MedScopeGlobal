# Workaround for Next.js EISDIR readlink errors on some Windows drives (e.g. D:).
# Builds from %TEMP% while keeping node_modules from the project root.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$stamp = "MedScopeBuild-$([guid]::NewGuid().ToString('N').Substring(0, 8))"
$dest = Join-Path $env:TEMP $stamp

Write-Host "Staging sources to $dest ..."
New-Item -ItemType Directory -Path $dest | Out-Null
robocopy $root $dest /E /XD node_modules .next /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit $LASTEXITCODE" }

Write-Host "Copying node_modules ..."
Copy-Item (Join-Path $root "node_modules") (Join-Path $dest "node_modules") -Recurse -Force
if (Test-Path (Join-Path $root ".env.local")) {
  Copy-Item (Join-Path $root ".env.local") (Join-Path $dest ".env.local") -Force
}

Push-Location $dest
try {
  npx next build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "Build OK in temp workspace. Copying .next to project root..."
  
  # Copy .next directory back to project root
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
