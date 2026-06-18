import { NextResponse } from "next/server";
import { getQueryCacheStats } from "@/lib/v31/performance/query-cache";
import { V31_CACHE_TAGS } from "@/lib/v31/performance/cache";
import { V31_UI_VERSION } from "@/lib/v31/version";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const INDEX_COUNT = 4;

export async function GET() {
  const t0 = Date.now();
  const cache = getQueryCacheStats();

  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V31_UI_VERSION,
    service: "medscope-v31-performance",
    latencyMs: Date.now() - t0,
    cache: {
      queryCache: cache,
      tags: V31_CACHE_TAGS,
      images: { formats: ["avif", "webp"], compress: true },
    },
    indexes: {
      count: INDEX_COUNT,
      tables: ["courses.slug", "lessons.course_id", "video_assets.status", "public_health_videos.published_at"],
    },
    compat: {
      v30: "/api/v30/health",
      v32: "/api/v32/health",
    },
    generatedAt: new Date().toISOString(),
  });
}
