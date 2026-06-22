# Academy Video — Thumbnail & Transcoding (Phase 8/10 stub)

> Production today: upload → duration extract → SVG placeholder thumbnail.  
> Full transcoding (HLS, adaptive bitrate, poster frames) is **deferred**.

## Current pipeline

```
POST /api/academy/video/upload
  → extractVideoDuration()     lib/academy/storage/video-metadata.ts
  → generateVideoThumbnailPlaceholder()   lib/academy/storage/video-thumbnail.ts
  → Supabase Storage (media/academy/videos/…)
  → video_assets row + thumbnail_url
```

Admin UI: `/admin/academy/video`

## Thumbnail stub

- Generates branded **640×360 SVG** with play icon, title, duration label
- Stored at `media/academy/videos/thumbs/{uuid}.svg`
- `thumbnail_source: "placeholder-svg"` in asset metadata

## Duration extraction

1. **mp4-mvhd** — parses MP4 `mvhd` atom when present
2. **estimated** — `sizeBytes × 8 / 1.5 Mbps` fallback
3. **unknown** — no duration stored

## Planned transcoding (Phase 11+)

| Step | Tool | Output |
|------|------|--------|
| Ingest webhook | Supabase Storage trigger or Vercel queue | Job row in `video_assets.transcode_status` |
| Transcode | Mux Video API **or** self-hosted ffmpeg on worker | HLS + MP4 renditions |
| Poster frame | ffmpeg `-ss 00:00:02 -vframes 1` **or** Mux thumbnail | JPEG/WebP in `media/academy/videos/thumbs/` |
| Playback | `<video>` or Mux player on lesson page | Signed URL / CDN |

### Env vars (future)

```
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
# or
FFMPEG_WORKER_URL=
```

### Non-goals (stub phase)

- No breaking changes to existing `video_assets` schema
- No client-side transcoding in browser
- Lessons without video continue to work

## Ops checklist

- [ ] Confirm `media` bucket public read for thumb SVGs
- [ ] Monitor upload size limits (Vercel 4.5 MB default; large files → direct Supabase upload in Phase 11)
- [ ] When Mux/ffmpeg ships, replace `generateVideoThumbnailPlaceholder` only — keep `extractVideoDuration` as fallback
