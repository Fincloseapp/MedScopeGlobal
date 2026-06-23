/** Allowed upstream hosts for /api/video/stream Range proxy */
const ALLOWED_HOST_SUFFIXES = [
  ".supabase.co",
  "storage.googleapis.com",
  "www.w3schools.com",
  "w3schools.com",
];

export function isAllowedStreamUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return ALLOWED_HOST_SUFFIXES.some((s) => host === s.replace(/^\./, "") || host.endsWith(s));
  } catch {
    return false;
  }
}

export const VIDEO_STREAM_HEADERS: Record<string, string> = {
  "Accept-Ranges": "bytes",
  "Cache-Control": "public, max-age=3600",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges, Content-Length",
};

export function pickStreamResponseHeaders(upstream: Headers, contentType?: string): Record<string, string> {
  const out: Record<string, string> = { ...VIDEO_STREAM_HEADERS };
  const ct = contentType ?? upstream.get("content-type") ?? "video/mp4";
  out["Content-Type"] = ct.includes("video") ? ct : "video/mp4";
  const cr = upstream.get("content-range");
  const cl = upstream.get("content-length");
  const ar = upstream.get("accept-ranges");
  if (cr) out["Content-Range"] = cr;
  if (cl) out["Content-Length"] = cl;
  if (ar) out["Accept-Ranges"] = ar;
  return out;
}
