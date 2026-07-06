import { createServiceRoleClient } from "@/lib/supabase/service";
import { mergeV26Metadata } from "@/lib/v26/editorial-standard";
import { rewriteToV26Standard } from "@/lib/v26/rewrite-engine";
import { V26_EDITORIAL_VERSION } from "@/lib/v26/version";

import {
  detectTemplateIssue,
  isBoilerplateContent,
} from "./editorial-prompts.mjs";

function needsV26Rewrite(
  metadata: unknown,
  content: string | null,
  title?: string | null,
  excerpt?: string | null
): boolean {
  const meta = (metadata ?? {}) as Record<string, unknown>;
  const reasons = detectTemplateIssue({
    title: title ?? "",
    excerpt: excerpt ?? "",
    content: content ?? "",
    locale: (meta.locale as string) ?? "cs",
    metadata: meta,
  });
  if (reasons.length > 0) return true;
  if (meta.editorial_version !== V26_EDITORIAL_VERSION) return true;
  return isBoilerplateContent(content ?? "");
}

export interface V26BackfillResult {
  processed: number;
  updated: number;
  skipped: number;
  scanned: number;
  errors: string[];
  samples: { id: string; slug: string; title: string }[];
}

const BACKFILL_PAGE_SIZE = 100;

export async function runV26RewriteBackfill(options?: {
  batchSize?: number;
  audience?: "public" | "student" | "physician" | "all";
  /** Only include articles published within the last N days. */
  days?: number;
}): Promise<V26BackfillResult> {
  const admin = createServiceRoleClient();
  const batchSize = options?.batchSize ?? Number(process.env.V26_REWRITE_BATCH ?? 8);
  const errors: string[] = [];
  let updated = 0;
  let skipped = 0;

  type ArticleRow = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    metadata: unknown;
    min_access_level: string | null;
    audience: string | null;
    source_url: string | null;
    source_name: string | null;
    public_topic: string | null;
  };

  const batch: ArticleRow[] = [];
  let scanned = 0;
  let offset = 0;

  const since =
    options?.days != null && options.days > 0
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() - options.days!);
          return d.toISOString();
        })()
      : null;

  while (batch.length < batchSize) {
    let query = admin
      .from("articles")
      .select(
        "id, title, slug, excerpt, content, metadata, min_access_level, audience, source_url, source_name, public_topic"
      )
      .eq("published", true);

    if (options?.audience === "public") {
      query = query.eq("audience", "public");
    } else if (options?.audience === "student") {
      query = query.eq("min_access_level", "student");
    } else if (options?.audience === "physician") {
      query = query.eq("min_access_level", "physician");
    }

    if (since) {
      query = query.gte("published_at", since);
    }

    const { data: page, error: fetchErr } = await query
      .order("published_at", { ascending: false })
      .range(offset, offset + BACKFILL_PAGE_SIZE - 1);

    if (fetchErr) {
      return {
        processed: 0,
        updated: 0,
        skipped: 0,
        scanned,
        errors: [fetchErr.message],
        samples: [],
      };
    }

    if (!page?.length) break;

    scanned += page.length;
    for (const article of page as ArticleRow[]) {
      if (needsV26Rewrite(article.metadata, article.content, article.title, article.excerpt)) {
        batch.push(article);
        if (batch.length >= batchSize) break;
      }
    }

    if (page.length < BACKFILL_PAGE_SIZE) break;
    offset += BACKFILL_PAGE_SIZE;
  }
  const samples: V26BackfillResult["samples"] = [];

  for (const article of batch) {
    try {
      const audience =
        (article.min_access_level as "public" | "student" | "physician") ?? "public";
      if (options?.audience && options.audience !== "all" && audience !== options.audience) {
        skipped++;
        continue;
      }

      const rewritten = await rewriteToV26Standard({
        title: article.title,
        excerpt: article.excerpt ?? "",
        content: article.content ?? "",
        audience,
        topic: article.public_topic ?? undefined,
        sourceCitation: article.source_url
          ? {
              name: article.source_name ?? "Zdroj",
              url: article.source_url,
              originalTitle: article.title,
            }
          : undefined,
        seed: article.slug,
      });

      const metadata = mergeV26Metadata(
        (article.metadata ?? {}) as Record<string, unknown>,
        rewritten.metadata
      );

      const { error } = await admin
        .from("articles")
        .update({
          title: rewritten.title,
          excerpt: rewritten.excerpt,
          content: rewritten.content,
          meta_description: rewritten.excerpt.slice(0, 160),
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", article.id);

      if (error) {
        errors.push(`${article.slug}: ${error.message}`);
        skipped++;
      } else {
        updated++;
        if (samples.length < 3) {
          samples.push({ id: article.id, slug: article.slug, title: rewritten.title });
        }
      }
    } catch (e) {
      errors.push(`${article.slug}: ${(e as Error).message}`);
      skipped++;
    }
  }

  return {
    processed: batch.length,
    updated,
    skipped,
    scanned,
    errors,
    samples,
  };
}
