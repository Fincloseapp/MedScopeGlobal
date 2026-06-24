import { randomUUID } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";

const BUCKET = "media";
const PREFIX = "academy/videos";

export type VideoUploadResult = {
  storage_path: string;
  public_url: string;
  content_type: string;
  size_bytes: number;
};

/** Uploads an Academy video file to Supabase Storage (`media/academy/videos/…`). */
export async function uploadAcademyVideo(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<VideoUploadResult> {
  const ext = filename.split(".").pop()?.toLowerCase() || "mp4";
  const safeExt = ["mp4", "webm", "mov", "m4v"].includes(ext) ? ext : "mp4";
  const storage_path = `${PREFIX}/${randomUUID()}.${safeExt}`;

  const admin = createServiceRoleClient();
  const { error } = await admin.storage.from(BUCKET).upload(storage_path, buffer, {
    contentType: contentType || `video/${safeExt}`,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(storage_path);
  return {
    storage_path,
    public_url: data.publicUrl,
    content_type: contentType || `video/${safeExt}`,
    size_bytes: buffer.length,
  };
}
