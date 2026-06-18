import { NextResponse } from "next/server";
import {
  isAllowedStreamUrl,
  pickStreamResponseHeaders,
} from "@/lib/v34/video-engine/stream-proxy";

export const dynamic = "force-dynamic";

/** Same-origin video proxy with Range passthrough for Supabase / fallback CDNs */
export async function GET(request: Request) {
  const urlParam = new URL(request.url).searchParams.get("url")?.trim();
  if (!urlParam || !isAllowedStreamUrl(urlParam)) {
    return NextResponse.json({ error: "Invalid or disallowed video URL" }, { status: 400 });
  }

  const range = request.headers.get("range");
  const upstreamHeaders: Record<string, string> = {};
  if (range) upstreamHeaders.Range = range;

  try {
    const upstream = await fetch(urlParam, {
      headers: upstreamHeaders,
      signal: AbortSignal.timeout(60_000),
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: `Upstream video HTTP ${upstream.status}` },
        { status: upstream.status >= 500 ? 502 : upstream.status }
      );
    }

    const headers = pickStreamResponseHeaders(upstream.headers);
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stream proxy failed" },
      { status: 502 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type",
    },
  });
}
