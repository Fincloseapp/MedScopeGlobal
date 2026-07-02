import { NextResponse } from "next/server";

import { generateVoice } from "@/lib/v40/ai/voice-openai";

import { ttsResponseHeaders } from "@/lib/v41/ai/tts-engine";



export const dynamic = "force-dynamic";

export const maxDuration = 120;



export async function OPTIONS() {

  return new NextResponse(null, { status: 204, headers: ttsResponseHeaders() });

}



/** Video pipeline voice-over endpoint — OpenAI TTS via generateVoice */

export async function POST(request: Request) {

  let body: {

    script?: string;

    title?: string;

    storyboard?: Array<{ scene: number; visual: string; narration: string }>;

  } = {};

  try {

    body = await request.json();

  } catch {

    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: ttsResponseHeaders() });

  }



  const script = body.script?.trim()?.slice(0, 4096);

  if (!script) {

    return NextResponse.json({ error: "script required" }, { status: 400, headers: ttsResponseHeaders() });

  }



  const voice = await generateVoice({

    script,

    title: body.title ?? "video-voice",

    storyboard: body.storyboard,

  });



  return NextResponse.json(

    {

      ok: voice.status === "ready",

      voice_provider: voice.voice_provider,

      tts_audio_url: voice.tts_audio_url ?? voice.public_url,

      public_url: voice.public_url,

      lesson_format: voice.metadata_patch?.lesson_format ?? voice.lesson_format,

      subtitles_ready: Boolean(script),

      message: voice.message,

      metadata: voice.metadata_patch,

    },

    { headers: ttsResponseHeaders() }

  );

}

