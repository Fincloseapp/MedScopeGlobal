/** Autonomous editorial ("redakce") ecosystem — desks, personas, syndication, compliance */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { CONTENT_GUARDRAILS } from "@/lib/ecosystem/autonomous";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import {
  EDITORIAL_DESKS,
  getDeskForLocale,
  getPrimaryDesks,
  pickTopicForDesk,
  type EditorialTopic,
} from "./desks";
import { getJournalistForTopic, getReviewPipeline } from "./personas";
import {
  buildSyndicationMetadata,
  getSyndicationTargets,
  type SyndicationCandidate,
  type SyndicationMode,
} from "./syndication";

export * from "./desks";
export * from "./personas";
export * from "./syndication";
export * from "./compliance";
export * from "./images";

export type EditorialQueueItem = {
  id: string;
  deskId: string;
  locale: string;
  topic: string;
  status: "queued" | "writing" | "reviewing" | "compliance" | "published" | "failed";
  journalistPersonaId?: string;
  taskType?:
    | "article"
    | "image"
    | "syndication"
    | "generate"
    | "translate"
    | "seo"
    | "ads"
    | "vip"
    | "affiliate"
    | "donation";
  createdAt: string;
};

/** Scaffold editorial queue item for autonomous cron */
export function createEditorialQueueItem(
  deskId: string,
  locale: string,
  topic: string,
  journalistPersonaId?: string,
  taskType: EditorialQueueItem["taskType"] = "article"
): EditorialQueueItem {
  return {
    id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    deskId,
    locale,
    topic,
    status: "queued",
    journalistPersonaId,
    taskType,
    createdAt: new Date().toISOString(),
  };
}

async function insertQueueRow(row: {
  desk_id: string;
  locale: string;
  topic: string;
  status: string;
  task_type?: string;
  journalist_persona_id?: string | null;
  editor_persona_id?: string | null;
  article_id?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return false;
  const { error } = await admin.from("editorial_queue").insert(row);
  if (error) {
    console.warn("[editorial-queue] insert:", error.message);
    return false;
  }
  return true;
}

/** Daily editorial queue cron — primary desks (high-value locales) */
export async function runEditorialQueueCron(): Promise<{
  ok: true;
  task: "editorial-queue";
  status: "queued";
  items: number;
  desksTotal: number;
  queued: EditorialQueueItem[];
  persisted: number;
  timestamp: string;
}> {
  const desks = getPrimaryDesks();
  const queued: EditorialQueueItem[] = [];
  let persisted = 0;

  for (const desk of desks) {
    const topic = pickTopicForDesk(desk) as EditorialTopic;
    const journalist = getJournalistForTopic(desk.locale, topic);
    const reviewers = getReviewPipeline(desk.locale);
    const item = createEditorialQueueItem(desk.id, desk.locale, topic, journalist?.id, "article");
    queued.push(item);

    const ok = await insertQueueRow({
      desk_id: desk.id,
      locale: desk.locale,
      topic,
      status: "queued",
      task_type: "article",
      journalist_persona_id: journalist?.id ?? null,
      editor_persona_id: reviewers.find((r) => r.role === "editor")?.id ?? null,
      metadata: {
        queue_ref: item.id,
        review_pipeline: reviewers.map((r) => ({ id: r.id, role: r.role })),
        vip_cta_weight: desk.vipCtaWeight,
      },
    });
    if (ok) persisted += 1;
  }

  return {
    ok: true,
    task: "editorial-queue",
    status: "queued",
    items: queued.length,
    desksTotal: EDITORIAL_DESKS.length,
    queued,
    persisted,
    timestamp: new Date().toISOString(),
  };
}

/**
 * generate-articles — enqueue generation work + point at legacy public-articles cron.
 * Does not invoke LLM writers directly (avoids double-run / secret dependency);
 * production generation stays on /api/cron/public-articles.
 */
export async function runGenerateArticlesCron(): Promise<{
  ok: true;
  task: "generate-articles";
  status: "queued";
  items: number;
  queued: EditorialQueueItem[];
  persisted: number;
  legacyCronEndpoint: string;
  maxArticlesPerDay: number;
  timestamp: string;
}> {
  const desks = getPrimaryDesks();
  const queued: EditorialQueueItem[] = [];
  let persisted = 0;
  let remaining = CONTENT_GUARDRAILS.maxArticlesPerDay;

  for (const desk of desks) {
    if (remaining <= 0) break;
    const topic = pickTopicForDesk(desk) as EditorialTopic;
    const journalist = getJournalistForTopic(desk.locale, topic);
    const reviewers = getReviewPipeline(desk.locale);
    const item = createEditorialQueueItem(desk.id, desk.locale, topic, journalist?.id, "generate");
    queued.push(item);

    const ok = await insertQueueRow({
      desk_id: desk.id,
      locale: desk.locale,
      topic,
      status: "queued",
      task_type: "article",
      journalist_persona_id: journalist?.id ?? null,
      editor_persona_id: reviewers.find((r) => r.role === "editor")?.id ?? null,
      metadata: {
        queue_ref: item.id,
        pipeline: "generate-articles",
        require_editorial_review: CONTENT_GUARDRAILS.requireEditorialReview,
        legacy_cron: "/api/cron/public-articles",
        review_pipeline: reviewers.map((r) => ({ id: r.id, role: r.role })),
      },
    });
    if (ok) persisted += 1;
    remaining -= 1;
  }

  return {
    ok: true,
    task: "generate-articles",
    status: "queued",
    items: queued.length,
    queued,
    persisted,
    legacyCronEndpoint: "/api/cron/public-articles",
    maxArticlesPerDay: CONTENT_GUARDRAILS.maxArticlesPerDay,
    timestamp: new Date().toISOString(),
  };
}

type HubArticleRow = {
  id: string;
  slug: string;
  locale: string | null;
  title?: string | null;
  published_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

/**
 * syndicate-articles — select recent hub articles and enqueue syndication candidates.
 * Writes article_syndications (pending) + editorial_queue (task_type=syndication).
 * Adaptation/LLM translation remains a future step when AI keys are present.
 */
export async function runSyndicateArticlesCron(options?: {
  limitPerHub?: number;
}): Promise<{
  ok: true;
  task: "syndicate-articles";
  status: "queued";
  candidates: number;
  persistedSyndications: number;
  persistedQueue: number;
  plan: Array<{ source: GlobalLocaleCode; targets: GlobalLocaleCode[]; mode: SyndicationMode }>;
  sample: SyndicationCandidate[];
  timestamp: string;
  note: string;
}> {
  const limitPerHub = options?.limitPerHub ?? 3;
  const hubs: GlobalLocaleCode[] = ["cs", "en-US", "en", "de"];

  const plan: Array<{
    source: GlobalLocaleCode;
    targets: GlobalLocaleCode[];
    mode: SyndicationMode;
  }> = [];
  for (const source of hubs) {
    for (const rule of getSyndicationTargets(source)) {
      plan.push({ source, targets: rule.targetLocales, mode: rule.mode });
    }
  }

  const candidates: SyndicationCandidate[] = [];
  let persistedSyndications = 0;
  let persistedQueue = 0;
  const admin = tryCreateServiceRoleClient();

  if (admin) {
    for (const source of hubs) {
      const rules = getSyndicationTargets(source);
      if (rules.length === 0) continue;

      const maxAge = Math.max(...rules.map((r) => r.maxAgeDays ?? 14));
      const since = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await admin
        .from("articles")
        .select("id, slug, locale, title, published_at, metadata")
        .eq("published", true)
        .eq("locale", source)
        .gte("published_at", since)
        .order("published_at", { ascending: false })
        .limit(limitPerHub);

      if (error) {
        console.warn("[syndicate-articles] fetch:", source, error.message);
        continue;
      }

      let rows = (data ?? []) as HubArticleRow[];
      if (rows.length === 0 && source === "cs") {
        const { data: fallback } = await admin
          .from("articles")
          .select("id, slug, locale, title, published_at, metadata")
          .eq("published", true)
          .order("published_at", { ascending: false })
          .limit(limitPerHub);
        rows = ((fallback ?? []) as HubArticleRow[]).filter(
          (a) => !a.locale || a.locale === "cs" || a.locale.startsWith("cs")
        );
      }

      for (const article of rows) {
        for (const rule of rules) {
          for (const targetLocale of rule.targetLocales) {
            if (targetLocale === source) continue;
            const candidate: SyndicationCandidate = {
              sourceArticleId: article.id,
              sourceSlug: article.slug,
              sourceLocale: source,
              targetLocale,
              mode: rule.mode,
              sourceAuthorUnitId:
                typeof article.metadata?.editorial_unit_primary === "string"
                  ? article.metadata.editorial_unit_primary
                  : undefined,
            };
            candidates.push(candidate);

            const meta = buildSyndicationMetadata(candidate);
            const { error: synErr } = await admin.from("article_syndications").upsert(
              {
                source_article_id: article.id,
                source_slug: article.slug,
                source_locale: source,
                target_locale: targetLocale,
                syndication_mode: rule.mode,
                status: "pending",
                source_author_unit: candidate.sourceAuthorUnitId ?? null,
                metadata: {
                  ...meta,
                  requires_compliance_review: rule.requiresComplianceReview,
                  preserve_author_attribution: rule.preserveAuthorAttribution,
                },
              },
              { onConflict: "source_article_id,target_locale" }
            );
            if (synErr) {
              console.warn("[syndicate-articles] upsert:", synErr.message);
            } else {
              persistedSyndications += 1;
            }

            const desk = getDeskForLocale(targetLocale);
            const queueOk = await insertQueueRow({
              desk_id: desk.id,
              locale: targetLocale,
              topic: "trending",
              status: "queued",
              task_type: "syndication",
              article_id: article.id,
              metadata: {
                ...meta,
                source_slug: article.slug,
                pipeline: "syndicate-articles",
              },
            });
            if (queueOk) persistedQueue += 1;
          }
        }
      }
    }
  }

  return {
    ok: true,
    task: "syndicate-articles",
    status: "queued",
    candidates: candidates.length,
    persistedSyndications,
    persistedQueue,
    plan,
    sample: candidates.slice(0, 8),
    timestamp: new Date().toISOString(),
    note:
      admin == null
        ? "No service role — plan only; set SUPABASE_SERVICE_ROLE_KEY to persist"
        : "Pending syndications queued; LLM adaptation not run (no rewrite in this step)",
  };
}

type AuxiliaryEditorialTask =
  | "translate-content"
  | "seo-optimize"
  | "place-ads"
  | "generate-vip-content"
  | "generate-affiliate-boxes"
  | "generate-donation-cta";

const AUX_TASK_TYPE: Record<AuxiliaryEditorialTask, NonNullable<EditorialQueueItem["taskType"]>> = {
  "translate-content": "translate",
  "seo-optimize": "seo",
  "place-ads": "ads",
  "generate-vip-content": "vip",
  "generate-affiliate-boxes": "affiliate",
  "generate-donation-cta": "donation",
};

/**
 * Enqueue auxiliary autonomous tasks (translate / SEO / ads / VIP / affiliate / donation)
 * into editorial_queue when the service role is available. LLM/ad execution remains a
 * follow-up step — this replaces empty "queued" stubs with persisted work items.
 */
export async function runAuxiliaryEditorialCron(
  task: AuxiliaryEditorialTask,
  options?: { limit?: number }
): Promise<{
  ok: true;
  task: AuxiliaryEditorialTask;
  status: "queued";
  items: number;
  queued: EditorialQueueItem[];
  persisted: number;
  timestamp: string;
  note: string;
}> {
  const limit = options?.limit ?? getPrimaryDesks().length;
  const desks = getPrimaryDesks().slice(0, limit);
  const queued: EditorialQueueItem[] = [];
  let persisted = 0;
  const taskType = AUX_TASK_TYPE[task];
  const admin = tryCreateServiceRoleClient();

  for (const desk of desks) {
    const topic = pickTopicForDesk(desk) as EditorialTopic;
    const journalist = getJournalistForTopic(desk.locale, topic);
    const reviewers = getReviewPipeline(desk.locale);
    const item = createEditorialQueueItem(desk.id, desk.locale, topic, journalist?.id, taskType);
    queued.push(item);

    const ok = await insertQueueRow({
      desk_id: desk.id,
      locale: desk.locale,
      topic,
      status: "queued",
      task_type: taskType,
      journalist_persona_id: journalist?.id ?? null,
      editor_persona_id: reviewers.find((r) => r.role === "editor")?.id ?? null,
      metadata: {
        queue_ref: item.id,
        pipeline: task,
        require_editorial_review: CONTENT_GUARDRAILS.requireEditorialReview,
        review_pipeline: reviewers.map((r) => ({ id: r.id, role: r.role })),
      },
    });
    if (ok) persisted += 1;
  }

  return {
    ok: true,
    task,
    status: "queued",
    items: queued.length,
    queued,
    persisted,
    timestamp: new Date().toISOString(),
    note:
      admin == null
        ? "No service role — in-memory queue only; set SUPABASE_SERVICE_ROLE_KEY to persist"
        : `Persisted ${persisted}/${queued.length} ${task} jobs to editorial_queue (execution deferred)`,
  };
}

/**
 * add-images — enqueue image tasks for primary desks + run curated suggestion batch
 * when service role is present (dry-run suggestions by default; apply via images endpoint).
 */
export async function runAddImagesCron(options?: {
  limit?: number;
  apply?: boolean;
  dryRun?: boolean;
}): Promise<{
  ok: true;
  task: "add-images";
  status: "queued" | "completed" | "partial";
  items: number;
  queued: EditorialQueueItem[];
  persisted: number;
  imageCandidates: number;
  imageSuggestions: number;
  timestamp: string;
  note: string;
}> {
  const { processEditorialImageBatch } = await import("./images");
  const desks = getPrimaryDesks();
  const queued: EditorialQueueItem[] = [];
  let persisted = 0;

  for (const desk of desks) {
    const topic = pickTopicForDesk(desk) as EditorialTopic;
    const item = createEditorialQueueItem(desk.id, desk.locale, topic, "image-curator-global", "image");
    queued.push(item);
    const ok = await insertQueueRow({
      desk_id: desk.id,
      locale: desk.locale,
      topic,
      status: "queued",
      task_type: "image",
      journalist_persona_id: "image-curator-global",
      metadata: {
        queue_ref: item.id,
        pipeline: "add-images",
        legacy_endpoint: "/api/ecosystem/editorial/images",
      },
    });
    if (ok) persisted += 1;
  }

  const batch = await processEditorialImageBatch({
    limit: options?.limit ?? 10,
    apply: options?.apply ?? false,
    dryRun: options?.dryRun ?? true,
  });

  const admin = tryCreateServiceRoleClient();
  return {
    ok: true,
    task: "add-images",
    status: batch.result.failures.length ? "partial" : "completed",
    items: queued.length,
    queued,
    persisted,
    imageCandidates: batch.candidates.length,
    imageSuggestions: batch.suggestions.length,
    timestamp: new Date().toISOString(),
    note:
      admin == null
        ? "No service role — queue + suggestions in-memory only"
        : `Queued ${persisted} image jobs; ${batch.suggestions.length} suggestions from batch`,
  };
}
