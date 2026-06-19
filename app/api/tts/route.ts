import { NextResponse } from "next/server";
import { synthesizeTts, ttsResponseHeaders } from "@/lib/v41/ai/tts-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_TEXT_LENGTH = 4096;

function sanitizeText(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim().slice(0, MAX_TEXT_LENGTH);
  return text.length > 0 ? text : null;
}

function sanitizeVoice(raw: unknown): string {
  if (typeof raw !== "string") return "cs-CZ";
  const voice = raw.trim().slice(0, 32);
  return voice.length > 0 ? voice : "cs-CZ";
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ttsResponseHeaders() });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      provider: "web_speech_api",
      mode: "browser",
      message: "POST { text } — returns browser TTS instructions (no server audio)",
    },
    { headers: ttsResponseHeaders() }
  );
}

export async function POST(req: Request) {
  try {
    let body: { text?: unknown; voice?: unknown; lang?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: ttsResponseHeaders() });
    }

    const text = sanitizeText(body.text);
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400, headers: ttsResponseHeaders() });
    }

    const lang = typeof body.lang === "string" ? body.lang.trim().slice(0, 16) : sanitizeVoice(body.voice);
    const result = await synthesizeTts({ text, voice: lang });

    if (result.provider === "edge_tts" && result.audioUrl) {
      const upstream = await fetch(result.audioUrl, { signal: AbortSignal.timeout(60_000) });
      if (upstream.ok) {
        const buffer = Buffer.from(await upstream.arrayBuffer());
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            ...ttsResponseHeaders("audio/mpeg"),
            "Content-Type": upstream.headers.get("content-type") ?? "audio/mpeg",
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    return NextResponse.json(
      {
        ok: true,
        mode: "browser",
        provider: result.provider,
        text,
        lang,
        message: result.message ?? "Use Web Speech API on client",
      },
      { status: 200, headers: ttsResponseHeaders() }
    );
  } catch {
    return NextResponse.json({ error: "TTS failed" }, { status: 500, headers: ttsResponseHeaders() });
  }
}
