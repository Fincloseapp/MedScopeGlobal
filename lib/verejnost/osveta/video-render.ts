import { queueExternalVideoRender, getPreferredVideoProvider } from "@/lib/academy/ai/video-providers";
import type { VideoScriptResult } from "@/lib/academy/ai/workers/video-script-generator";
import { buildVideoEditorialMetadataPatch } from "@/lib/editorial/video-units";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPublicAvatar } from "@/lib/verejnost/osveta/avatars";

const DEMO_VIDEO_URL =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export type PublicVideoRenderResult = {
  video_url: string;
  thumbnail_url: string;
  render_provider: string;
  lesson_format: "video" | "audio_lesson";
  metadata: Record<string, unknown>;
};

export async function renderPublicOsvetaVideo(input: {
  videoId: string;
  title: string;
  script: string;
  avatarType: string;
  durationSeconds?: number;
}): Promise<PublicVideoRenderResult> {
  const avatar = getPublicAvatar(input.avatarType);
  const scriptResult: VideoScriptResult = {
    script: input.script,
    storyboard: [],
    avatar_type: input.avatarType,
    voice_type: avatar.voiceHint,
    duration_estimate_seconds: input.durationSeconds ?? 75,
  };

  const provider = getPreferredVideoProvider();
  const render = await queueExternalVideoRender({
    title: input.title,
    script: scriptResult,
    videoAssetId: input.videoId,
  });

  let videoUrl = render.public_url ?? render.tts_audio_url ?? DEMO_VIDEO_URL;
  let thumbnailUrl = render.avatar_image_url ?? avatar.imageUrl;
  let lessonFormat: "video" | "audio_lesson" = "video";

  if (render.provider === "openai_tts" && render.tts_audio_url) {
    videoUrl = render.tts_audio_url;
    thumbnailUrl = render.avatar_image_url ?? avatar.imageUrl;
    lessonFormat = "audio_lesson";
  } else if (render.provider === "placeholder") {
    videoUrl = DEMO_VIDEO_URL;
    thumbnailUrl = avatar.imageUrl;
  }

  const metadata: Record<string, unknown> = {
    render_provider: render.provider,
    lesson_format: lessonFormat,
    avatar_type: input.avatarType,
    render_status: render.status,
    language: "cs",
    ...(render.metadata_patch ?? {}),
    ...buildVideoEditorialMetadataPatch({
      avatarType: input.avatarType,
      audience: "osveta",
      aiAssisted: true,
    }),
  };

  const admin = createServiceRoleClient();
  await admin
    .from("public_health_videos")
    .update({
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      metadata,
      status: render.status === "processing" ? "processing" : "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.videoId);

  return {
    video_url: videoUrl,
    thumbnail_url: thumbnailUrl,
    render_provider: render.provider,
    lesson_format: lessonFormat,
    metadata,
  };
}
