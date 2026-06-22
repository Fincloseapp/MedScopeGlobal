import { queueExternalVideoRender, getPreferredVideoProvider } from "@/lib/academy/ai/video-providers";

import { createServiceRoleClient } from "@/lib/supabase/service";

import type { VideoScriptResult } from "@/lib/academy/ai/workers/video-script-generator";



/** Demo placeholder URL when no TTS/video provider is configured */

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

  lesson_format?: string;

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



  const provider = getPreferredVideoProvider();

  const willUsePlaceholderOnly = provider === "placeholder";



  const storagePath =

    provider === "openai_tts"

      ? `academy/audio/generated/${slug}-${Date.now()}.mp3`

      : `academy/videos/generated/${slug}-${Date.now()}.mp4`;



  const metadata: Record<string, unknown> = {

    public_url: willUsePlaceholderOnly ? DEMO_VIDEO_URL : null,

    thumbnail_url: DEMO_THUMBNAIL,

    generated: true,

    generation_provider: provider,

    avatar_type: input.script.avatar_type,

    voice_type: input.script.voice_type,

    script: input.script.script,

    storyboard: input.script.storyboard,

    pending_external_render: !willUsePlaceholderOnly && provider !== "openai_tts",

    render_status: willUsePlaceholderOnly ? "ready" : "queued",

    lesson_format: provider === "openai_tts" ? "audio_lesson" : "video",

    external_providers: ["heygen", "synthesia", "openai_tts", "mux"],

  };



  const { data: asset, error } = await admin

    .from("video_assets")

    .insert({

      title: input.title,

      storage_path: storagePath,

      duration_seconds: input.script.duration_estimate_seconds,

      status: willUsePlaceholderOnly ? "ready" : "processing",

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



  const isAudioReady = render.provider === "openai_tts" && render.status === "ready";

  const isProcessing = render.status === "processing";

  const patch: Record<string, unknown> = {

    ...metadata,

    ...(render.metadata_patch ?? {}),

    render_provider: render.provider,

    external_job_id: render.external_job_id ?? null,

    heygen_video_id: render.metadata_patch?.heygen_video_id ?? null,

    render_status: render.status,

    render_message: render.message ?? null,

    pending_external_render: isProcessing,

  };



  if (isAudioReady && render.tts_audio_url) {

    patch.tts_audio_url = render.tts_audio_url;

    patch.avatar_image_url = render.avatar_image_url;

    patch.public_url = render.public_url ?? render.tts_audio_url;

    patch.thumbnail_url = render.avatar_image_url ?? DEMO_THUMBNAIL;

    patch.lesson_format = "audio_lesson";

    patch.pending_external_render = false;

  } else if (render.provider === "placeholder") {

    patch.public_url = DEMO_VIDEO_URL;

    patch.pending_external_render = false;

    patch.render_status = "ready";

  }



  await admin

    .from("video_assets")

    .update({

      status: isProcessing ? "processing" : isAudioReady || render.provider === "placeholder" ? "ready" : render.status === "failed" ? "failed" : "ready",

      metadata: patch,

      ...(isAudioReady ? { duration_seconds: (patch.duration_seconds as number) ?? input.script.duration_estimate_seconds } : {}),

    })

    .eq("id", asset.id);



  if (input.lessonId) {

    await admin.from("lessons").update({ video_asset_id: asset.id }).eq("id", input.lessonId);

  }



  const publicUrl =

    (patch.public_url as string) ??

    render.public_url ??

    render.tts_audio_url ??

    DEMO_VIDEO_URL;



  return {

    video_asset_id: asset.id,

    status: isProcessing ? "processing" : "ready",

    public_url: publicUrl,

    generated: true,

    render_provider: render.provider,

    external_job_id: render.external_job_id,

    lesson_format: (patch.lesson_format as string) ?? "video",

  };

}


