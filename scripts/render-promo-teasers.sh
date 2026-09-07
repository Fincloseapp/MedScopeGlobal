#!/usr/bin/env bash
# Render 3 advertising teasers (9:16, 8s) with ViaLongeVita + medscopeglobal.com.
set -euo pipefail

SRC="${1:-/workspace/public/assets/ads/teasers/stills}"
OUT="${2:-/workspace/public/assets/ads/teasers}"
FONT_BOLD="${FONT_BOLD:-/usr/share/fonts/truetype/macos/Inter-Bold.ttf}"
FONT_SEMI="${FONT_SEMI:-/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf}"
FONT_MED="${FONT_MED:-/usr/share/fonts/truetype/macos/Inter-Medium.ttf}"

mkdir -p "$OUT"

render() {
  local id="$1"
  local still="$2"
  local line="$3"
  local sub="$4"
  local work
  work="$(mktemp -d)"
  printf '%s' "ViaLongeVita" >"$work/brand.txt"
  printf '%s' "$line" >"$work/line.txt"
  printf '%s' "$sub" >"$work/sub.txt"
  printf '%s' "medscopeglobal.com" >"$work/url.txt"

  ffmpeg -y -hide_banner -loglevel error \
    -loop 1 -i "$still" \
    -vf "scale=1400:2100:force_original_aspect_ratio=increase,crop=1400:2100,zoompan=z='min(zoom+0.0007,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=200:s=1080x1920:fps=25,fade=t=in:st=0:d=0.5,fade=t=out:st=7.4:d=0.55,drawbox=x=0:y=1460:w=1080:h=460:color=0x021d33@0.64:t=fill,drawtext=fontfile=${FONT_BOLD}:textfile=${work}/brand.txt:fontsize=62:fontcolor=0xFFFFFF:x=(w-text_w)/2:y=1508,drawtext=fontfile=${FONT_SEMI}:textfile=${work}/line.txt:fontsize=40:fontcolor=0xC7E3FF:x=(w-text_w)/2:y=1592,drawtext=fontfile=${FONT_MED}:textfile=${work}/sub.txt:fontsize=30:fontcolor=0xE8F3FB:x=(w-text_w)/2:y=1650,drawtext=fontfile=${FONT_SEMI}:textfile=${work}/url.txt:fontsize=34:fontcolor=0xFFFFFF:x=(w-text_w)/2:y=1738" \
    -t 8 -an -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -movflags +faststart \
    "$OUT/${id}.mp4"

  ffmpeg -y -hide_banner -loglevel error -ss 3.2 -i "$OUT/${id}.mp4" -frames:v 1 -q:v 3 "$OUT/${id}.jpg"
  rm -rf "$work"
  echo "rendered $OUT/${id}.mp4"
}

render healthspan "$SRC/healthspan.png" "Healthspan" "Longevity · Dlouhověkost"
render sleep "$SRC/sleep.png" "Healthy sleep" "Rest · Zdravý spánek"
render lifestyle "$SRC/lifestyle.png" "Healthy living" "Food · Movement · Style"
ls -la "$OUT"
