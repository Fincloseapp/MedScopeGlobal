import { createServiceRoleClient } from "@/lib/supabase/service";
import type { VideoScriptResult } from "@/lib/academy/ai/workers/video-script-generator";

/** Demo placeholder URL until HeyGen/Synthesia integration */
const DEMO_VIDEO_URL =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const DEMO_THUMBNAIL =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&q=80";

export type VideoAssetCreateResult = {
  video_asset_id: string;
  status: "ready" | "pending";
  public_url: string;
  generated: boolean;
};

export async function createVideoAssetFromScript(input: {
  title: string;
  script: VideoScriptResult;
  lessonId?: string;
}): Promise<VideoAssetCreateResult> {
  const admin = createServiceRoleClient();
  const slug = input.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60);

  const storagePath = `academy/videos/generated/${slug}-${Date.now()}.mp4`;

  const metadata = {
    public_url: DEMO_VIDEO_URL,
    thumbnail_url: DEMO_THUMBNAIL,
    generated: true,
    generation_provider: "medscope-ai-stub",
    avatar_type: input.script.avatar_type,
    voice_type: input.script.voice_type,
    script: input.script.script,
    storyboard: input.script.storyboard,
    pending_external_render: true,
    external_providers: ["heygen", "synthesia"],
  };

  const { data: asset, error } = await admin
    .from("video_assets")
    .insert({
      title: input.title,
      storage_path: storagePath,
      duration_seconds: input.script.duration_estimate_seconds,
      status: "ready",
      metadata,
    })
    .select("id")
    .single();

  if (error || !asset) throw new Error(error?.message ?? "Nepodařilo se vytvořit video asset");

  if (input.lessonId) {
    await admin
      .from("lessons")
      .update({ video_asset_id: asset.id })
      .eq("id", input.lessonId);
  }

  return {
    video_asset_id: asset.id,
    status: "ready",
    public_url: DEMO_VIDEO_URL,
    generated: true,
  };
}
