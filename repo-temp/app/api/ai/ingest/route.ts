import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { runIngestionPipeline } from "@/lib/ingestion/pipeline";
import { withApiGuard } from "@/lib/security/api-guard";
import { logAiAgentUsage } from "@/lib/security/ai-abuse";
import { logSecurityEvent } from "@/lib/security/security-log";
import { getClientIp } from "@/lib/security/client-ip";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Manual ingestion trigger (admin session). */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiGuard = await withApiGuard(request, {
    userId: gate.user.id,
    action: "ai_ingest",
  });
  if (!apiGuard.ok) return apiGuard.response;

  const ip = getClientIp(request);

  const body = (await request.json().catch(() => ({}))) as {
    maxArticles?: number;
  };

  const result = await runIngestionPipeline({
    triggeredBy: `api:${gate.user.id}`,
    maxArticles: body.maxArticles ?? Number(process.env.INGEST_MAX_ARTICLES ?? 80),
  });

  await logAiAgentUsage({
    userId: gate.user.id,
    agent: "ingestion-pipeline",
    prompt: `ingest max=${body.maxArticles ?? 80}`,
    status: "ok",
  });
  await logSecurityEvent({
    ip,
    userId: gate.user.id,
    action: "ai_ingest:completed",
    status: "ok",
    details: { articlesCreated: result.created ?? 0 },
  });

  return NextResponse.json({ ok: true, ...result });
}
