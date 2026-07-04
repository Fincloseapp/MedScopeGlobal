import {
  queueExternalVideoRender,
  getPreferredVideoProvider,
  type QueueRenderResult,
} from "@/lib/academy/ai/video-providers";
import { queueOpenAiTtsRender } from "@/lib/academy/ai/video-providers/openai-tts-video";
import type { VideoScriptResult } from "@/lib/academy/ai/workers/video-script-generator";
import { buildVideoEditorialMetadataPatch } from "@/lib/editorial/video-units";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { isEdgeTtsAvailable } from "@/lib/tts/edge-tts-czech";
import { getPublicAvatar } from "@/lib/verejnost/osveta/avatars";

const DEMO_VIDEO_URL =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasCzechEdgeAudio(render: QueueRenderResult): boolean {
  return (
    render.status === "ready" &&
    Boolean(render.tts_audio_url) &&
    (render.provider === "openai_tts" || render.metadata_patch?.tts_provider === "edge_tts")
  );
}

/** Retry Czech Edge TTS directly when provider chain falls back to slideshow placeholder. */
async function ensureCzechEdgeTtsRender(input: {
  title: string;
  script: VideoScriptResult;
  videoAssetId: string;
}): Promise<{ render: QueueRenderResult; edgeTtsAttempts: string[] }> {
  let render = await queueExternalVideoRender(input);
  const edgeTtsAttempts: string[] = [];

  if (hasCzechEdgeAudio(render)) {
    return { render, edgeTtsAttempts };
  }

  if (!isEdgeTtsAvailable()) {
    edgeTtsAttempts.push("edge_tts_unavailable_in_runtime");
    return { render, edgeTtsAttempts };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const direct = await queueOpenAiTtsRender(input);
    edgeTtsAttempts.push(direct.message ?? `attempt_${attempt + 1}:${direct.status}`);
    if (hasCzechEdgeAudio(direct)) {
      return { render: direct, edgeTtsAttempts };
    }
    if (attempt < 2) await sleep(1500 * (attempt + 1));
  }

  return { render, edgeTtsAttempts };
}

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

  getPreferredVideoProvider();
  const { render, edgeTtsAttempts } = await ensureCzechEdgeTtsRender({
    title: input.title,
    script: scriptResult,
    videoAssetId: input.videoId,
  });

  const czechAudioReady = hasCzechEdgeAudio(render);
  let videoUrl = render.public_url ?? render.tts_audio_url ?? DEMO_VIDEO_URL;
  let thumbnailUrl = render.avatar_image_url ?? avatar.imageUrl;
  let lessonFormat: "video" | "audio_lesson" = "video";

  if (czechAudioReady && render.tts_audio_url) {
    videoUrl = render.tts_audio_url;
    thumbnailUrl = render.avatar_image_url ?? avatar.imageUrl;
    lessonFormat = "audio_lesson";
  } else if (render.provider === "placeholder") {
    videoUrl = DEMO_VIDEO_URL;
    thumbnailUrl = avatar.imageUrl;
  }

  const metadata: Record<string, unknown> = {
    ...(render.metadata_patch ?? {}),
    render_provider: czechAudioReady ? "openai_tts" : render.provider,
    lesson_format: czechAudioReady
      ? "audio_lesson"
      : (render.metadata_patch?.lesson_format ?? lessonFormat),
    avatar_type: input.avatarType,
    render_status: render.status,
    language: "cs",
    ...(edgeTtsAttempts.length ? { edge_tts_attempts: edgeTtsAttempts } : {}),
    ...(czechAudioReady
      ? {}
      : edgeTtsAttempts.length
        ? { render_error: edgeTtsAttempts.at(-1) }
        : {}),
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
    render_provider: czechAudioReady ? "openai_tts" : render.provider,
    lesson_format: lessonFormat,
    metadata,
  };
}
