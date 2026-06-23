/**
 * Upload v25 image buffer to Supabase media bucket (Node / cron context).
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getSupabaseAdmin } from "../writers/writer-base.mjs";
import { DATA_ROOT } from "../shared.mjs";

export async function uploadBufferToMedia(relativePath, buffer, contentType = "image/webp") {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const path = `v25-images/${relativePath.replace(/\\/g, "/")}`;
  const { error } = await admin.storage.from("media").upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) return null;
  const { data } = admin.storage.from("media").getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export function readImageBuffer(relativePath) {
  const full = join(DATA_ROOT, relativePath.replace(/^\//, ""));
  if (!existsSync(full)) return null;
  try {
    return readFileSync(full);
  } catch {
    return null;
  }
}
