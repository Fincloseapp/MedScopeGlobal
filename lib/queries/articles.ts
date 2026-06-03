import {
  allowedAccessLevels,
  type AccessLevelId,
} from "@/lib/config/access-levels";
import { rubricSlugsForSectionQuery } from "@/lib/config/medical-sections";
import type { MedicalSectionSlug } from "@/lib/config/medical-sections";
import { mapArticleList } from "@/lib/db/map-article";
import {
  prepareArticleForDisplay,
  prepareArticlesForDisplay,
  type DisplayArticle,
} from "@/lib/articles/prepare-for-display";
import type { LocaleCode } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import type { ArticleWithRelations } from "@/types/database";

export type { DisplayArticle };

const articleSelect = `
  *,
  categories ( id, name, slug ),
  users!author_id ( id, full_name, avatar_url )
`;

function filterForReader(
  articles: ArticleWithRelations[],
  isVip: boolean,
  accessLevel: AccessLevelId
): ArticleWithRelations[] {
  const allowed = new Set(allowedAccessLevels(accessLevel));
  return articles.filter((a) => {
    if (!isVip && a.vip_only) return false;
    const level = a.min_access_level ?? "public";
    return allowed.has(level);
  });
}

export async function getFeaturedArticles(
  limit = 4,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit * 4);

  if (error) {
    console.error("getFeaturedArticles", error);
    return [];
  }
  const filtered = filterForReader(
    mapArticleList(data as Record<string, unknown>[] | null),
    isVip,
    accessLevel
  );
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: limit,
  });
  return prepared.slice(0, limit);
}

export async function getLatestArticles(
  limit = 12,
  offset = 0,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit * 4 - 1);

  if (error) {
    console.error("getLatestArticles", error);
    return [];
  }
  const filtered = filterForReader(
    mapArticleList(data as Record<string, unknown>[] | null),
    isVip,
    accessLevel
  );
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: limit,
  });
  return prepared.slice(0, limit);
}

export async function getArticlesBySection(
  sectionSlug: MedicalSectionSlug,
  limit = 12,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs",
  contentTypeSlug?: string | null
) {
  const rubricSlugs = contentTypeSlug
    ? [contentTypeSlug]
    : rubricSlugsForSectionQuery(sectionSlug);

  const supabase = await createClient();

  let q = supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true);

  if (rubricSlugs.length > 0) {
    q = q.in("rubric_slug", rubricSlugs);
  } else if (sectionSlug === "healthcare-technology") {
    q = q.is("rubric_slug", null);
  }

  let { data, error } = await q
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit * 4);

  if (error?.message?.includes("rubric_slug")) {
    let q2 = supabase.from("articles").select(articleSelect).eq("published", true);
    if (rubricSlugs.length > 0) {
      q2 = q2.in("rubric_slug", rubricSlugs);
    }
    const res = await q2
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit * 4);
    data = res.data;
    error = res.error;
  }

  if (error) {
    console.error("getArticlesBySection", error);
    return [];
  }

  const filtered = filterForReader(
    mapArticleList(data as Record<string, unknown>[] | null),
    isVip,
    accessLevel
  );
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: limit,
  });
  return prepared.slice(0, limit);
}

/** @deprecated Use getArticlesBySection */
export async function getArticlesByRubric(
  rubricSlug: string,
  limit = 12,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
) {
  const supabase = await createClient();
  let { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .eq("rubric_slug", rubricSlug)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit * 4);

  if (error?.message?.includes("rubric_slug")) {
    const res = await supabase
      .from("articles")
      .select(articleSelect)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit * 4);
    data = res.data;
    error = res.error;
  }

  if (error) {
    console.error("getArticlesByRubric", error);
    return [];
  }
  const filtered = filterForReader(
    mapArticleList(data as Record<string, unknown>[] | null),
    isVip,
    accessLevel
  );
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: limit,
  });
  return prepared.slice(0, limit);
}

export async function getArticlesByCategory(
  categorySlug: string,
  limit = 10,
  offset = 0,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
) {
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (!cat?.id) return { articles: [] as ArticleWithRelations[], total: 0 };

  let q = supabase
    .from("articles")
    .select(articleSelect, { count: "exact" })
    .eq("published", true)
    .eq("category_id", cat.id);

  const { data, error, count } = await q
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit * 4 - 1);

  if (error) {
    console.error("getArticlesByCategory", error);
    return { articles: [] as DisplayArticle[], total: 0 };
  }

  const filtered = filterForReader(
    mapArticleList(data as Record<string, unknown>[] | null),
    isVip,
    accessLevel
  );
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: limit,
  });

  return {
    articles: prepared.slice(0, limit),
    total: count ?? filtered.length,
  };
}

export async function getArticleBySlug(
  slug: string,
  locale: LocaleCode = "cs"
): Promise<DisplayArticle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("getArticleBySlug", error);
    return null;
  }
  const row = data
    ? (mapArticleList([data as Record<string, unknown>])[0] ?? null)
    : null;
  if (!row) return null;
  return prepareArticleForDisplay(row, locale, "full");
}

export async function getRelatedArticles(
  categoryId: string,
  excludeId: string,
  limit = 3,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit * 4);

  if (error) {
    console.error("getRelatedArticles", error);
    return [];
  }
  const filtered = filterForReader(
    mapArticleList(data as Record<string, unknown>[] | null),
    isVip,
    accessLevel
  );
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: limit,
  });
  return prepared.slice(0, limit);
}
