import { queueHeyGenRender, isHeyGenConfigured } from "@/lib/academy/ai/video-providers/heygen";
import { queueSynthesiaRender, isSynthesiaConfigured } from "@/lib/academy/ai/video-providers/synthesia";
import type { QueueRenderInput, QueueRenderResult, VideoProviderName } from "@/lib/academy/ai/video-providers/types";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type { QueueRenderInput, QueueRenderResult, VideoProviderName, WebhookRenderComplete } from "@/lib/academy/ai/video-providers/types";
export { isHeyGenConfigured, isSynthesiaConfigured };

export function getPreferredVideoProvider(): VideoProviderName {
  if (isHeyGenConfigured()) return "heygen";
  if (isSynthesiaConfigured()) return "synthesia";
  return "placeholder";
}

/** Queue external avatar video render via HeyGen (preferred) or Synthesia. */
export async function queueExternalVideoRender(input: QueueRenderInput): Promise<QueueRenderResult> {
  const provider = getPreferredVideoProvider();
  if (provider === "heygen") return queueHeyGenRender(input);
  if (provider === "synthesia") return queueSynthesiaRender(input);
  return {
    provider: "placeholder",
    status: "ready",
    message: "No HEYGEN_API_KEY or SYNTHESIA_API_KEY — placeholder MP4 retained",
  };
}

/** Apply webhook completion to video_assets row. */
export async function applyVideoRenderWebhook(opts: {
  videoAssetId: string;
  provider: VideoProviderName;
  externalJobId: string;
  status: "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}): Promise<boolean> {
  const admin = createServiceRoleClient();
  const { data: asset } = await admin
    .from("video_assets")
    .select("id, metadata")
    .eq("id", opts.videoAssetId)
    .maybeSingle();

  if (!asset) {
    const { data: byJob } = await admin
      .from("video_assets")
      .select("id, metadata")
      .contains("metadata", { external_job_id: opts.externalJobId })
      .maybeSingle();
    if (!byJob) return false;
    return applyVideoRenderWebhook({ ...opts, videoAssetId: byJob.id as string });
  }

  const meta = (asset.metadata ?? {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = {
    ...meta,
    render_provider: opts.provider,
    external_job_id: opts.externalJobId,
    render_status: opts.status === "completed" ? "ready" : "failed",
    render_completed_at: new Date().toISOString(),
  };

  if (opts.status === "completed" && opts.videoUrl) {
    patch.public_url = opts.videoUrl;
    patch.pending_external_render = false;
    patch.generated = true;
  }
  if (opts.thumbnailUrl) patch.thumbnail_url = opts.thumbnailUrl;
  if (opts.error) patch.render_error = opts.error;

  const rowPatch: { metadata: Record<string, unknown>; status?: string } = { metadata: patch };
  if (opts.status === "completed" && opts.videoUrl) rowPatch.status = "ready";
  if (opts.status === "failed") rowPatch.status = "failed";

  const { error } = await admin.from("video_assets").update(rowPatch).eq("id", opts.videoAssetId);
  return !error;
}
