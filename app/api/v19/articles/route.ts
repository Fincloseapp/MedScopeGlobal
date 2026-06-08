import { NextResponse } from "next/server";
import {
  getV19Articles,
  getV19JobResult,
  runV19GenerateBatch,
  startV19AsyncJob,
} from "@/lib/v19/engine";
import { resolveV19LocaleFromRequest } from "@/lib/v19/localize";
import { resolveV19Mode } from "@/lib/v19/modes";
import { checkV19GenerateRateLimit, checkV19ListRateLimit } from "@/lib/v19/rate-limit";
import { getV19MonitoringSnapshot } from "@/lib/v19/monitoring";
import { enrichArticleMeta } from "@/lib/v20/content-rules";
import { V20_BACKEND_VERSION, V20_UI_VERSION } from "@/lib/v20/version";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";
import type { V19ContentMode } from "@/lib/v19/types";

export const runtime = "nodejs";
export const maxDuration = 120;

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(request: Request) {
  const ip = clientIp(request);
  const rl = await checkV19ListRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { status: "error", message: "Rate limit exceeded", retryAfter: rl.retryAfter },
      { status: 429 }
    );
  }

  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");
  if (jobId) {
    const job = await getV19JobResult(jobId);
    if (!job) {
      return NextResponse.json({ status: "error", message: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({
      status: "ok",
      engine: "v19",
      engineVersion: V19_ENGINE_VERSION,
      job,
    });
  }

  if (url.searchParams.get("monitoring") === "1") {
    return NextResponse.json(getV19MonitoringSnapshot());
  }

  if (url.searchParams.get("nzipIndex") === "1") {
    const { getNzipIndexMap } = await import("@/lib/v19/nzip-index");
    const index = getNzipIndexMap();
    return NextResponse.json({
      status: "ok",
      engineVersion: V19_ENGINE_VERSION,
      pageCount: index.pageCount,
      builtAt: index.builtAt,
      source: index.source,
    });
  }

  const locale = await resolveV19LocaleFromRequest(url.searchParams.get("locale"));
  const mode = resolveV19Mode(url.searchParams.get("mode"));
  const limit = Math.min(30, Number(url.searchParams.get("limit") ?? 20));
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
  const articles = await getV19Articles(locale, limit, offset, mode);

  const deepLink = url.searchParams.get("deepLink") === "1";

  const enriched = articles.map((a) => {
    const meta = enrichArticleMeta({
      title: a.title,
      excerpt: a.summary,
      summary: a.summary,
    });
    return {
      ...a,
      uiVersion: V20_UI_VERSION,
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      professionalSummary: meta.professionalSummary,
      ...(deepLink
        ? { nzipDeepLinking: Boolean(a.nzipRegistryId || a.nzipTopicTags?.length) }
        : {}),
    };
  });

  const res = NextResponse.json({
    status: "ok",
    engine: "v19",
    engineVersion: V19_ENGINE_VERSION,
    uiVersion: V20_UI_VERSION,
    backendVersion: V20_BACKEND_VERSION,
    locale,
    mode,
    count: enriched.length,
    articles: enriched,
    monitoring: getV19MonitoringSnapshot().metrics,
  });
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = await checkV19GenerateRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { status: "error", message: "Generation rate limit exceeded", retryAfter: rl.retryAfter },
      { status: 429 }
    );
  }

  let body: { count?: number; locale?: string; async?: boolean; mode?: V19ContentMode } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const locale = await resolveV19LocaleFromRequest(body.locale);
  const mode = resolveV19Mode(body.mode);
  const count = body.count;

  if (body.async) {
    const { jobId } = await startV19AsyncJob({ count, locale, mode, ip });
    return NextResponse.json({
      status: "ok",
      engine: "v19",
      engineVersion: V19_ENGINE_VERSION,
      mode,
      jobId,
      message: "Poll GET /api/v19/articles?jobId=...",
    });
  }

  try {
    const result = await runV19GenerateBatch({ count, locale, mode });
    return NextResponse.json({
      status: "ok",
      engine: "v19",
      ...result,
      monitoring: getV19MonitoringSnapshot().metrics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
