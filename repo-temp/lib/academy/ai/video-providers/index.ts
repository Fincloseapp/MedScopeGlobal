import { logAiEvent } from "@/lib/academy/ai/controller";
import { queueHeyGenRender, isHeyGenConfigured } from "@/lib/academy/ai/video-providers/heygen";
import { createMuxAssetFromUrl, isMuxConfigured, muxMp4Url } from "@/lib/academy/ai/video-providers/mux";
import { queueSynthesiaRender, isSynthesiaConfigured } from "@/lib/academy/ai/video-providers/synthesia";
import type {
  QueueRenderInput,
  QueueRenderResult,
  VideoProviderName,
} from "@/lib/academy/ai/video-providers/types";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { runSlideshowPipeline } from "@/lib/v25/video/slideshow-pipeline";

export type { QueueRenderInput, QueueRenderResult, VideoProviderName, WebhookRenderComplete } from "@/lib/academy/ai/video-providers/types";
export { isHeyGenConfigured, pollHeyGenVideoStatus } from "@/lib/academy/ai/video-providers/heygen";
export { isSynthesiaConfigured } from "@/lib/academy/ai/video-providers/synthesia";
export { isMuxConfigured, muxPlaybackUrl, muxMp4Url } from "@/lib/academy/ai/video-providers/mux";

/** OpenAI TTS removed — always false (v25 free-only). */
export function isOpenAiTtsConfigured(): boolean {
  return false;
}

export function getPreferredVideoProvider(): VideoProviderName {
  if (isHeyGenConfigured()) return "heygen";
  if (isSynthesiaConfigured()) return "synthesia";
  return "placeholder";
}

export function getVideoProviderChain(): VideoProviderName[] {
  const chain: VideoProviderName[] = [];
  if (isHeyGenConfigured()) chain.push("heygen");
  if (isSynthesiaConfigured()) chain.push("synthesia");
  chain.push("placeholder");
  return chain;
}

/**
 * Provider chain: HeyGen → Synthesia → free slideshow pipeline → placeholder MP4.
 */
export async function queueExternalVideoRender(input: QueueRenderInput): Promise<QueueRenderResult> {
  const attempts: QueueRenderResult[] = [];

  if (isHeyGenConfigured()) {
    const result = await queueHeyGenRender(input);
    attempts.push(result);
    if (result.status === "processing") return result;
  }

  if (isSynthesiaConfigured()) {
    const result = await queueSynthesiaRender(input);
    attempts.push(result);
    if (result.status === "processing") return result;
  }

  const slideshow = await runSlideshowPipeline({
    topic: input.title,
  });

  if (slideshow.ok && slideshow.slidesJsonUrl) {
    return {
      provider: "placeholder",
      status: "ready",
      public_url: slideshow.videoUrl,
      message: slideshow.message,
      metadata_patch: {
        lesson_format: slideshow.mode === "mp4" ? "video" : "slideshow",
        slideshow_manifest_url: slideshow.slidesJsonUrl,
        voiceover_text: slideshow.plan?.voiceoverText,
        tts_provider: "web_speech_api",
        render_status: "ready",
        generated: true,
        video_mode: slideshow.mode,
      },
    };
  }

  const lastError = attempts.find((a) => a.status === "failed")?.message;
  return {
    provider: "placeholder",
    status: "ready",
    message: lastError
      ? `All providers failed — placeholder retained (${lastError})`
      : "Free slideshow pipeline — placeholder MP4 + slides overlay",
    public_url: slideshow.videoUrl,
    metadata_patch: {
      tts_provider: "web_speech_api",
      lesson_format: "slideshow",
      render_status: "ready",
    },
  };
}



/** Optionally queue Mux transcoding after external render URL is available. */

export async function queueMuxTranscodeIfConfigured(input: {

  videoAssetId: string;

  title: string;

  sourceVideoUrl: string;

}): Promise<QueueRenderResult | null> {

  if (!isMuxConfigured()) return null;

  return createMuxAssetFromUrl({

    videoUrl: input.sourceVideoUrl,

    videoAssetId: input.videoAssetId,

    title: input.title,

  });

}



/** Apply webhook completion to video_assets row and link lesson. */

export async function applyVideoRenderWebhook(opts: {

  videoAssetId: string;

  provider: VideoProviderName;

  externalJobId: string;

  status: "completed" | "failed";

  videoUrl?: string;

  thumbnailUrl?: string;

  muxPlaybackId?: string;

  error?: string;

}): Promise<boolean> {

  const admin = createServiceRoleClient();

  const { data: asset } = await admin

    .from("video_assets")

    .select("id, title, metadata")

    .eq("id", opts.videoAssetId)

    .maybeSingle();



  if (!asset) {

    const { data: byJob } = await admin

      .from("video_assets")

      .select("id, title, metadata")

      .contains("metadata", { external_job_id: opts.externalJobId })

      .maybeSingle();

    if (!byJob) {

      const { data: byHeygen } = await admin

        .from("video_assets")

        .select("id, title, metadata")

        .contains("metadata", { heygen_video_id: opts.externalJobId })

        .maybeSingle();

      if (!byHeygen) return false;

      return applyVideoRenderWebhook({ ...opts, videoAssetId: byHeygen.id as string });

    }

    return applyVideoRenderWebhook({ ...opts, videoAssetId: byJob.id as string });

  }



  const meta = (asset.metadata ?? {}) as Record<string, unknown>;

  const completed = opts.status === "completed";

  const finalUrl =

    opts.muxPlaybackId != null

      ? muxMp4Url(opts.muxPlaybackId)

      : opts.videoUrl;



  const patch: Record<string, unknown> = {

    ...meta,

    render_provider: opts.provider,

    external_job_id: opts.externalJobId,

    render_status: completed ? "ready" : "failed",

    render_completed_at: new Date().toISOString(),

    pending_external_render: !completed,

  };



  if (completed && finalUrl) {

    patch.public_url = finalUrl;

    patch.generated = true;

    patch.pending_external_render = false;

    patch.lesson_format = meta.lesson_format ?? "video";

  }

  if (opts.thumbnailUrl) patch.thumbnail_url = opts.thumbnailUrl;

  if (opts.muxPlaybackId) {

    patch.mux_playback_id = opts.muxPlaybackId;

    patch.pending_mux_transcode = false;

    patch.mux_status = "ready";

  }

  if (opts.error) patch.render_error = opts.error;



  const rowPatch: { metadata: Record<string, unknown>; status?: string } = { metadata: patch };

  if (completed && finalUrl) rowPatch.status = "ready";

  if (!completed) rowPatch.status = "failed";



  const { error } = await admin.from("video_assets").update(rowPatch).eq("id", opts.videoAssetId);

  if (error) return false;



  // Link lesson via video_asset_id (lessons don't have video_url column)

  const { data: lessons } = await admin

    .from("lessons")

    .select("id")

    .eq("video_asset_id", opts.videoAssetId);



  if (lessons?.length) {

    for (const lesson of lessons) {

      await admin

        .from("lessons")

        .update({ updated_at: new Date().toISOString() })

        .eq("id", lesson.id);

    }

  }



  await logAiEvent({

    worker: "video-webhook",

    message: completed

      ? `Render completed via ${opts.provider}`

      : `Render failed via ${opts.provider}`,

    level: completed ? "info" : "warn",

    payload: {

      video_asset_id: opts.videoAssetId,

      provider: opts.provider,

      external_job_id: opts.externalJobId,

      public_url: finalUrl ?? null,

      lesson_ids: lessons?.map((l) => l.id) ?? [],

    },

  });



  // Chain Mux transcoding when HeyGen/Synthesia delivers raw URL

  if (completed && opts.videoUrl && !opts.muxPlaybackId && opts.provider !== "mux") {

    const muxResult = await queueMuxTranscodeIfConfigured({

      videoAssetId: opts.videoAssetId,

      title: asset.title,

      sourceVideoUrl: opts.videoUrl,

    });

    if (muxResult?.status === "processing" && muxResult.metadata_patch) {

      await admin

        .from("video_assets")

        .update({

          metadata: { ...patch, ...muxResult.metadata_patch },

        })

        .eq("id", opts.videoAssetId);

    }

  }



  return true;

}


