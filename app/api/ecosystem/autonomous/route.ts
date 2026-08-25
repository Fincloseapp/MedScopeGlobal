import { NextResponse } from "next/server";
import { verifyCronAuth, AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";
import { resetMediFlowSupplementsDaily } from "@/lib/mediflow/store";
import {
  getDeskForLocale,
  pickTopicForDesk,
  type EditorialTopic,
} from "@/lib/ecosystem/editorial/desks";
import {
  getJournalistForTopic,
  getReviewPipeline,
} from "@/lib/ecosystem/editorial/personas";
import {
  createEditorialQueueItem,
  type EditorialQueueItem,
} from "@/lib/ecosystem/editorial";
import { getSyndicationTargets } from "@/lib/ecosystem/editorial/syndication";
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
    const locales: GlobalLocaleCode[] = ["cs", "sk", "en-US", "de"];
    const queued: EditorialQueueItem[] = [];

    for (const locale of locales) {
      const desk = getDeskForLocale(locale);
      const topic = pickTopicForDesk(desk) as EditorialTopic;
      const journalist = getJournalistForTopic(locale, topic);
      const reviewers = getReviewPipeline(locale);
      const item = createEditorialQueueItem(
        desk.id,
        locale,
        topic,
        journalist?.id
      );
      queued.push(item);

      const admin = tryCreateServiceRoleClient();
      if (admin) {
        const { error } = await admin.from("editorial_queue").insert({
          desk_id: desk.id,
          locale,
          topic,
          status: "queued",
          journalist_persona_id: journalist?.id ?? null,
          editor_persona_id: reviewers.find((r) => r.role === "editor")?.id ?? null,
          metadata: {
            queue_ref: item.id,
            review_pipeline: reviewers.map((r) => ({ id: r.id, role: r.role })),
            vip_cta_weight: desk.vipCtaWeight,
          },
        });
        if (error) console.warn("[editorial-queue] insert:", error.message);
      }
    }

    return NextResponse.json({
      task,
      status: "queued",
      description: schedule.description,
      items: queued.length,
      queued,
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
      cronEndpoint: id === "mediflow-daily-reset" ? "/api/cron/ecosystem-mediflow" : undefined,
    })),
  });
}
