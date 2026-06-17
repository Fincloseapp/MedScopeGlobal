import type { VideoScriptResult } from "@/lib/academy/ai/workers/video-script-generator";

export type VideoProviderName = "heygen" | "synthesia" | "placeholder";

export type ExternalRenderStatus = "queued" | "processing" | "ready" | "failed";

export type QueueRenderInput = {
  title: string;
  script: VideoScriptResult;
  videoAssetId: string;
  lessonId?: string;
};

export type QueueRenderResult = {
  provider: VideoProviderName;
  status: ExternalRenderStatus;
  external_job_id?: string;
  public_url?: string;
  message?: string;
};

export type WebhookRenderComplete = {
  provider: VideoProviderName;
  external_job_id: string;
  status: "completed" | "failed";
  video_url?: string;
  thumbnail_url?: string;
  error?: string;
};
