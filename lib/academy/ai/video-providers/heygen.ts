import type { QueueRenderInput, QueueRenderResult } from "@/lib/academy/ai/video-providers/types";

const HEYGEN_API = "https://api.heygen.com/v2";

export function isHeyGenConfigured(): boolean {
  return Boolean(process.env.HEYGEN_API_KEY?.trim());
}

/** Queue HeyGen avatar video render. Falls back to placeholder when key missing. */
export async function queueHeyGenRender(input: QueueRenderInput): Promise<QueueRenderResult> {
  const apiKey = process.env.HEYGEN_API_KEY?.trim();
  if (!apiKey) {
    return {
      provider: "placeholder",
      status: "ready",
      message: "HEYGEN_API_KEY not set — using demo placeholder MP4",
    };
  }

  const avatarId = process.env.HEYGEN_AVATAR_ID?.trim() ?? "default";
  const voiceId = process.env.HEYGEN_VOICE_ID?.trim() ?? "cs-female-1";

  try {
    const res = await fetch(`${HEYGEN_API}/video/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: { type: "avatar", avatar_id: avatarId },
            voice: { type: "text", input_text: input.script.script.slice(0, 5000), voice_id: voiceId },
          },
        ],
        title: input.title,
        callback_id: input.videoAssetId,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const json = (await res.json()) as { data?: { video_id?: string }; error?: string; message?: string };

    if (!res.ok) {
      return {
        provider: "heygen",
        status: "failed",
        message: json.error ?? json.message ?? `HeyGen HTTP ${res.status}`,
      };
    }

    const jobId = json.data?.video_id;
    if (!jobId) {
      return { provider: "heygen", status: "failed", message: "HeyGen response missing video_id" };
    }

    return {
      provider: "heygen",
      status: "processing",
      external_job_id: jobId,
      message: "HeyGen render queued",
    };
  } catch (e) {
    return {
      provider: "heygen",
      status: "failed",
      message: e instanceof Error ? e.message : "HeyGen request failed",
    };
  }
}
