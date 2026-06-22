# Completes .env.local for MedScopeGlobal
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $root
$envFile = Join-Path $root ".env.local"
$example = Join-Path $root ".env.example"

$existing = @{}
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
      $existing[$matches[1].Trim()] = $matches[2].Trim()
    }
  }
}

if (-not $existing['CRON_SECRET']) {
  $bytes = New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $existing['CRON_SECRET'] = [BitConverter]::ToString($bytes).Replace('-', '').ToLower()
}

$defaults = @{
  'NEXT_PUBLIC_SITE_URL' = 'http://localhost:3000'
  'NEXT_PUBLIC_SUPABASE_URL' = $existing['NEXT_PUBLIC_SUPABASE_URL']
  'NEXT_PUBLIC_SUPABASE_ANON_KEY' = $existing['NEXT_PUBLIC_SUPABASE_ANON_KEY']
  'SUPABASE_SERVICE_ROLE_KEY' = $existing['SUPABASE_SERVICE_ROLE_KEY']
  'SUPABASE_PROJECT_REF' = 'xcydgqnivxfhprbmdyym'
  'ADMIN_NOTIFY_EMAIL' = 'dawe.zegzul@seznam.cz'
  'OPENAI_MODEL' = 'gpt-4o-mini'
  'OPENAI_API_KEY' = $existing['OPENAI_API_KEY']
  'CRON_SECRET' = $existing['CRON_SECRET']
}

$lines = @(
  '# MedScopeGlobal — local environment (do not commit)',
  "NEXT_PUBLIC_SITE_URL=$($defaults['NEXT_PUBLIC_SITE_URL'])",
  "NEXT_PUBLIC_SUPABASE_URL=$($defaults['NEXT_PUBLIC_SUPABASE_URL'])",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=$($defaults['NEXT_PUBLIC_SUPABASE_ANON_KEY'])",
  "SUPABASE_SERVICE_ROLE_KEY=$($defaults['SUPABASE_SERVICE_ROLE_KEY'])",
  "SUPABASE_PROJECT_REF=$($defaults['SUPABASE_PROJECT_REF'])",
  '',
  '# Optional: from https://supabase.com/dashboard/account/tokens (for npm run db:setup)',
  '# SUPABASE_ACCESS_TOKEN=',
  '',
  "ADMIN_NOTIFY_EMAIL=$($defaults['ADMIN_NOTIFY_EMAIL'])",
  "OPENAI_API_KEY=$($defaults['OPENAI_API_KEY'])",
  "OPENAI_MODEL=$($defaults['OPENAI_MODEL'])",
  "CRON_SECRET=$($defaults['CRON_SECRET'])"
)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($envFile, $lines, $utf8NoBom)
Write-Host ".env.local updated at $envFile"
