import { createHmac, timingSafeEqual } from "crypto";
import type { QueueRenderResult } from "@/lib/academy/ai/video-providers/types";

const MUX_API = "https://api.mux.com/video/v1";

export function isMuxConfigured(): boolean {
  return Boolean(process.env.MUX_TOKEN_ID?.trim() && process.env.MUX_TOKEN_SECRET?.trim());
}

function muxAuthHeader(): string {
  const id = process.env.MUX_TOKEN_ID!.trim();
  const secret = process.env.MUX_TOKEN_SECRET!.trim();
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export function muxPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function muxMp4Url(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}/high.mp4`;
}

/** Create Mux asset from external video URL for transcoding + CDN delivery. */
export async function createMuxAssetFromUrl(input: {
  videoUrl: string;
  videoAssetId: string;
  title: string;
}): Promise<QueueRenderResult> {
  if (!isMuxConfigured()) {
    return {
      provider: "mux",
      status: "ready",
      message: "MUX_TOKEN_ID/SECRET not set — skipping transcoding",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com";
  const webhookUrl = `${siteUrl}/api/academy/video/mux-webhook`;

  try {
    const res = await fetch(`${MUX_API}/assets`, {
      method: "POST",
      headers: {
        Authorization: muxAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [{ url: input.videoUrl }],
        playback_policy: ["public"],
        passthrough: JSON.stringify({
          video_asset_id: input.videoAssetId,
          title: input.title,
        }),
        meta: { title: input.title },
        ...(process.env.MUX_WEBHOOK_SECRET ? { mp4_support: "standard" } : {}),
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const json = (await res.json()) as {
      data?: { id?: string; status?: string; playback_ids?: Array<{ id?: string }> };
      error?: { type?: string; messages?: string[] };
    };

    if (!res.ok) {
      const msg = json.error?.messages?.join("; ") ?? `Mux HTTP ${res.status}`;
      return { provider: "mux", status: "failed", message: msg };
    }

    const assetId = json.data?.id;
    const playbackId = json.data?.playback_ids?.[0]?.id;

    return {
      provider: "mux",
      status: "processing",
      external_job_id: assetId,
      message: `Mux transcoding queued (webhook: ${webhookUrl})`,
      metadata_patch: {
        mux_asset_id: assetId ?? null,
        mux_playback_id: playbackId ?? null,
        mux_status: json.data?.status ?? "preparing",
        pending_mux_transcode: true,
      },
    };
  } catch (e) {
    return {
      provider: "mux",
      status: "failed",
      message: e instanceof Error ? e.message : "Mux asset creation failed",
    };
  }
}

/** Verify Mux webhook signature (Mux-Signature header). */
export function verifyMuxWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.MUX_WEBHOOK_SECRET?.trim();
  if (!secret || !signatureHeader) return false;

  try {
    const parts = signatureHeader.split(",").reduce(
      (acc, part) => {
        const [k, v] = part.split("=");
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      },
      {} as Record<string, string>
    );

    const timestamp = parts.t;
    const sig = parts.v1;
    if (!timestamp || !sig) return false;

    const payload = `${timestamp}.${rawBody}`;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (sig.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export type MuxWebhookEvent = {
  type?: string;
  data?: {
    id?: string;
    status?: string;
    passthrough?: string;
    playback_ids?: Array<{ id?: string; policy?: string }>;
    duration?: number;
  };
};

export function parseMuxPassthrough(passthrough: string | undefined): {
  video_asset_id?: string;
  title?: string;
} {
  if (!passthrough) return {};
  try {
    return JSON.parse(passthrough) as { video_asset_id?: string; title?: string };
  } catch {
    return {};
  }
}
