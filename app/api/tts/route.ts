import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "web_speech",
    message: "Use client Web Speech API",
  });
}

/** Server TTS disabled — returns 200 immediately (unblocks video engine). */
export async function POST() {
  return new Response(null, { status: 200 });
}
