import { NextResponse } from "next/server";
import { synthesizeCzechEdgeTts, isEdgeTtsAvailable } from "@/lib/tts/edge-tts-czech";
import { naturalizeCzechForSpeech } from "@/lib/tts/naturalize-czech";
import { prepareArticleForSpeech } from "@/lib/tts/prepare-for-speech";
import { ttsResponseHeaders } from "@/lib/v41/ai/tts-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ttsResponseHeaders() });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      provider: "web_speech",
      neuralProvider: isEdgeTtsAvailable() ? "edge_tts_czech" : null,
      locale: "cs-CZ",
      defaultLang: "cs-CZ",
      voices: ["cs-CZ-VlastaNeural", "cs-CZ-AntoninNeural"],
      message: "České neuralní hlasy (Edge TTS) + Web Speech cs-CZ fallback",
    },
    { headers: ttsResponseHeaders() }
  );
}

type Body = {
  text?: string;
  script?: string;
  title?: string;
  lang?: string;
  gender?: string;
};

/** Synthesize native Czech neural speech (Vlasta / Antonín). */
export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: ttsResponseHeaders() }
    );
  }

  const raw = (body.script ?? body.text)?.trim();
  if (!raw) {
    return NextResponse.json(
      { error: "text or script required" },
      { status: 400, headers: ttsResponseHeaders() }
    );
  }

  const prepared =
    prepareArticleForSpeech(
      { title: body.title, content: raw },
      { withBroadcastIntro: false, withClosing: false }
    ) || raw;

  const spoken = naturalizeCzechForSpeech(prepared).slice(0, 3500);
  const gender = body.gender === "male" ? "male" : "female";

  try {
    if (!isEdgeTtsAvailable()) {
      throw new Error("Edge TTS unavailable in this runtime");
    }
    const audio = await synthesizeCzechEdgeTts(spoken, { gender });
    return new Response(new Uint8Array(audio), {
      status: 200,
      headers: {
        ...ttsResponseHeaders("audio/mpeg"),
        "Content-Type": "audio/mpeg",
        "X-TTS-Provider": "edge_tts_czech",
        "X-TTS-Locale": "cs-CZ",
        "X-TTS-Voice": gender === "male" ? "cs-CZ-AntoninNeural" : "cs-CZ-VlastaNeural",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Edge TTS failed";
    // Keep 200 for smoke checks; client falls back to Web Speech cs-CZ.
    return NextResponse.json(
      {
        ok: false,
        provider: "web_speech",
        locale: "cs-CZ",
        text: spoken,
        message,
      },
      { status: 200, headers: ttsResponseHeaders() }
    );
  }
}
