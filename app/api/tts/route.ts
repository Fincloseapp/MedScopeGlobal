import OpenAI from "openai";
import { NextResponse } from "next/server";
import { ttsResponseHeaders } from "@/lib/v41/ai/tts-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TEXT_LENGTH = 4096;

function sanitizeText(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim().slice(0, MAX_TEXT_LENGTH);
  return text.length > 0 ? text : null;
}

function sanitizeVoice(raw: unknown): string {
  if (typeof raw !== "string") return "alloy";
  const voice = raw.trim().slice(0, 32);
  return /^[a-z0-9_-]+$/i.test(voice) ? voice : "alloy";
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ttsResponseHeaders() });
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed — use POST with JSON body { text, voice? }" },
    { status: 405, headers: ttsResponseHeaders() }
  );
}

export async function POST(req: Request) {
  try {
    let body: { text?: unknown; voice?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: ttsResponseHeaders() });
    }

    const text = sanitizeText(body.text);
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400, headers: ttsResponseHeaders() });
    }

    const voice = sanitizeVoice(body.voice ?? "alloy");

    const response = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: text,
      format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        ...ttsResponseHeaders("audio/mpeg"),
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "TTS failed" }, { status: 500, headers: ttsResponseHeaders() });
  }
}
