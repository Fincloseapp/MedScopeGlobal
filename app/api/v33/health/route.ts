import { NextResponse } from "next/server";
import { V33_UI_VERSION, V33_UI_BUILD_STAMP, V33_FALLBACK_MP4_URL } from "@/lib/v33/version";

export const dynamic = "force-dynamic";

export async function GET() {
  let videoProvider = "w3schools-fallback";
  try {
    const res = await fetch(V33_FALLBACK_MP4_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) videoProvider = "fallback-unreachable";
  } catch {
    videoProvider = "fallback-unreachable";
  }

  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V33_UI_VERSION,
    buildStamp: V33_UI_BUILD_STAMP,
    navbar: "ok",
    videoProvider,
    features: ["navbar-v33", "video-player-v33", "lesson-ui-v33", "media-src-csp"],
    compat: {
      v32: "/api/v32/health",
      v29: "/api/v29/health",
    },
    generatedAt: new Date().toISOString(),
  });
}
