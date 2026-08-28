/** Process editorial image suggestions — DB apply + batch runner */

import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import {
  isDeniedEditorialImageUrl,
  isMissingOrStaleHeroImage,
  validateImageCompliance,
} from "./policy";
import { matchImageForArticle, inferVisualTopic } from "./matcher";
import type {
  ArticleForImageMatch,
  ArticleImageSuggestionRecord,
  ImagePipelineBatchResult,
} from "./types";

export const IMAGE_CURATOR_PERSONA_ID = "image-curator-global";

export type ProcessImagesOptions = {
  limit?: number;
  apply?: boolean;
  dryRun?: boolean;
};

export async function findArticlesNeedingImages(
  limit = 20
): Promise<ArticleForImageMatch[]> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("articles")
    .select("id, slug, title, excerpt, content, cover_image_url, locale, metadata")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit * 3);

  if (error || !data) {
    console.warn("[editorial-images] fetch articles:", error?.message);
    return [];
  }

  return (data as ArticleForImageMatch[])
    .filter((a) => isMissingOrStaleHeroImage(a.cover_image_url))
    .slice(0, limit);
}

export async function suggestImageForArticle(
  article: ArticleForImageMatch
): Promise<ArticleImageSuggestionRecord | null> {
  const candidate = await matchImageForArticle(article);
  if (!candidate) return null;

  const visualTopic = inferVisualTopic(article);

  const compliance = validateImageCompliance({
    url: candidate.url,
    altTextCs: candidate.altTextCs,
    altTextEn: candidate.altTextEn,
    topic: candidate.topic,
    articleTitle: article.title,
    articleSlug: article.slug,
    excerpt: article.excerpt,
    visualTopic,
  });

  return {
    articleId: article.id,
    articleSlug: article.slug,
    suggestedUrl: candidate.url,
    altTextCs: candidate.altTextCs,
    altTextEn: candidate.altTextEn,
    topic: candidate.topic,
    sourceType: candidate.sourceType,
    compliancePassed: compliance.passed,
    complianceNotes: compliance.issues,
    visualTopic,
  };
}

async function persistSuggestion(
  suggestion: ArticleImageSuggestionRecord
): Promise<boolean> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return false;

  const { error } = await admin.from("article_image_suggestions").upsert(
    {
      article_id: suggestion.articleId,
      article_slug: suggestion.articleSlug,
      suggested_url: suggestion.suggestedUrl,
      alt_text_cs: suggestion.altTextCs,
      alt_text_en: suggestion.altTextEn,
      topic: suggestion.topic,
      source_type: suggestion.sourceType,
      compliance_passed: suggestion.compliancePassed,
      compliance_notes: suggestion.complianceNotes,
      metadata: { persona_id: IMAGE_CURATOR_PERSONA_ID },
    },
    { onConflict: "article_id,suggested_url" }
  );

  if (error) {
    console.warn("[editorial-images] persist suggestion:", error.message);
    return false;
  }
  return true;
}

async function applySuggestion(
  suggestion: ArticleImageSuggestionRecord
): Promise<boolean> {
  if (!suggestion.compliancePassed) return false;
  if (isDeniedEditorialImageUrl(suggestion.suggestedUrl)) return false;

  const admin = tryCreateServiceRoleClient();
  if (!admin) return false;

  const existing = await admin
    .from("articles")
    .select("metadata")
    .eq("id", suggestion.articleId)
    .maybeSingle();

  const metadata = (existing.data?.metadata as Record<string, unknown> | null) ?? {};
  const nextMetadata = {
    ...metadata,
    hero_alt_text_cs: suggestion.altTextCs,
    hero_alt_text_en: suggestion.altTextEn,
    editorial_image_topic: suggestion.topic,
    editorial_image_visual_topic: suggestion.visualTopic,
    editorial_image_source: suggestion.sourceType,
    editorial_image_applied_at: new Date().toISOString(),
  };

  const { error: articleError } = await admin
    .from("articles")
    .update({
      cover_image_url: suggestion.suggestedUrl,
      metadata: nextMetadata,
    })
    .eq("id", suggestion.articleId);

  if (articleError) {
    console.warn("[editorial-images] apply cover:", articleError.message);
    return false;
  }

  const { error: sugError } = await admin
    .from("article_image_suggestions")
    .update({ applied_at: new Date().toISOString() })
    .eq("article_id", suggestion.articleId)
    .eq("suggested_url", suggestion.suggestedUrl);

  if (sugError) {
    console.warn("[editorial-images] mark applied:", sugError.message);
  }

  return true;
}

/** Apply compliant pending rows from article_image_suggestions (re-validates current policy). */
export async function applyPendingEditorialImageSuggestions(options?: {
  limit?: number;
}): Promise<{ applied: number; skipped: number; failures: string[] }> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { applied: 0, skipped: 0, failures: ["service role unavailable"] };
  }

  const limit = options?.limit ?? 50;
  const { data, error } = await admin
    .from("article_image_suggestions")
    .select(
      "article_id, article_slug, suggested_url, alt_text_cs, alt_text_en, topic, source_type, compliance_passed, compliance_notes"
    )
    .eq("compliance_passed", true)
    .is("applied_at", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return {
      applied: 0,
      skipped: 0,
      failures: [error?.message ?? "fetch pending suggestions failed"],
    };
  }

  let applied = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const row of data) {
    const articleRes = await admin
      .from("articles")
      .select("title, excerpt, slug")
      .eq("id", row.article_id)
      .maybeSingle();

    const article = articleRes.data;
    const visualTopic = article
      ? inferVisualTopic({
          id: row.article_id,
          slug: article.slug ?? row.article_slug,
          title: article.title ?? row.article_slug,
          excerpt: article.excerpt,
        })
      : undefined;

    const compliance = validateImageCompliance({
      url: row.suggested_url,
      altTextCs: row.alt_text_cs,
      altTextEn: row.alt_text_en,
      topic: row.topic as ArticleImageSuggestionRecord["topic"],
      articleTitle: article?.title,
      articleSlug: article?.slug ?? row.article_slug,
      excerpt: article?.excerpt,
      visualTopic,
    });

    if (!compliance.passed) {
      skipped += 1;
      continue;
    }

    const suggestion: ArticleImageSuggestionRecord = {
      articleId: row.article_id,
      articleSlug: row.article_slug,
      suggestedUrl: row.suggested_url,
      altTextCs: row.alt_text_cs,
      altTextEn: row.alt_text_en,
      topic: row.topic as ArticleImageSuggestionRecord["topic"],
      sourceType: row.source_type as ArticleImageSuggestionRecord["sourceType"],
      compliancePassed: true,
      complianceNotes: [],
      visualTopic,
    };

    const ok = await applySuggestion(suggestion);
    if (ok) applied += 1;
    else {
      skipped += 1;
      failures.push(`apply failed: ${row.article_slug}`);
    }
  }

  return { applied, skipped, failures };
}

export async function processEditorialImageBatch(
  options: ProcessImagesOptions = {}
): Promise<{
  result: ImagePipelineBatchResult;
  suggestions: ArticleImageSuggestionRecord[];
  candidates: ArticleForImageMatch[];
}> {
  const limit = options.limit ?? 10;
  const apply = options.apply === true && options.dryRun !== true;

  const candidates = await findArticlesNeedingImages(limit);
  const suggestions: ArticleImageSuggestionRecord[] = [];
  const result: ImagePipelineBatchResult = {
    processed: 0,
    suggested: 0,
    applied: 0,
    skipped: 0,
    failures: [],
  };

  for (const article of candidates) {
    result.processed += 1;
    try {
      const suggestion = await suggestImageForArticle(article);
      if (!suggestion) {
        result.skipped += 1;
        continue;
      }

      suggestions.push(suggestion);
      result.suggested += 1;

      if (!options.dryRun) {
        await persistSuggestion(suggestion);
      }

      if (apply && suggestion.compliancePassed) {
        const ok = await applySuggestion(suggestion);
        if (ok) result.applied += 1;
        else result.failures.push(`apply failed: ${article.slug}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown error";
      result.failures.push(`${article.slug}: ${msg}`);
    }
  }

  return { result, suggestions, candidates };
}

export async function getImagePipelineStatus(): Promise<{
  serviceRoleAvailable: boolean;
  pendingSuggestions: number;
  appliedSuggestions: number;
  articlesMissingHero: number;
}> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return {
      serviceRoleAvailable: false,
      pendingSuggestions: 0,
      appliedSuggestions: 0,
      articlesMissingHero: 0,
    };
  }

  const [pending, applied, articles] = await Promise.all([
    admin
      .from("article_image_suggestions")
      .select("id", { count: "exact", head: true })
      .is("applied_at", null),
    admin
      .from("article_image_suggestions")
      .select("id", { count: "exact", head: true })
      .not("applied_at", "is", null),
    findArticlesNeedingImages(50),
  ]);

  return {
    serviceRoleAvailable: true,
    pendingSuggestions: pending.count ?? 0,
    appliedSuggestions: applied.count ?? 0,
    articlesMissingHero: articles.length,
  };
}
