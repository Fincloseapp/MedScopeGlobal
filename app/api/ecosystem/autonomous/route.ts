import { NextResponse } from "next/server";
import { verifyCronAuth, AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";
import { resetMediFlowSupplementsDaily } from "@/lib/mediflow/store";
import {
  getImageCuratorForLocale,
} from "@/lib/ecosystem/editorial/personas";
import { runEditorialQueueCron } from "@/lib/ecosystem/editorial";
import { getSyndicationTargets } from "@/lib/ecosystem/editorial/syndication";
import {
  processEditorialImageBatch,
  IMAGE_CURATOR_PERSONA_ID,
} from "@/lib/ecosystem/editorial/images";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

/** Autonomous task runner — triggered by cron or manual admin invoke */
export async function POST(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { task?: string };
  const task = body.task ?? "seo-optimize";

  const schedule = AUTONOMOUS_SCHEDULE[task as keyof typeof AUTONOMOUS_SCHEDULE];
  if (!schedule) {
    return NextResponse.json({ error: `Unknown task: ${task}` }, { status: 400 });
  }

  // MediFlow ecosystem — delegates to same logic as GET /api/cron/ecosystem-mediflow
  if (task === "mediflow-daily-reset") {
    try {
      const reset = await resetMediFlowSupplementsDaily();
      return NextResponse.json({
        task,
        status: "completed",
        description: schedule.description,
        cronEndpoint: "/api/cron/ecosystem-mediflow",
        ...reset,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "MediFlow reset failed";
      return NextResponse.json({ task, status: "error", error: message }, { status: 500 });
    }
  }

  // Editorial queue — scaffold autonomous redakce pipeline
  if (task === "editorial-queue") {
    const result = await runEditorialQueueCron();
    return NextResponse.json({
      task,
      status: result.status,
      description: schedule.description,
      items: result.items,
      queued: result.queued,
      timestamp: result.timestamp,
    });
  }

  if (task === "editorial-images") {
    const curator = getImageCuratorForLocale("cs");
    const bodyExt = body as { limit?: number; apply?: boolean; dryRun?: boolean };
    const { result, suggestions, candidates } = await processEditorialImageBatch({
      limit: bodyExt.limit ?? 10,
      apply: bodyExt.apply ?? false,
      dryRun: bodyExt.dryRun ?? false,
    });

    const admin = tryCreateServiceRoleClient();
    if (admin && suggestions.length > 0) {
      for (const s of suggestions.slice(0, 5)) {
        const { error } = await admin.from("editorial_queue").insert({
          desk_id: "desk-cz",
          locale: "cs",
          topic: s.topic,
          status: s.compliancePassed ? "compliance" : "reviewing",
          task_type: "image",
          journalist_persona_id: curator?.id ?? IMAGE_CURATOR_PERSONA_ID,
          compliance_passed: s.compliancePassed,
          metadata: {
            article_slug: s.articleSlug,
            suggested_url: s.suggestedUrl,
            alt_text_cs: s.altTextCs,
          },
        });
        if (error) console.warn("[editorial-images] queue insert:", error.message);
      }
    }

    return NextResponse.json({
      task,
      status: result.failures.length ? "partial" : "completed",
      description: schedule.description,
      personaId: curator?.id ?? IMAGE_CURATOR_PERSONA_ID,
      candidates: candidates.length,
      result,
      suggestions: suggestions.map((s) => ({
        slug: s.articleSlug,
        topic: s.topic,
        compliancePassed: s.compliancePassed,
      })),
      cronEndpoint: "/api/ecosystem/editorial/images",
      timestamp: new Date().toISOString(),
    });
  }

  if (task === "syndicate-articles") {
    const hubLocales: GlobalLocaleCode[] = ["cs", "en-US"];
    const syndicationPlan: Array<{ source: GlobalLocaleCode; targets: string[] }> = [];

    for (const source of hubLocales) {
      const rules = getSyndicationTargets(source);
      syndicationPlan.push({
        source,
        targets: rules.flatMap((r) => r.targetLocales),
      });
    }

    return NextResponse.json({
      task,
      status: "queued",
      description: schedule.description,
      syndicationPlan,
      timestamp: new Date().toISOString(),
    });
  }

  // Other tasks — queued for existing ingestion/editorial pipelines
  const result = {
    task,
    status: "queued",
    description: schedule.description,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json({
    tasks: Object.entries(AUTONOMOUS_SCHEDULE).map(([id, config]) => ({
      id,
      ...config,
      cronEndpoint:
        id === "mediflow-daily-reset"
          ? "/api/cron/ecosystem-mediflow"
          : id === "editorial-queue"
            ? "/api/cron/ecosystem-editorial-queue"
          : id === "editorial-images"
            ? "/api/ecosystem/editorial/images"
            : undefined,
    })),
  });
}
