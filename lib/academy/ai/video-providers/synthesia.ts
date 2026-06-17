import type { QueueRenderInput, QueueRenderResult } from "@/lib/academy/ai/video-providers/types";

const SYNTHESIA_API = "https://api.synthesia.io/v2";

export function isSynthesiaConfigured(): boolean {
  return Boolean(process.env.SYNTHESIA_API_KEY?.trim());
}

/** Queue Synthesia avatar video render. Falls back when key missing. */
export async function queueSynthesiaRender(input: QueueRenderInput): Promise<QueueRenderResult> {
  const apiKey = process.env.SYNTHESIA_API_KEY?.trim();
  if (!apiKey) {
    return {
      provider: "placeholder",
      status: "ready",
      message: "SYNTHESIA_API_KEY not set — using demo placeholder MP4",
    };
  }

  const avatar = process.env.SYNTHESIA_AVATAR_ID?.trim() ?? "anna_costume1_cameraA";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com";
  const callbackUrl = `${siteUrl}/api/academy/video/webhook?synthesia=1`;

  try {
    const res = await fetch(`${SYNTHESIA_API}/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        test: process.env.NODE_ENV !== "production",
        title: input.title,
        callbackUrl,
        input: [
          {
            scriptText: input.script.script.slice(0, 5000),
            avatar,
            background: "green_screen",
          },
        ],
        metadata: { video_asset_id: input.videoAssetId, lesson_id: input.lessonId ?? null },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const json = (await res.json()) as { id?: string; message?: string; error?: string };

    if (!res.ok) {
      return {
        provider: "synthesia",
        status: "failed",
        message: json.error ?? json.message ?? `Synthesia HTTP ${res.status}`,
      };
    }

    if (!json.id) {
      return { provider: "synthesia", status: "failed", message: "Synthesia response missing id" };
    }

    return {
      provider: "synthesia",
      status: "processing",
      external_job_id: json.id,
      message: "Synthesia render queued",
    };
  } catch (e) {
    return {
      provider: "synthesia",
      status: "failed",
      message: e instanceof Error ? e.message : "Synthesia request failed",
    };
  }
}
