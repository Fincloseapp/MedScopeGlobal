# Push D:\medscope.local to GitHub main (Vercel auto-deploy)
$ErrorActionPreference = "Stop"
$root = "D:\medscope.local"
if (-not (Test-Path $root)) {
  throw "D:\medscope.local not found - project code must live on D: drive only"
}
$resolvedRoot = (Resolve-Path $root).Path
if ($resolvedRoot -match '^C:\\') {
  throw "Project root resolved to C: ($resolvedRoot) - use D:\medscope.local only"
}
$scriptRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if ($scriptRoot -ne $root) {
  Write-Warning "Script path is $scriptRoot - robocopy source locked to $root"
}
$git = $env:GIT_BIN
if (-not $git) {
  $gitCmd = Get-Command git -ErrorAction SilentlyContinue
  if ($gitCmd) { $git = $gitCmd.Source } else { $git = "git" }
}

$token = $null
$envLocal = Join-Path $root ".env.local"
if (Test-Path $envLocal) {
  foreach ($line in Get-Content $envLocal) {
    if ($line -match '^\s*GITHUB_TOKEN=(.+)$') { $token = $matches[1].Trim() }
    if ($line -match '^\s*GH_TOKEN=(.+)$' -and -not $token) { $token = $matches[1].Trim() }
  }
}
if (-not $token) { throw "GITHUB_TOKEN missing in .env.local" }

$node = $env:NODE_BIN
if (-not $node) {
  # System TEMP only (%TEMP% may be on C:) — ephemeral node binary, not project data
  $nodeCandidate = Join-Path $env:TEMP "node-v22.22.0-win-x64\node.exe"
  if (Test-Path $nodeCandidate) { $node = $nodeCandidate } else { $node = "node" }
}

Write-Host "=== D: drive policy ==="
& $node (Join-Path $root "scripts\verify-d-drive-only.mjs")
if ($LASTEXITCODE -ne 0) { throw "D: drive policy check failed (verify-d-drive-only.mjs)" }

Write-Host "=== Supabase migrations ==="
& $node (Join-Path $root "scripts\apply-migrations.mjs")
if ($LASTEXITCODE -ne 0) { throw "Supabase migrations failed (npm run db:setup)" }

$msg = if ($env:DEPLOY_COMMIT_MESSAGE) { $env:DEPLOY_COMMIT_MESSAGE } else {
  "fix: reinforce D drive only paths"
}

$stamp = Get-Date -Format "yyyyMMddHHmmss"
$deployTmp = Join-Path $root ".deploy-tmp"
if ($deployTmp -match '^C:\\') {
  throw ".deploy-tmp must be on D: drive, got $deployTmp"
}
$cloneDir = Join-Path $deployTmp "github-push-$stamp"
$owner = "Fincloseapp"
$repo = "MedScopeGlobal"
$remote = "https://x-access-token:$token@github.com/$owner/$repo.git"

Write-Host "=== Clone main ==="
if (Test-Path $cloneDir) { Remove-Item $cloneDir -Recurse -Force }
New-Item -ItemType Directory -Path $deployTmp -Force | Out-Null
& $git clone --depth 1 --branch main $remote $cloneDir
if ($LASTEXITCODE -ne 0) { throw "git clone failed" }

Write-Host "=== Sync D: project to clone ==="
robocopy $root $cloneDir /E /XD node_modules .next .git .deploy-tmp .build-tmp .tools .vercel terminals /XF .env.local .env.local.bak .env.vercel.pull tsconfig.tsbuildinfo /NFL /NDL /NJH /NJS /nc /ns /np
if ($LASTEXITCODE -ge 8) { throw "robocopy failed exit $LASTEXITCODE" }

# Remove stale paths no longer in D: (robocopy /E does not delete extras in clone)
$stalePaths = @(
  "lib\v25\tests\run-suite.mjs",
  "_coord-audit.mjs",
  "_coord-links.cjs",
  "_coord-links.mjs"
)
foreach ($rel in $stalePaths) {
  $stale = Join-Path $cloneDir $rel
  if (Test-Path $stale) {
    Remove-Item $stale -Force
    Write-Host "Removed stale: $rel"
  }
}

Write-Host "=== Commit and push ==="
Push-Location $cloneDir
try {
  $gitSafe = "-c", "safe.directory=$cloneDir"
  & $git @gitSafe add -A
  & $git @gitSafe status --short
  & $git @gitSafe -c user.email="deploy@medscopeglobal.com" -c user.name="MedScope Deploy" commit -m $msg
  if ($LASTEXITCODE -ne 0) {
    $status = & $git @gitSafe status --porcelain
    if (-not $status) { Write-Host "No changes to commit"; exit 0 }
    throw "git commit failed"
  }
  & $git @gitSafe pull --rebase origin main
  if ($LASTEXITCODE -ne 0) { throw "git pull --rebase failed" }
  & $git @gitSafe push origin main
  if ($LASTEXITCODE -ne 0) { throw "git push failed" }
  $pushedSha = (& $git @gitSafe rev-parse HEAD).Trim()
  Write-Host "=== PUSH OK - Vercel deploy triggered (SHA: $pushedSha) ==="
} finally {
  Pop-Location
}
