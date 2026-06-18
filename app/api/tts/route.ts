import { NextResponse } from "next/server";
import {
  streamElevenLabsAudio,
  streamOpenAiAudio,
  synthesizeTts,
  ttsResponseHeaders,
} from "@/lib/v41/ai/tts-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ttsResponseHeaders() });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const text = url.searchParams.get("text")?.trim();
  if (!text) {
    return NextResponse.json({ error: "text query param required" }, { status: 400, headers: ttsResponseHeaders() });
  }

  const stream = url.searchParams.get("stream") !== "false";
  if (stream) {
    const eleven = await streamElevenLabsAudio(text);
    if (eleven?.body) {
      return new NextResponse(eleven.body, {
        status: 200,
        headers: { ...ttsResponseHeaders("audio/mpeg"), "Content-Type": "audio/mpeg" },
      });
    }
    const openai = await streamOpenAiAudio(text);
    if (openai?.body) {
      return new NextResponse(openai.body, {
        status: 200,
        headers: { ...ttsResponseHeaders("audio/mpeg"), "Content-Type": "audio/mpeg" },
      });
    }
  }

  const result = await synthesizeTts({ text, stream });
  return NextResponse.json(result, { headers: ttsResponseHeaders() });
}

export async function POST(request: Request) {
  let body: { text?: string; stream?: boolean; title?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: ttsResponseHeaders() });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400, headers: ttsResponseHeaders() });
  }

  if (body.stream !== false) {
    const eleven = await streamElevenLabsAudio(text);
    if (eleven?.body) {
      return new NextResponse(eleven.body, {
        status: 200,
        headers: { ...ttsResponseHeaders("audio/mpeg"), "Content-Type": "audio/mpeg" },
      });
    }
    const openai = await streamOpenAiAudio(text);
    if (openai?.body) {
      return new NextResponse(openai.body, {
        status: 200,
        headers: { ...ttsResponseHeaders("audio/mpeg"), "Content-Type": "audio/mpeg" },
      });
    }
  }

  const result = await synthesizeTts({ text, title: body.title, stream: body.stream });
  return NextResponse.json(result, { headers: ttsResponseHeaders() });
}
