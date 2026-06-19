import { NextResponse } from "next/server";

import { generateVoice } from "@/lib/v40/ai/voice-openai";

import { ttsResponseHeaders } from "@/lib/v41/ai/tts-engine";



export const dynamic = "force-dynamic";

export const maxDuration = 120;



export async function OPTIONS() {

  return new NextResponse(null, { status: 204, headers: ttsResponseHeaders() });

}



export async function POST(request: Request) {

  let body: { script?: string; text?: string; title?: string } = {};

  try {

    body = await request.json();

  } catch {

    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: ttsResponseHeaders() });

  }



  const script = (body.script ?? body.text)?.trim()?.slice(0, 4096);

  if (!script) {

    return NextResponse.json({ error: "script or text required" }, { status: 400, headers: ttsResponseHeaders() });

  }



  const result = await generateVoice({ script, title: body.title ?? "voice" });

  return NextResponse.json(

    {

      ok: result.status === "ready",

      voice_provider: result.voice_provider,

      public_url: result.public_url ?? result.tts_audio_url,

      message: result.message,

      metadata: result.metadata_patch,

    },

    { headers: ttsResponseHeaders() }

  );

}



export async function GET(request: Request) {

  const url = new URL(request.url);

  const script = url.searchParams.get("text") ?? url.searchParams.get("script");

  if (!script?.trim()) {

    return NextResponse.json({ error: "text query param required" }, { status: 400, headers: ttsResponseHeaders() });

  }



  const result = await generateVoice({ script: script.trim().slice(0, 4096), title: url.searchParams.get("title") ?? "voice" });

  return NextResponse.json(

    {

      ok: result.status === "ready",

      voice_provider: result.voice_provider,

      public_url: result.public_url ?? result.tts_audio_url,

      message: result.message,

    },

    { headers: ttsResponseHeaders() }

  );

}

