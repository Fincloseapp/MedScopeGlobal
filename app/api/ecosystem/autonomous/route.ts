import { NextResponse } from "next/server";
import { verifyCronAuth, AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";
import { resetMediFlowSupplementsDaily } from "@/lib/mediflow/store";
import {
  getImageCuratorForLocale,
} from "@/lib/ecosystem/editorial/personas";
import {
  processEditorialQueue,
  runAddImagesCron,
  runAuxiliaryEditorialCron,
  runEditorialQueueCron,
  runGenerateArticlesCron,
  runSyndicateArticlesCron,
} from "@/lib/ecosystem/editorial";
import {
  processEditorialImageBatch,
  IMAGE_CURATOR_PERSONA_ID,
} from "@/lib/ecosystem/editorial/images";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

type AuxiliaryTask =
  | "translate-content"
  | "seo-optimize"
  | "place-ads"
  | "generate-vip-content"
  | "generate-affiliate-boxes"
  | "generate-donation-cta";

const AUXILIARY_TASKS: ReadonlySet<string> = new Set<AuxiliaryTask>([
  "translate-content",
  "seo-optimize",
  "place-ads",
  "generate-vip-content",
  "generate-affiliate-boxes",
  "generate-donation-cta",
]);

/** Autonomous task runner — triggered by cron or manual admin invoke */
export async function POST(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    task?: string;
    limit?: number;
    apply?: boolean;
    dryRun?: boolean;
  };
  const task = body.task ?? "seo-optimize";

  const schedule = AUTONOMOUS_SCHEDULE[task as keyof typeof AUTONOMOUS_SCHEDULE];
  if (!schedule) {
    return NextResponse.json({ error: `Unknown task: ${task}` }, { status: 400 });
  }

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

  if (task === "editorial-queue") {
    const result = await runEditorialQueueCron();
    return NextResponse.json({
      task,
      status: result.status,
      description: schedule.description,
      items: result.items,
      desksTotal: result.desksTotal,
      queued: result.queued,
      persisted: result.persisted,
      cronEndpoint: "/api/cron/ecosystem-editorial-queue",
      timestamp: result.timestamp,
    });
  }

  if (task === "editorial-process") {
    const result = await processEditorialQueue({
      maxJobs: body.limit ?? 2,
      maxArticles: 2,
    });
    return NextResponse.json({
      task,
      status: result.status,
      description: schedule.description,
      jobsClaimed: result.jobsClaimed,
      jobsPublished: result.jobsPublished,
      jobsFailed: result.jobsFailed,
      created: result.created,
      skipped: result.skipped,
      ingestErrors: result.ingestErrors,
      note: result.note,
      cronEndpoint: "/api/cron/ecosystem-editorial-process",
      timestamp: result.timestamp,
    });
  }

  if (task === "generate-articles") {
    const result = await runGenerateArticlesCron();
    return NextResponse.json({
      task,
      status: result.status,
      description: schedule.description,
      items: result.items,
      queued: result.queued,
      persisted: result.persisted,
      legacyCronEndpoint: result.legacyCronEndpoint,
      cronEndpoint: "/api/cron/ecosystem-generate-articles",
      maxArticlesPerDay: result.maxArticlesPerDay,
      timestamp: result.timestamp,
    });
  }

  if (task === "syndicate-articles") {
    const result = await runSyndicateArticlesCron({
      limitPerHub: body.limit ?? 3,
    });
    return NextResponse.json({
      task,
      status: result.status,
      description: schedule.description,
      candidates: result.candidates,
      persistedSyndications: result.persistedSyndications,
      persistedQueue: result.persistedQueue,
      plan: result.plan,
      sample: result.sample,
      note: result.note,
      cronEndpoint: "/api/cron/ecosystem-syndicate",
      timestamp: result.timestamp,
    });
  }

  if (task === "editorial-images" || task === "add-images") {
    if (task === "add-images") {
      const result = await runAddImagesCron({
        limit: body.limit ?? 10,
        apply: body.apply ?? false,
        dryRun: body.dryRun ?? true,
      });
      return NextResponse.json({
        task,
        status: result.status,
        description: schedule.description,
        items: result.items,
        queued: result.queued,
        persisted: result.persisted,
        imageCandidates: result.imageCandidates,
        imageSuggestions: result.imageSuggestions,
        note: result.note,
        cronEndpoint: "/api/ecosystem/editorial/images",
        timestamp: result.timestamp,
      });
    }

    const curator = getImageCuratorForLocale("cs");
    const { result, suggestions, candidates } = await processEditorialImageBatch({
      limit: body.limit ?? 10,
      apply: body.apply ?? false,
      dryRun: body.dryRun ?? false,
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

  if (AUXILIARY_TASKS.has(task)) {
    const result = await runAuxiliaryEditorialCron(task as AuxiliaryTask, {
      limit: body.limit,
    });
    return NextResponse.json({
      task,
      status: result.status,
      description: schedule.description,
      items: result.items,
      queued: result.queued,
      persisted: result.persisted,
      note: result.note,
      timestamp: result.timestamp,
    });
  }

  // switch-locale is client-side geolocation — no queue work
  if (task === "switch-locale") {
    return NextResponse.json({
      task,
      status: "noop",
      description: schedule.description,
      note: "Client-side geolocation; no server queue",
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    task,
    status: "queued",
    description: schedule.description,
    timestamp: new Date().toISOString(),
  });
}

const CRON_ENDPOINT_BY_TASK: Partial<Record<string, string>> = {
  "mediflow-daily-reset": "/api/cron/ecosystem-mediflow",
  "editorial-queue": "/api/cron/ecosystem-editorial-queue",
  "editorial-process": "/api/cron/ecosystem-editorial-process",
  "editorial-images": "/api/ecosystem/editorial/images",
  "add-images": "/api/ecosystem/editorial/images",
  "generate-articles": "/api/cron/ecosystem-generate-articles",
  "syndicate-articles": "/api/cron/ecosystem-syndicate",
};

export async function GET() {
  return NextResponse.json({
    tasks: Object.entries(AUTONOMOUS_SCHEDULE).map(([id, config]) => ({
      id,
      ...config,
      cronEndpoint: CRON_ENDPOINT_BY_TASK[id],
      legacyCronEndpoint: id === "generate-articles" ? "/api/cron/public-articles" : undefined,
    })),
  });
}
