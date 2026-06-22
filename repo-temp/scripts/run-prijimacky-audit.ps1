$base = "https://medscopeglobal.com"
$delay = 1500
$slugs = @(
  "fyziologie-zaklady-uchazece",
  "testove-strategie-time-management",
  "ustni-pohovor-lf-priprava",
  "matematika-prijimacky-medicina",
  "ktera-lf-rozhodovaci-strom",
  "opakovani-mixed-test-prijimacky",
  "biologie-prijimacky-bunka-genetika",
  "chemie-prijimacky-organicka",
  "fyzika-prijimacky-mechanika-elektrina",
  "anatomie-zaklady-uchazece",
  "latinska-terminologie-medicina",
  "etika-motivacni-dopis"
)

function Test-Page($url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 45
    $appErr = $r.Content.Substring(0, [Math]::Min(5000, $r.Content.Length)) -match "Application error|Internal Server Error"
    return @{ status = $r.StatusCode; ok = ($r.StatusCode -eq 200 -and -not $appErr); text = $r.Content }
  } catch {
    return @{ status = 0; ok = $false; text = "" }
  }
}

function Get-FirstLesson($html, $slug) {
  if ($html -match "/academy/courses/$([regex]::Escape($slug))/lessons/([a-z0-9-]+)") {
    return $matches[1]
  }
  return $null
}

function Has-VideoMarker($html) {
  return ($html -match "<video[\s>]") -or ($html -match "LessonVideoPlayer") -or ($html -match "aspect-video") -or ($html -match "public_url") -or ($html -match "AI audio lekce")
}

function Get-VideoUrl($html) {
  if ($html -match 'src="(https?://[^"]+\.mp4[^"]*)"') { return $matches[1] }
  if ($html -match '"public_url"\s*:\s*"([^"]+)"') { return $matches[1] -replace '\\u002F','/' -replace '\\/','/' }
  return $null
}

Write-Host "`n--- Per-course audit ---`n"
$results = @()
foreach ($slug in $slugs) {
  Start-Sleep -Milliseconds $delay
  $courseUrl = "$base/academy/courses/$slug"
  $cp = Test-Page $courseUrl
  $lessonSlug = Get-FirstLesson $cp.text $slug
  $row = [ordered]@{ slug = $slug; course200 = $cp.ok; lesson200 = $false; videoMarker = $false; mediaHead = $false; pass = $false; detail = "" }

  if (-not $cp.ok) {
    $row.detail = "course $($cp.status)"
    $results += [pscustomobject]$row
    Write-Host "FAIL $slug - $($row.detail)"
    continue
  }
  if (-not $lessonSlug) {
    $row.detail = "no lesson link"
    $results += [pscustomobject]$row
    Write-Host "FAIL $slug - no lesson link"
    continue
  }

  Start-Sleep -Milliseconds $delay
  $lessonUrl = "$base/academy/courses/$slug/lessons/$lessonSlug"
  $lp = Test-Page $lessonUrl
  $row.lesson200 = $lp.ok
  $row.videoMarker = Has-VideoMarker $lp.text
  $videoUrl = Get-VideoUrl $lp.text

  if ($videoUrl) {
    Start-Sleep -Milliseconds 800
    try {
      $hr = Invoke-WebRequest -Uri $videoUrl -Method Head -UseBasicParsing -TimeoutSec 30
      $row.mediaHead = ($hr.StatusCode -ge 200 -and $hr.StatusCode -lt 400)
      if (-not $row.mediaHead) { $row.detail = "HEAD $($hr.StatusCode)" }
    } catch {
      $row.detail = "HEAD error"
    }
  } elseif ($row.videoMarker) {
    $row.mediaHead = $true
    $row.detail = "marker ok"
  } else {
    $row.detail = "no video"
  }

  $row.pass = $row.course200 -and $row.lesson200 -and $row.videoMarker -and $row.mediaHead
  $results += [pscustomobject]$row
  if ($row.pass) { Write-Host "PASS $slug ($lessonSlug)" } else { Write-Host "FAIL $slug - $($row.detail)" }
}

Write-Host "`n| Course | course | lesson | video | media | PASS |"
Write-Host "|--------|--------|--------|-------|-------|------|"
foreach ($r in $results) {
  $y = { param($v) if ($v) { "Y" } else { "N" } }
  Write-Host "| $($r.slug) | $( & $y $r.course200) | $( & $y $r.lesson200) | $( & $y $r.videoMarker) | $( & $y $r.mediaHead) | $( & $y $r.pass) |"
}
$passed = ($results | Where-Object pass).Count
Write-Host "`nPassed: $passed / $($results.Count)"
