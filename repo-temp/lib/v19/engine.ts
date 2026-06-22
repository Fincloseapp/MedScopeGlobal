/**
 * MedScope Content Engine v19.9 — orchestrator
 */
import { writeAiAuditLog } from "@/lib/ai/audit";
import { v19CacheGet, v19CacheSet } from "@/lib/v19/cache";
import { findExistingV19Duplicates, listRecentV19Titles } from "@/lib/v19/dedup";
import { generateV19Article, pickTopicForSpecialty } from "@/lib/v19/generator";
import { recordV19Request } from "@/lib/v19/monitoring";
import { persistV19Article, listV19ArticlesFromDb } from "@/lib/v19/persist";
import { planSpecialtyBatch } from "@/lib/v19/specialties";
import { enqueueV19Job, getV19Job, updateV19Job } from "@/lib/v19/queue";
import type { V19ContentMode, V19GenerateResult, V19GeneratedArticle } from "@/lib/v19/types";
import { V19_DEFAULT_MODE } from "@/lib/v19/modes";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";

export async function runV19GenerateBatch(params: {
  count?: number;
  locale: string;
  mode?: V19ContentMode;
}): Promise<V19GenerateResult> {
  const t0 = Date.now();
  const mode = params.mode ?? V19_DEFAULT_MODE;
  const count = Math.min(10, Math.max(5, params.count ?? 7));
  const cacheKey = `v19.9:batch:${params.locale}:${mode}:${new Date().toISOString().slice(0, 10)}:${count}`;

  const cached = v19CacheGet<V19GenerateResult>(cacheKey);
  if (cached) {
    recordV19Request({ latencyMs: Date.now() - t0 });
    return { ...cached, cached: true };
  }

  const specialties = planSpecialtyBatch(count);
  const existingTitles = await listRecentV19Titles(30);
  const usedTopics = new Set<string>();
  const articles: V19GeneratedArticle[] = [];
  let skippedDuplicates = 0;

  for (const specialty of specialties) {
    const topic = pickTopicForSpecialty(specialty, usedTopics);
    if (!topic) continue;
    usedTopics.add(topic.id);

    let angleHint: string | undefined;
    let attempts = 0;

    while (attempts < 2) {
      const { article, model } = await generateV19Article({
        specialty,
        locale: params.locale,
        topic,
        existingTitles: [...existingTitles, ...articles.map((a) => a.title)],
        angleHint,
        mode,
      });

      if (!article) {
        attempts += 1;
        angleHint = "alternativní klinický úhel — edukace a prevence (NZIP kontext)";
        continue;
      }

      const dup = await findExistingV19Duplicates({
        hashDedup: article.hashDedup,
        title: article.title,
        topic: article.topic,
        sourceUrl: article.sourceUrl,
        sourceName: article.sourceName,
        keywords: article.keywords,
        scientificTerms: topic.scientificTerms,
        specialty: article.specialty,
        nzipCategory: topic.nzipCategory,
        nzipRegistryId: article.nzipRegistryId ?? (topic.isNzip ? topic.id : undefined),
        nzipGlossaryTerms: article.nzipGlossaryTerms,
        nzipRegistryRefs: article.nzipRegistryRefs,
        publicationRef: topic.publicationRef,
        sourceTier: topic.tier,
      });

      if (dup.duplicate) {
        skippedDuplicates += 1;
        angleHint = `nový úhel oproti: ${dup.existingTitle ?? "existujícímu článku"}`;
        attempts += 1;
        continue;
      }

      const saved = await persistV19Article(article);
      if (saved) {
        articles.push({ ...article, id: saved.id, slug: saved.slug });
        existingTitles.push(article.title);
      }

      await writeAiAuditLog({
        model: model ?? "v19.9-content",
        inputLength: topic.briefingHint.length,
        outputLength: article.summary.length,
        risk: "low",
        endpoint: "v19:articles",
        issues: [],
      });
      recordV19Request({
        latencyMs: Date.now() - t0,
        model,
        auditWritten: true,
      });
      break;
    }
  }

  const result: V19GenerateResult = {
    articles,
    locale: params.locale,
    mode,
    generated: articles.length,
    skippedDuplicates,
    engineVersion: V19_ENGINE_VERSION,
  };

  if (articles.length > 0) {
    v19CacheSet(cacheKey, result);
  }

  recordV19Request({ latencyMs: Date.now() - t0 });
  return result;
}

export async function getV19Articles(
  locale: string,
  limit = 20,
  offset = 0,
  mode: V19ContentMode = V19_DEFAULT_MODE
) {
  return listV19ArticlesFromDb(locale, limit, offset, mode);
}

export async function startV19AsyncJob(params: {
  count?: number;
  locale: string;
  mode?: V19ContentMode;
  ip?: string;
}): Promise<{ jobId: string }> {
  const jobId = await enqueueV19Job({
    count: params.count ?? 7,
    locale: params.locale,
    mode: params.mode ?? V19_DEFAULT_MODE,
    ip: params.ip,
  });
  void processV19Job(jobId);
  return { jobId };
}

export async function processV19Job(jobId: string) {
  const job = await getV19Job(jobId);
  if (!job || job.status !== "pending") return;

  await updateV19Job(jobId, { status: "processing" });
  try {
    const result = await runV19GenerateBatch({
      count: job.payload.count,
      locale: job.payload.locale,
      mode: job.payload.mode,
    });
    await updateV19Job(jobId, { status: "completed", result });
  } catch (error) {
    await updateV19Job(jobId, {
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    });
    recordV19Request({ latencyMs: 0, error: true });
  }
}

export async function getV19JobResult(jobId: string) {
  return getV19Job(jobId);
}
