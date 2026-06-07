import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureIngestionAuthor } from "@/lib/setup/ensure-ingestion-author";
import { V19_RUBRIC_SLUG } from "@/lib/v19/dedup";
import type { V19GeneratedArticle } from "@/lib/v19/types";
import { slugify } from "@/lib/utils";

let categoryCache: string | null = null;

async function resolveCategoryId(): Promise<string> {
  if (categoryCache) return categoryCache;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("categories")
    .select("id")
    .in("slug", ["clinical-medicine", "general-practice", "rheumatology"])
    .limit(1)
    .maybeSingle();
  if (data?.id) {
    categoryCache = data.id as string;
    return categoryCache;
  }
  const { data: anyCat } = await admin.from("categories").select("id").limit(1).maybeSingle();
  if (!anyCat?.id) throw new Error("No category found for v19 articles");
  categoryCache = anyCat.id as string;
  return categoryCache;
}

export async function persistV19Article(
  article: V19GeneratedArticle
): Promise<{ id: string; slug: string } | null> {
  const admin = createServiceRoleClient();
  const authorId = await ensureIngestionAuthor();
  const categoryId = await resolveCategoryId();

  let slug = slugify(article.title);
  const { data: clash } = await admin.from("articles").select("id").eq("slug", slug).maybeSingle();
  if (clash) slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;

  const { data, error } = await admin
    .from("articles")
    .insert({
      title: article.title,
      slug,
      excerpt: article.summary,
      summary: article.summary,
      content: article.contentHtml,
      category_id: categoryId,
      author_id: authorId,
      published: true,
      published_at: article.date,
      vip_only: false,
      rubric_slug: V19_RUBRIC_SLUG,
      min_access_level: "public",
      locale: article.locale,
      source_url: article.sourceUrl,
      source_name: article.sourceName,
      hash_dedup: article.hashDedup,
      content_type: "clinical",
      reading_time_minutes: 2,
      meta_description: article.summary.slice(0, 160),
      quiz_json: {
        v19: true,
        specialty: article.specialty,
        topic: article.topic,
        keyPoints: article.keyPoints,
        clinicalImpact: article.clinicalImpact,
        sourceTier: article.sourceTier,
        angle: article.angle ?? null,
      },
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") return null;
    throw new Error(error.message);
  }

  return { id: data.id as string, slug: data.slug as string };
}

export async function listV19ArticlesFromDb(locale: string, limit = 20) {
  const admin = createServiceRoleClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data, error } = await admin
    .from("articles")
    .select(
      "id, title, slug, excerpt, content, published_at, locale, source_url, source_name, quiz_json, hash_dedup"
    )
    .eq("rubric_slug", V19_RUBRIC_SLUG)
    .eq("published", true)
    .gte("published_at", since.toISOString())
    .order("published_at", { ascending: false })
    .limit(limit * 2);

  if (error) return [];

  return (data ?? [])
    .filter((row) => {
      const loc = (row.locale as string) ?? "en";
      return loc === locale || locale === "en" || loc.startsWith(locale);
    })
    .slice(0, limit)
    .map((row) => {
      const meta = (row.quiz_json ?? {}) as Record<string, unknown>;
      return {
        id: row.id as string,
        slug: row.slug as string,
        title: row.title as string,
        date: (row.published_at as string) ?? new Date().toISOString(),
        summary: row.excerpt as string,
        keyPoints: (meta.keyPoints as string[]) ?? [],
        clinicalImpact: (meta.clinicalImpact as string) ?? "",
        specialty: meta.specialty as string,
        sourceUrl: row.source_url as string,
        sourceName: row.source_name as string,
        locale: row.locale as string,
        contentHtml: row.content as string,
      };
    });
}
