import { NextResponse } from "next/server";

import { generateVoice } from "@/lib/v40/ai/voice-openai";
import { prepareArticleForSpeech } from "@/lib/tts/prepare-for-speech";
import { ttsResponseHeaders } from "@/lib/v41/ai/tts-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ttsResponseHeaders() });
}

export async function POST(request: Request) {
  let body: { script?: string; text?: string; title?: string; lang?: string } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: ttsResponseHeaders() });
  }

  const raw = (body.script ?? body.text)?.trim()?.slice(0, 4096);
  if (!raw) {
    return NextResponse.json({ error: "script or text required" }, { status: 400, headers: ttsResponseHeaders() });
  }

  const script =
    prepareArticleForSpeech({ title: body.title, content: raw }) || raw;

  const result = await generateVoice({ script, title: body.title ?? "voice" });

  return NextResponse.json(
    {
      ok: result.status === "ready",
      voice_provider: result.voice_provider,
      public_url: result.public_url ?? result.tts_audio_url,
      message: result.message,
      locale: "cs-CZ",
      metadata: result.metadata_patch,
    },
    { headers: ttsResponseHeaders() }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("text") ?? url.searchParams.get("script");
  if (!raw?.trim()) {
    return NextResponse.json({ error: "text query param required" }, { status: 400, headers: ttsResponseHeaders() });
  }

  const title = url.searchParams.get("title") ?? "voice";
  const script =
    prepareArticleForSpeech({ title, content: raw.trim().slice(0, 4096) }) ||
    raw.trim().slice(0, 4096);

  const result = await generateVoice({ script, title });

  return NextResponse.json(
    {
      ok: result.status === "ready",
      voice_provider: result.voice_provider,
      public_url: result.public_url ?? result.tts_audio_url,
      message: result.message,
      locale: "cs-CZ",
    },
    { headers: ttsResponseHeaders() }
  );
}
