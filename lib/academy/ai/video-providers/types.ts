import type { VideoScriptResult } from "@/lib/academy/ai/workers/video-script-generator";

export type VideoProviderName =
  | "heygen"
  | "synthesia"
  | "openai_tts"
  | "mux"
  | "placeholder";

export type ExternalRenderStatus = "queued" | "processing" | "ready" | "failed";

export type LessonFormat = "video" | "audio_lesson";

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
  tts_audio_url?: string;
  avatar_image_url?: string;
  lesson_format?: LessonFormat;
  message?: string;
  metadata_patch?: Record<string, unknown>;
};

export type WebhookRenderComplete = {
  provider: VideoProviderName;
  external_job_id: string;
  status: "completed" | "failed";
  video_url?: string;
  thumbnail_url?: string;
  mux_playback_id?: string;
  error?: string;
};
