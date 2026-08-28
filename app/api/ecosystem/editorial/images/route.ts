import { NextResponse } from "next/server";
import { verifyCronAuth, AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";
import {
  processEditorialImageBatch,
  getImagePipelineStatus,
  applyPendingEditorialImageSuggestions,
  IMAGE_CURATOR_PERSONA_ID,
} from "@/lib/ecosystem/editorial/images";

/** Autonomous editorial image pipeline — cron batch + status */
export async function POST(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    limit?: number;
    apply?: boolean;
    applyPending?: boolean;
    dryRun?: boolean;
  };

  const { result, suggestions, candidates } = await processEditorialImageBatch({
    limit: body.limit ?? 10,
    apply: body.apply ?? false,
    dryRun: body.dryRun ?? false,
  });

  let pendingApplied = { applied: 0, skipped: 0, failures: [] as string[] };
  if (body.applyPending === true && body.dryRun !== true) {
    pendingApplied = await applyPendingEditorialImageSuggestions({
      limit: body.limit ?? 50,
    });
  }

  const schedule = AUTONOMOUS_SCHEDULE["editorial-images"];

  return NextResponse.json({
    task: "editorial-images",
    status: result.failures.length ? "partial" : "completed",
    description: schedule?.description,
    personaId: IMAGE_CURATOR_PERSONA_ID,
    candidates: candidates.length,
    result,
    pendingApplied,
    suggestions: suggestions.map((s) => ({
      slug: s.articleSlug,
      url: s.suggestedUrl,
      topic: s.topic,
      sourceType: s.sourceType,
      compliancePassed: s.compliancePassed,
      altTextCs: s.altTextCs.slice(0, 80) + (s.altTextCs.length > 80 ? "…" : ""),
    })),
    timestamp: new Date().toISOString(),
  });
}

export async function GET() {
  const status = await getImagePipelineStatus();
  const schedule = AUTONOMOUS_SCHEDULE["editorial-images"];

  return NextResponse.json({
    task: "editorial-images",
    cron: schedule?.cron,
    description: schedule?.description,
    endpoint: "/api/ecosystem/editorial/images",
    personaId: IMAGE_CURATOR_PERSONA_ID,
    ...status,
    timestamp: new Date().toISOString(),
  });
}
