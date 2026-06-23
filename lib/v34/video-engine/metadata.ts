import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import {
  resolveVideoAccessFromMetadata,
  type VideoAccessRole,
} from "@/lib/v34/video-engine/access";
import type { VideoChapter, VideoMetadata } from "@/lib/v34/video-engine/types";
import type { VideoAsset } from "@/types/academy";

const GTV_HOST = "storage.googleapis.com/gtv-videos-bucket";

type AssetMeta = Record<string, unknown> & {
  public_url?: string;
  hls_url?: string;
  mp4_url?: string;
  thumbnail_url?: string;
  description?: string;
  chapters?: VideoChapter[];
  duration_seconds?: number;
};

function isUnreliableUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes(GTV_HOST);
}

function buildUrlChain(meta: AssetMeta): string[] {
  const chain: string[] = [];
  const push = (u: string | null | undefined) => {
    if (u && !chain.includes(u)) chain.push(u);
  };
  push(meta.hls_url);
  push(meta.mp4_url);
  push(meta.public_url);
  if (!chain.length || chain.every(isUnreliableUrl)) {
    return [V33_FALLBACK_MP4_URL];
  }
  const reliable = chain.filter((u) => !isUnreliableUrl(u));
  if (!reliable.length) return [V33_FALLBACK_MP4_URL, ...chain];
  if (!reliable.includes(V33_FALLBACK_MP4_URL)) reliable.push(V33_FALLBACK_MP4_URL);
  return reliable.slice(0, 3);
}

export function extractVideoMetadata(
  asset: VideoAsset,
  accessOverride?: VideoAccessRole
): VideoMetadata {
  const meta = (asset.metadata ?? {}) as AssetMeta;
  const urlChain = buildUrlChain(meta);
  const hls = urlChain.find((u) => u.includes(".m3u8")) ?? meta.hls_url ?? null;
  const mp4 =
    urlChain.find((u) => !u.includes(".m3u8")) ??
    meta.mp4_url ??
    meta.public_url ??
    null;

  return {
    id: asset.id,
    title: asset.title,
    duration_seconds: asset.duration_seconds || Number(meta.duration_seconds ?? 0),
    description: meta.description ?? undefined,
    thumbnail_url: meta.thumbnail_url ?? null,
    chapters: Array.isArray(meta.chapters) ? meta.chapters : [],
    hls_url: hls,
    mp4_url: mp4,
    public_url: meta.public_url ?? mp4,
    url_chain: urlChain,
    access: accessOverride ?? resolveVideoAccessFromMetadata(meta),
    status: asset.status,
  };
}

export function enrichAssetMetadataFields(meta: AssetMeta): AssetMeta {
  const out = { ...meta };
  if (!out.description && out.title) {
    out.description = String(out.title);
  }
  if (!Array.isArray(out.chapters)) out.chapters = [];
  if (!out.thumbnail_url && out.avatar_image_url) {
    out.thumbnail_url = String(out.avatar_image_url);
  }
  if (!out.duration_seconds && out.public_url) {
    out.duration_seconds = 0;
  }
  return out;
}
