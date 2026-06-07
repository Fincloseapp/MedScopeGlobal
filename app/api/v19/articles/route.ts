import { NextResponse } from "next/server";
import {
  getV19Articles,
  getV19JobResult,
  runV19GenerateBatch,
  startV19AsyncJob,
} from "@/lib/v19/engine";
import { resolveV19LocaleFromRequest } from "@/lib/v19/localize";
import { checkV19GenerateRateLimit, checkV19ListRateLimit } from "@/lib/v19/rate-limit";
import { getV19MonitoringSnapshot } from "@/lib/v19/monitoring";

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
      job,
    });
  }

  if (url.searchParams.get("monitoring") === "1") {
    return NextResponse.json(getV19MonitoringSnapshot());
  }

  const locale = await resolveV19LocaleFromRequest(url.searchParams.get("locale"));
  const limit = Math.min(30, Number(url.searchParams.get("limit") ?? 20));
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
  const articles = await getV19Articles(locale, limit, offset);

  return NextResponse.json({
    status: "ok",
    engine: "v19",
    locale,
    count: articles.length,
    articles,
    monitoring: getV19MonitoringSnapshot().metrics,
  });
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

  let body: { count?: number; locale?: string; async?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const locale = await resolveV19LocaleFromRequest(body.locale);
  const count = body.count;

  if (body.async) {
    const { jobId } = await startV19AsyncJob({ count, locale, ip });
    return NextResponse.json({
      status: "ok",
      engine: "v19",
      jobId,
      message: "Poll GET /api/v19/articles?jobId=...",
    });
  }

  try {
    const result = await runV19GenerateBatch({ count, locale });
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
