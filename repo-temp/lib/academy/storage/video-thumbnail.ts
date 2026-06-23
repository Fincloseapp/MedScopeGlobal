import { randomUUID } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";

const BUCKET = "media";
const PREFIX = "academy/videos/thumbs";

export type VideoThumbnailResult = {
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  source: "placeholder-svg";
};

/** Phase 8 stub — uploads a branded SVG placeholder until ffmpeg/Mux transcoding. */
export async function generateVideoThumbnailPlaceholder(
  title: string,
  durationSeconds: number | null
): Promise<VideoThumbnailResult> {
  const safeTitle = title.slice(0, 48).replace(/[<>&"]/g, "");
  const durationLabel =
    durationSeconds && durationSeconds > 0
      ? `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")}`
      : "—";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#021d33"/>
  <rect x="24" y="24" width="592" height="312" rx="12" fill="#005B96" opacity="0.25"/>
  <polygon points="280,140 280,220 360,180" fill="#ffffff" opacity="0.9"/>
  <text x="32" y="320" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="600">${safeTitle}</text>
  <text x="32" y="344" fill="#94a3b8" font-family="sans-serif" font-size="14">${durationLabel} · MedScope Academy</text>
</svg>`;

  const storage_path = `${PREFIX}/${randomUUID()}.svg`;
  const buffer = Buffer.from(svg, "utf8");

  const admin = createServiceRoleClient();
  const { error } = await admin.storage.from(BUCKET).upload(storage_path, buffer, {
    contentType: "image/svg+xml",
    upsert: false,
  });

  if (error) {
    console.warn("[academy] thumbnail placeholder upload failed", error.message);
    return { thumbnail_path: null, thumbnail_url: null, source: "placeholder-svg" };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(storage_path);
  return {
    thumbnail_path: storage_path,
    thumbnail_url: data.publicUrl,
    source: "placeholder-svg",
  };
}
