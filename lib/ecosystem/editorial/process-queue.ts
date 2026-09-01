/** Consume editorial_queue: AI journalists ingest + rewrite, AI editors review. */

import { CONTENT_GUARDRAILS } from "@/lib/ecosystem/autonomous";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { allCompliancePassed, runComplianceChecks } from "@/lib/ecosystem/editorial/compliance";
import { getJournalistForTopic, getReviewPipeline } from "@/lib/ecosystem/editorial/personas";
import type { EditorialTopic } from "@/lib/ecosystem/editorial/desks";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { runV26ForeignNewsIngest } from "@/lib/v26/foreign-news-ingest";
import { processEditorialImageBatch } from "@/lib/ecosystem/editorial/images";

export type ProcessEditorialQueueResult = {
  ok: true;
  task: "editorial-process";
  status: "completed" | "partial" | "skipped";
  jobsClaimed: number;
  jobsPublished: number;
  jobsFailed: number;
  created: number;
  skipped: number;
  ingestErrors: string[];
  imagesSuggested?: number;
  imagesApplied?: number;
  note: string;
  timestamp: string;
};

type QueueJob = {
  id: string;
  desk_id: string | null;
  locale: string | null;
  topic: string | null;
  status: string | null;
  task_type: string | null;
  journalist_persona_id: string | null;
  editor_persona_id: string | null;
  metadata: Record<string, unknown> | null;
};

function asTopic(value: string | null | undefined): EditorialTopic {
  if (value === "longevity" || value === "lifestyle" || value === "seniors" || value === "trending") {
    return value;
  }
  return "longevity";
}

function asLocale(value: string | null | undefined): GlobalLocaleCode {
  return (value || "cs") as GlobalLocaleCode;
}

function prefersLongevityTopic(topic: EditorialTopic): boolean {
  return topic === "longevity" || topic === "seniors";
}

async function refreshEditorialCovers(): Promise<{ suggested: number; applied: number }> {
  try {
    const batch = await processEditorialImageBatch({ limit: 4, apply: true, dryRun: false });
    return { suggested: batch.result.suggested, applied: batch.result.applied };
  } catch (err) {
    console.warn(
      "[editorial-process] image refresh:",
      err instanceof Error ? err.message : "image batch failed"
    );
    return { suggested: 0, applied: 0 };
  }
}

/**
 * Advance queued article/generate jobs:
 * 1. claim 1–2 jobs
 * 2. RSS web-source ingest + Czech journalistic rewrite
 * 3. AI editor / compliance metadata
 * 4. mark published or failed
 *
 * If the queue is empty, still run a small longevity-biased ingest so Aktuality stays fresh.
 */
export async function processEditorialQueue(options?: {
  maxJobs?: number;
  maxArticles?: number;
}): Promise<ProcessEditorialQueueResult> {
  const maxJobs = Math.min(options?.maxJobs ?? 2, 2);
  const maxArticles = Math.min(options?.maxArticles ?? 2, 3);
  const admin = tryCreateServiceRoleClient();
  const timestamp = new Date().toISOString();

  if (!admin) {
    return {
      ok: true,
      task: "editorial-process",
      status: "skipped",
      jobsClaimed: 0,
      jobsPublished: 0,
      jobsFailed: 0,
      created: 0,
      skipped: 0,
      ingestErrors: [],
      note: "No service role — set SUPABASE_SERVICE_ROLE_KEY to process the queue",
      timestamp,
    };
  }

  const { data: rows, error: fetchError } = await admin
    .from("editorial_queue")
    .select(
      "id, desk_id, locale, topic, status, task_type, journalist_persona_id, editor_persona_id, metadata"
    )
    .eq("status", "queued")
    .in("task_type", ["article", "generate"])
    .order("created_at", { ascending: true })
    .limit(maxJobs);

  if (fetchError) {
    return {
      ok: true,
      task: "editorial-process",
      status: "partial",
      jobsClaimed: 0,
      jobsPublished: 0,
      jobsFailed: 0,
      created: 0,
      skipped: 0,
      ingestErrors: [fetchError.message],
      note: "Could not read editorial_queue",
      timestamp,
    };
  }

  const jobs = (rows ?? []) as QueueJob[];
  let jobsPublished = 0;
  let jobsFailed = 0;
  let created = 0;
  let skipped = 0;
  const ingestErrors: string[] = [];

  const runIngestForJob = async (job: QueueJob | null) => {
    const topic = asTopic(job?.topic);
    const locale = asLocale(job?.locale);
    const journalist =
      job?.journalist_persona_id ?? getJournalistForTopic(locale, topic)?.id ?? "journalist-longevity-cz";
    const editor =
      job?.editor_persona_id ??
      getReviewPipeline(locale).find((persona) => persona.role === "editor")?.id ??
      "editor-chief-cz";

    const ingest = await runV26ForeignNewsIngest({
      maxArticles,
      itemsPerSource: 2,
      preferLongevity: job ? prefersLongevityTopic(topic) : true,
      journalistId: journalist,
      editorId: editor,
    });

    created += ingest.created;
    skipped += ingest.skipped;
    ingestErrors.push(...ingest.errors.slice(0, 3));

    let latestId: string | null = null;
    let latestContent = "";
    if (ingest.created > 0) {
      const { data: latest } = await admin
        .from("articles")
        .select("id, content, title")
        .eq("ai_generated", true)
        .order("ingested_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      latestId = (latest?.id as string | undefined) ?? null;
      latestContent = String(latest?.content ?? latest?.title ?? "");
    }

    const compliance = runComplianceChecks(latestContent || "konzultujte lékaře", locale);
    const passed = latestContent ? allCompliancePassed(compliance) : true;

    return { ingest, latestId, compliance, passed, journalist, editor, topic, locale };
  };

  if (jobs.length === 0) {
    const fallback = await runIngestForJob(null);
    const images = await refreshEditorialCovers();
    return {
      ok: true,
      task: "editorial-process",
      status: fallback.ingest.errors.length && fallback.ingest.created === 0 ? "partial" : "completed",
      jobsClaimed: 0,
      jobsPublished: 0,
      jobsFailed: 0,
      created,
      skipped,
      ingestErrors: ingestErrors.slice(0, 8),
      imagesSuggested: images.suggested,
      imagesApplied: images.applied,
      note: `Queue empty — longevity-biased ingest created ${fallback.ingest.created}; image curator suggested ${images.suggested}`,
      timestamp,
    };
  }

  for (const job of jobs) {
    const { error: claimError } = await admin
      .from("editorial_queue")
      .update({
        status: "writing",
        metadata: {
          ...(job.metadata ?? {}),
          claimed_at: new Date().toISOString(),
          pipeline: "editorial-process",
        },
      })
      .eq("id", job.id)
      .eq("status", "queued");

    if (claimError) {
      jobsFailed += 1;
      ingestErrors.push(`${job.id}: ${claimError.message}`);
      continue;
    }

    try {
      const result = await runIngestForJob(job);
      const nextStatus = result.ingest.created > 0 || result.ingest.errors.length === 0 ? "published" : "failed";
      if (nextStatus === "published") jobsPublished += 1;
      else jobsFailed += 1;

      await admin
        .from("editorial_queue")
        .update({
          status: nextStatus,
          article_id: result.latestId,
          compliance_passed: result.passed,
          metadata: {
            ...(job.metadata ?? {}),
            pipeline: "editorial-process",
            journalist_id: result.journalist,
            editor_id: result.editor,
            require_editorial_review: CONTENT_GUARDRAILS.requireEditorialReview,
            ingest_created: result.ingest.created,
            ingest_skipped: result.ingest.skipped,
            ingest_errors: result.ingest.errors.slice(0, 5),
            compliance: result.compliance,
            processed_at: new Date().toISOString(),
          },
        })
        .eq("id", job.id);
    } catch (err) {
      jobsFailed += 1;
      const message = err instanceof Error ? err.message : "process failed";
      ingestErrors.push(`${job.id}: ${message}`);
      await admin
        .from("editorial_queue")
        .update({
          status: "failed",
          metadata: {
            ...(job.metadata ?? {}),
            pipeline: "editorial-process",
            error: message,
            processed_at: new Date().toISOString(),
          },
        })
        .eq("id", job.id);
    }
  }

  const images = await refreshEditorialCovers();

  return {
    ok: true,
    task: "editorial-process",
    status: jobsFailed > 0 && jobsPublished === 0 ? "partial" : "completed",
    jobsClaimed: jobs.length,
    jobsPublished,
    jobsFailed,
    created,
    skipped,
    ingestErrors: ingestErrors.slice(0, 8),
    imagesSuggested: images.suggested,
    imagesApplied: images.applied,
    note: `Processed ${jobs.length} desk job(s); ingested ${created}; image curator applied ${images.applied}`,
    timestamp,
  };
}
