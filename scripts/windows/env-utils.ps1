# Env helpers for D:\Medi82026. Never print secret values.

function Get-DotEnvMap {
  param([string]$Path)
  $map = [ordered]@{}
  if (-not $Path -or -not (Test-Path -LiteralPath $Path)) { return $map }
  foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
    if ($null -eq $line) { continue }
    $trim = $line.Trim()
    if ($trim -eq "" -or $trim.StartsWith("#")) { continue }
    $eq = $trim.IndexOf("=")
    if ($eq -lt 1) { continue }
    $key = $trim.Substring(0, $eq).Trim()
    if ($key -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') { continue }
    $val = $trim.Substring($eq + 1)
    if (
      ($val.StartsWith('"') -and $val.EndsWith('"')) -or
      ($val.StartsWith("'") -and $val.EndsWith("'"))
    ) {
      if ($val.Length -ge 2) { $val = $val.Substring(1, $val.Length - 2) }
    }
    $map[$key] = $val
  }
  return $map
}

function Test-EnvValueFilled {
  param([string]$Value)
  if ($null -eq $Value) { return $false }
  $t = $Value.Trim()
  if ($t -eq "") { return $false }
  if ($t -match '^(your[-_]|from https?:)') { return $false }
  if ($t -eq "generate-a-long-random-string") { return $false }
  if ($t -match '\[PASSWORD\]') { return $false }
  return $true
}

function Merge-DotEnvMaps {
  param([System.Collections.IDictionary[]]$Maps)
  $merged = [ordered]@{}
  $skip = @{
    "MEDSCOPE_RUNTIME" = $true
    "NEXTJS_ENV" = $true
  }
  foreach ($map in $Maps) {
    if ($null -eq $map) { continue }
    foreach ($key in @($map.Keys)) {
      if ($skip.ContainsKey($key)) { continue }
      $val = $map[$key]
      if (Test-EnvValueFilled $val) {
        $merged[$key] = $val
      } elseif (-not $merged.Contains($key)) {
        $merged[$key] = $val
      }
    }
  }
  return $merged
}

function Write-DotEnvFile {
  param(
    [string]$Path,
    [System.Collections.IDictionary]$Map
  )
  $lines = @(
    "# MedScopeGlobal — local env for D:\Medi82026 (do not commit)",
    "# merged $(Get-Date -Format o)",
    ""
  )
  foreach ($key in @($Map.Keys)) {
    $val = [string]$Map[$key]
    if ($val -match '[\s#"=]') {
      $escaped = $val.Replace('\', '\\').Replace('"', '\"')
      $lines += "$key=`"$escaped`""
    } else {
      $lines += "$key=$val"
    }
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllLines($Path, $lines, $utf8NoBom)
}

function Import-DotEnvToProcess {
  param([string]$Path)
  $map = Get-DotEnvMap $Path
  foreach ($key in @($map.Keys)) {
    Set-Item -Path "Env:$key" -Value ([string]$map[$key])
  }
}

function Write-EnvStatusFile {
  param(
    [string]$Path,
    [System.Collections.IDictionary]$Map
  )
  $lines = @(
    "Nastavení D:\Medi82026 — pouze názvy klíčů (hodnoty se sem nikdy nepíší).",
    "Vygenerováno: $(Get-Date -Format o)",
    ""
  )
  foreach ($key in @($Map.Keys)) {
    $state = if (Test-EnvValueFilled ([string]$Map[$key])) { "filled" } else { "empty" }
    $lines += "$key`t$state"
  }
  $lines += ""
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllLines($Path, $lines, $utf8NoBom)
}
