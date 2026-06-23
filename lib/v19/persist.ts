import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureIngestionAuthor } from "@/lib/setup/ensure-ingestion-author";
import { V19_RUBRIC_SLUG } from "@/lib/v19/dedup";
import type {
  V19ArticlePayload,
  V19ContentMode,
  V19GeneratedArticle,
  V19SourceTier,
} from "@/lib/v19/types";
import { applyV19Mode } from "@/lib/v19/modes";
import { specialtyLabel } from "@/lib/v19/specialties";
import { slugify } from "@/lib/utils";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";
import { resolveV19HubLinks } from "@/lib/v19/integration";

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

  const seo = article.seo;

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
      meta_description: seo?.metaDescription ?? article.summary.slice(0, 160),
      quiz_json: {
        v19: true,
        engineVersion: article.engineVersion ?? V19_ENGINE_VERSION,
        specialty: article.specialty,
        topic: article.topic,
        keyPoints: article.keyPoints,
        clinicalImpact: article.clinicalImpact,
        scientificContext: article.scientificContext,
        patientEducation: article.patientEducation,
        nzipContext: article.nzipContext ?? null,
        nzipCategory: article.nzipCategory ?? null,
        nzipRegistryId: article.nzipRegistryId ?? null,
        nzipTopicTags: article.nzipTopicTags ?? null,
        nzipCategoryTags: article.nzipCategoryTags ?? null,
        sourceTier: article.sourceTier,
        angle: article.angle ?? null,
        keywords: article.keywords,
        scientificTerms: article.keywords.filter((k) => k.length > 6),
        articleType: article.articleType,
        relevance: article.relevance,
        modeLayers: article.modeLayers ?? null,
        seo: seo ?? null,
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

export function mapV19RowToArticle(
  row: Record<string, unknown>,
  mode: V19ContentMode = "doctor"
) {
  const meta = (row.quiz_json ?? {}) as Record<string, unknown>;
  const locale = (row.locale as string) ?? "cs";
  const specialty = meta.specialty as V19ArticlePayload["specialty"];

  const payload: V19ArticlePayload = {
    title: row.title as string,
    date: (row.published_at as string) ?? new Date().toISOString(),
    specialty,
    specialtyLabel: specialty ? specialtyLabel(specialty, locale) : "",
    summary: row.excerpt as string,
    keyPoints: (meta.keyPoints as string[]) ?? [],
    clinicalImpact: (meta.clinicalImpact as string) ?? "",
    scientificContext: (meta.scientificContext as string) ?? "",
    patientEducation: (meta.patientEducation as string) ?? "",
    nzipContext: (meta.nzipContext as string) ?? undefined,
    nzipCategory: meta.nzipCategory as V19ArticlePayload["nzipCategory"],
    nzipRegistryId: meta.nzipRegistryId as string | undefined,
    nzipTopicTags: (meta.nzipTopicTags as string[]) ?? undefined,
    nzipCategoryTags: (meta.nzipCategoryTags as string[]) ?? undefined,
    sourceUrl: row.source_url as string,
    sourceName: row.source_name as string,
    sourceTier: (meta.sourceTier as V19SourceTier) ?? "cz",
    topic: (meta.topic as string) ?? "",
    locale,
    keywords: (meta.keywords as string[]) ?? [],
    articleType: (meta.articleType as V19ArticlePayload["articleType"]) ?? "brief",
    relevance: (meta.relevance as V19ArticlePayload["relevance"]) ?? "high",
    modeLayers: meta.modeLayers as V19ArticlePayload["modeLayers"],
    engineVersion: (meta.engineVersion as string) ?? "v19",
  };

  const applied = applyV19Mode(payload, mode);
  const hubLinks = resolveV19HubLinks(payload);

  return {
    id: row.id as string,
    slug: row.slug as string,
    ...applied,
    contentHtml: row.content as string,
    seo: meta.seo as V19GeneratedArticle["seo"],
    hubLinks,
    _locale: locale,
  };
}

export async function listV19ArticlesFromDb(
  locale: string,
  limit = 20,
  offset = 0,
  mode: V19ContentMode = "doctor"
) {
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
    .limit(limit + offset + 40);

  if (error) return [];

  const mapped = (data ?? []).map((row) =>
    mapV19RowToArticle(row as Record<string, unknown>, mode)
  );

  const preferred = mapped.filter((row) => {
    const loc = row._locale;
    return loc === locale || loc.startsWith(locale) || locale.startsWith(loc);
  });
  const pool = preferred.length ? preferred : mapped;
  return pool.slice(offset, offset + limit).map(({ _locale, ...rest }) => rest);
}
