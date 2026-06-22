$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
$base = "https://medscopeglobal.com"
$paths = @(
  "/verejnost/clanky",
  "/articles",
  "/sections/clinical-medicine",
  "/sections/medical-science-research"
)

function Get-ArticleLinks($html) {
  $set = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  foreach ($m in [regex]::Matches($html, 'href="(/article/[^"#?]+)"')) { [void]$set.Add($m.Groups[1].Value) }
  foreach ($m in [regex]::Matches($html, "href='(/article/[^'#?]+)'")) { [void]$set.Add($m.Groups[1].Value) }
  return ($set | Sort-Object)
}

function Get-VisibleDates($html) {
  $dates = [System.Collections.Generic.HashSet[string]]::new()
  foreach ($m in [regex]::Matches($html, '\d{4}-\d{2}-\d{2}')) { [void]$dates.Add($m.Value) }
  foreach ($m in [regex]::Matches($html, 'datetime="([^"]+)"')) { [void]$dates.Add($m.Groups[1].Value) }
  foreach ($m in [regex]::Matches($html, '\b\d{1,2}\.\s*\d{1,2}\.\s*\d{4}\b')) { [void]$dates.Add($m.Value.Trim()) }
  foreach ($m in [regex]::Matches($html, '<time[^>]*>([^<]{4,40})</time>')) { [void]$dates.Add($m.Groups[1].Value.Trim()) }
  return ($dates | Sort-Object)
}

foreach ($p in $paths) {
  $url = $base + $p
  $resp = Invoke-WebRequest -Uri $url -UserAgent $ua -UseBasicParsing -TimeoutSec 90
  $html = $resp.Content
  $links = Get-ArticleLinks $html
  $dates = Get-VisibleDates $html
  $title = if ($html -match '<title[^>]*>([^<]+)</title>') { $matches[1].Trim() } else { '' }
  Write-Output "PATH: $p"
  Write-Output "STATUS: $($resp.StatusCode)"
  Write-Output "TITLE: $title"
  Write-Output "UNIQUE_ARTICLE_LINKS: $($links.Count)"
  Write-Output "VISIBLE_DATES_COUNT: $($dates.Count)"
  Write-Output "VISIBLE_DATES: $(($dates | Select-Object -First 25) -join ' | ')"
  Write-Output "LINKS:"
  $links | ForEach-Object { Write-Output $_ }
  Write-Output "END_PATH"
}
