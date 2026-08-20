# Point the shell at D:\Medi82026 (data + logs live under the same folder).
$ErrorActionPreference = "Stop"

function Resolve-MediRoot {
  if ($env:MEDSCOPE_PROJECT_ROOT) {
    $fromEnv = $env:MEDSCOPE_PROJECT_ROOT
    if (Test-Path -LiteralPath (Join-Path $fromEnv "package.json")) { return $fromEnv }
  }
  if (Test-Path -LiteralPath (Join-Path $PSScriptRoot "package.json")) {
    return $PSScriptRoot
  }
  $up2 = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
  if ($up2 -and (Test-Path -LiteralPath (Join-Path $up2 "package.json"))) {
    return $up2
  }
  if (Test-Path -LiteralPath "D:\Medi82026\package.json") {
    return "D:\Medi82026"
  }
  throw "Nenalezen kořen MedScopeGlobal. Očekáváno D:\Medi82026 (package.json)."
}

$root = Resolve-MediRoot
$env:MEDSCOPE_PROJECT_ROOT = $root
$env:MEDSCOPE_DATA_ROOT = Join-Path $root "data"
$env:MEDSCOPE_LOGS_ROOT = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $env:MEDSCOPE_DATA_ROOT | Out-Null
New-Item -ItemType Directory -Force -Path $env:MEDSCOPE_LOGS_ROOT | Out-Null
Set-Location -LiteralPath $root
Write-Host "MedScopeGlobal root = $root"
