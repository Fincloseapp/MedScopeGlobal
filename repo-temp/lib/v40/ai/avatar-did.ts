export type DidAvatarResult = {
  ok: boolean;
  skipped: boolean;
  video_url?: string;
  talk_id?: string;
  message?: string;
};

export function isDidConfigured(): boolean {
  return Boolean(process.env.D_ID_API_KEY?.trim());
}

/** D-ID talking avatar — optional, skipped gracefully without API key */
export async function generateDidAvatar(input: {
  script: string;
  title: string;
  sourceUrl?: string;
}): Promise<DidAvatarResult> {
  const apiKey = process.env.D_ID_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, skipped: true, message: "D_ID_API_KEY not set — avatar skipped" };
  }

  const presenterUrl =
    input.sourceUrl ??
    process.env.D_ID_PRESENTER_URL?.trim() ??
    "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg";

  try {
    const res = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: input.script.slice(0, 2000),
          provider: { type: "microsoft", voice_id: "cs-CZ-VlastaNeural" },
        },
        source_url: presenterUrl,
        config: { stitch: true, result_format: "mp4" },
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { ok: false, skipped: false, message: `D-ID HTTP ${res.status}: ${errText.slice(0, 200)}` };
    }

    const data = (await res.json()) as { id?: string; status?: string; result_url?: string };
    return {
      ok: true,
      skipped: false,
      talk_id: data.id,
      video_url: data.result_url,
      message: data.status === "done" ? "D-ID avatar ready" : "D-ID avatar queued",
    };
  } catch (e) {
    return {
      ok: false,
      skipped: false,
      message: e instanceof Error ? e.message : "D-ID request failed",
    };
  }
}

export async function pollDidTalk(talkId: string, maxAttempts = 12): Promise<DidAvatarResult> {
  const apiKey = process.env.D_ID_API_KEY?.trim();
  if (!apiKey) return { ok: false, skipped: true, message: "D_ID_API_KEY not set" };

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: { Authorization: `Basic ${apiKey}` },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) break;
      const data = (await res.json()) as { status?: string; result_url?: string };
      if (data.status === "done" && data.result_url) {
        return { ok: true, skipped: false, talk_id: talkId, video_url: data.result_url, message: "D-ID ready" };
      }
      if (data.status === "error") {
        return { ok: false, skipped: false, talk_id: talkId, message: "D-ID render failed" };
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  return { ok: false, skipped: false, talk_id: talkId, message: "D-ID poll timeout" };
}
