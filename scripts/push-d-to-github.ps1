# Push D:\medscope.local to GitHub main (Vercel auto-deploy)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$git = "C:\Users\zegzulka\AppData\Local\Programs\Git\cmd\git.exe"
if (-not (Test-Path $git)) { $git = "git" }

$token = $null
$envLocal = Join-Path $root ".env.local"
if (Test-Path $envLocal) {
  foreach ($line in Get-Content $envLocal) {
    if ($line -match '^\s*GITHUB_TOKEN=(.+)$') { $token = $matches[1].Trim() }
    if ($line -match '^\s*GH_TOKEN=(.+)$' -and -not $token) { $token = $matches[1].Trim() }
  }
}
if (-not $token) { throw "GITHUB_TOKEN missing in .env.local" }

$msg = if ($env:DEPLOY_COMMIT_MESSAGE) { $env:DEPLOY_COMMIT_MESSAGE } else {
  "feat(v23.3.2): newsletter hero BMJ style, mobile logo, auto-git, Vercel pipeline"
}

$stamp = Get-Date -Format "yyyyMMddHHmmss"
$cloneDir = Join-Path $root ".deploy-tmp\github-push-$stamp"
$owner = "Fincloseapp"
$repo = "MedScopeGlobal"
$remote = "https://x-access-token:$token@github.com/$owner/$repo.git"

Write-Host "=== Clone main ==="
if (Test-Path $cloneDir) { Remove-Item $cloneDir -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $root ".deploy-tmp") -Force | Out-Null
& $git clone --depth 1 --branch main $remote $cloneDir
if ($LASTEXITCODE -ne 0) { throw "git clone failed" }

Write-Host "=== Sync D: project to clone ==="
robocopy $root $cloneDir /E /XD node_modules .next .git .deploy-tmp .build-tmp .tools .vercel terminals /XF .env.local .env.local.bak .env.vercel.pull tsconfig.tsbuildinfo /NFL /NDL /NJH /NJS /nc /ns /np
if ($LASTEXITCODE -ge 8) { throw "robocopy failed exit $LASTEXITCODE" }

Write-Host "=== Commit and push ==="
Push-Location $cloneDir
try {
  & $git add -A
  & $git status --short
  & $git -c user.email="deploy@medscopeglobal.com" -c user.name="MedScope Deploy" commit -m $msg
  if ($LASTEXITCODE -ne 0) {
    $status = & $git status --porcelain
    if (-not $status) { Write-Host "No changes to commit"; exit 0 }
    throw "git commit failed"
  }
  & $git push origin main
  if ($LASTEXITCODE -ne 0) { throw "git push failed" }
  Write-Host "=== PUSH OK - Vercel deploy triggered ==="
} finally {
  Pop-Location
}
