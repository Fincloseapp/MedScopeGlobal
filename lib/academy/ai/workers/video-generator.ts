import { queueExternalVideoRender, getPreferredVideoProvider } from "@/lib/academy/ai/video-providers";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { VideoScriptResult } from "@/lib/academy/ai/workers/video-script-generator";

/** Demo placeholder URL until HeyGen/Synthesia render completes */
const DEMO_VIDEO_URL =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const DEMO_THUMBNAIL =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&q=80";

export type VideoAssetCreateResult = {
  video_asset_id: string;
  status: "ready" | "pending" | "processing";
  public_url: string;
  generated: boolean;
  render_provider: string;
  external_job_id?: string;
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
  const provider = getPreferredVideoProvider();
  const usePlaceholder = provider === "placeholder";

  const metadata: Record<string, unknown> = {
    public_url: DEMO_VIDEO_URL,
    thumbnail_url: DEMO_THUMBNAIL,
    generated: true,
    generation_provider: provider,
    avatar_type: input.script.avatar_type,
    voice_type: input.script.voice_type,
    script: input.script.script,
    storyboard: input.script.storyboard,
    pending_external_render: !usePlaceholder,
    render_status: usePlaceholder ? "ready" : "queued",
    external_providers: ["heygen", "synthesia"],
  };

  const { data: asset, error } = await admin
    .from("video_assets")
    .insert({
      title: input.title,
      storage_path: storagePath,
      duration_seconds: input.script.duration_estimate_seconds,
      status: usePlaceholder ? "ready" : "processing",
      metadata,
    })
    .select("id")
    .single();

  if (error || !asset) throw new Error(error?.message ?? "Nepodařilo se vytvořit video asset");

  const render = await queueExternalVideoRender({
    title: input.title,
    script: input.script,
    videoAssetId: asset.id,
    lessonId: input.lessonId,
  });

  if (render.external_job_id || render.provider !== "placeholder") {
    await admin
      .from("video_assets")
      .update({
        status: render.status === "processing" ? "processing" : render.status === "failed" ? "ready" : "ready",
        metadata: {
          ...metadata,
          render_provider: render.provider,
          external_job_id: render.external_job_id ?? null,
          render_status: render.status,
          render_message: render.message ?? null,
          pending_external_render: render.status === "processing",
        },
      })
      .eq("id", asset.id);
  }

  if (input.lessonId) {
    await admin.from("lessons").update({ video_asset_id: asset.id }).eq("id", input.lessonId);
  }

  return {
    video_asset_id: asset.id,
    status: render.status === "processing" ? "processing" : "ready",
    public_url: render.public_url ?? DEMO_VIDEO_URL,
    generated: true,
    render_provider: render.provider,
    external_job_id: render.external_job_id,
  };
}
