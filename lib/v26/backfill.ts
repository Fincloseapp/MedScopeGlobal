import { createServiceRoleClient } from "@/lib/supabase/service";
import { mergeV26Metadata } from "@/lib/v26/editorial-standard";
import { rewriteToV26Standard } from "@/lib/v26/rewrite-engine";
import { V26_EDITORIAL_VERSION } from "@/lib/v26/version";

export interface V26BackfillResult {
  processed: number;
  updated: number;
  skipped: number;
  errors: string[];
  samples: { id: string; slug: string; title: string }[];
}

export async function runV26RewriteBackfill(options?: {
  batchSize?: number;
  audience?: "public" | "student" | "physician" | "all";
}): Promise<V26BackfillResult> {
  const admin = createServiceRoleClient();
  const batchSize = options?.batchSize ?? Number(process.env.V26_REWRITE_BATCH ?? 8);
  const errors: string[] = [];
  let updated = 0;
  let skipped = 0;

  let query = admin
    .from("articles")
    .select("id, title, slug, excerpt, content, metadata, min_access_level, source_url, source_name")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(batchSize * 3);

  const { data: candidates, error: fetchErr } = await query;
  if (fetchErr) {
    return { processed: 0, updated: 0, skipped: 0, errors: [fetchErr.message], samples: [] };
  }

  const needsRewrite = (candidates ?? []).filter((a) => {
    const meta = (a.metadata ?? {}) as Record<string, unknown>;
    return meta.editorial_version !== V26_EDITORIAL_VERSION;
  });

  const batch = needsRewrite.slice(0, batchSize);
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
        excerpt: article.excerpt,
        content: article.content,
        audience,
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
    errors,
    samples,
  };
}
