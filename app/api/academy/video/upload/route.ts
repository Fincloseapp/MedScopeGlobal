import { NextResponse } from "next/server";
import { uploadAcademyVideo } from "@/lib/academy/storage/video";
import { extractVideoDuration } from "@/lib/academy/storage/video-metadata";
import { generateVideoThumbnailPlaceholder } from "@/lib/academy/storage/video-thumbnail";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_BYTES = 100 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "title je povinný" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Soubor videa je povinný" }, { status: 400 });
    }
    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      return NextResponse.json({ error: "Povolené jsou pouze video soubory" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: "Maximální velikost videa je 100 MB" }, { status: 400 });
    }

    const uploaded = await uploadAcademyVideo(buffer, file.name, file.type);
    const duration = extractVideoDuration(buffer, file.type, buffer.length);
    const thumbnail = await generateVideoThumbnailPlaceholder(
      title,
      duration.duration_seconds
    );
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("video_assets")
      .insert({
        title,
        storage_path: uploaded.storage_path,
        status: "ready",
        duration_seconds: duration.duration_seconds ?? 0,
        metadata: {
          public_url: uploaded.public_url,
          content_type: uploaded.content_type,
          size_bytes: uploaded.size_bytes,
          original_filename: file.name,
          duration_source: duration.source,
          thumbnail_path: thumbnail.thumbnail_path,
          thumbnail_url: thumbnail.thumbnail_url,
          thumbnail_source: thumbnail.source,
        },
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, video: data, upload: uploaded }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
