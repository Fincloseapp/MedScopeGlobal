$ErrorActionPreference = "Stop"
$env:DEPLOY_COMMIT_MESSAGE = "feat: MedScope v34-v37 video engine, courses, analytics, quality"
& (Join-Path $PSScriptRoot "push-d-to-github.ps1")
