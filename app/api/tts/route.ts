import { NextResponse } from "next/server";
import { ttsResponseHeaders } from "@/lib/v41/ai/tts-engine";

export const dynamic = "force-dynamic";

/** Server TTS disabled — Web Speech API on client. POST returns 200 to unblock video engine. */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ttsResponseHeaders() });
}

export async function GET() {
  return new NextResponse(null, { status: 200, headers: ttsResponseHeaders() });
}

export async function POST() {
  return new NextResponse(null, { status: 200, headers: ttsResponseHeaders() });
}
