import {
  allowedAccessLevels,
  type AccessLevelId,
} from "@/lib/config/access-levels";
import type { MedicalSectionSlug } from "@/lib/config/medical-sections";
import {
  articleMatchesSection,
  isLayAudienceArticle,
  rubricSlugsForSectionFetch,
  sectionShowsLayContent,
  V19_RUBRIC_SLUG,
  V24_RUBRIC_SLUG,
} from "@/lib/config/section-article-map";
import { mapArticleList } from "@/lib/db/map-article";
import {
  prepareArticleForDisplay,
  prepareArticlesForDisplay,
  type DisplayArticle,
} from "@/lib/articles/prepare-for-display";
import { shouldHideFromArticleDetail } from "@/lib/auth/article-eligibility";
import { filterMagazineListableArticles } from "@/lib/editorial/article-quality-audit";
import type { LocaleCode } from "@/lib/i18n/config";
import { createDataClient } from "@/lib/supabase/data";
import { filterArticlesForLocale } from "@/lib/i18n/filter-articles-for-locale";
import {
  getNativeDeskArticleBySlug,
  mergeNativeDeskFeed,
  relatedNativeDeskArticles,
} from "@/lib/editorial/native-desk-articles";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import {
  filterActiveArticles,
  isArchivedArticle,
} from "@/lib/v20/content-rules";
import type { ArticleWithRelations } from "@/types/database";

export type { DisplayArticle };

const articleSelect = `
  *,
  categories ( id, name, slug ),
  users!author_id ( id, full_name, avatar_url )
`;

function allowedLevelsForSection(accessLevel: AccessLevelId): Set<string> {
  const levels = new Set<string>(allowedAccessLevels(accessLevel));
  if (accessLevel === "physician") {
    levels.add("student");
  }
  return levels;
}

function filterForReader(
  articles: ArticleWithRelations[],
  isVip: boolean,
  accessLevel: AccessLevelId,
  locale: LocaleCode = "cs"
): ArticleWithRelations[] {
  const allowed = new Set(allowedAccessLevels(accessLevel));
  const active = filterActiveArticles(articles);
  const localized = filterArticlesForLocale(active, locale);
  return localized.filter((a) => {
    if (!isVip && a.vip_only) return false;
    const level = a.min_access_level ?? "public";
    return (allowed as Set<string>).has(level);
  });
}

function filterForSectionReader(
  articles: ArticleWithRelations[],
  isVip: boolean,
  accessLevel: AccessLevelId,
  locale: LocaleCode = "cs"
): ArticleWithRelations[] {
  const allowed = allowedLevelsForSection(accessLevel);
  const active = filterActiveArticles(articles);
  const localized = filterArticlesForLocale(active, locale);
  return localized.filter((a) => {
    if (!isVip && a.vip_only) return false;
    const level = a.min_access_level ?? "public";
    return allowed.has(level);
  });
}

/** Metadata rubric listings (e.g. aktuální-zprávy) — show all tagged articles; detail page gates access. */
function filterForMetadataRubricListing(
  articles: ArticleWithRelations[],
  locale: LocaleCode = "cs"
): ArticleWithRelations[] {
  const active = filterActiveArticles(articles);
  return filterArticlesForLocale(active, locale);
}

export async function getFeaturedArticles(
  limit = 4,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
) {
  const supabase = await createDataClient();
  if (!supabase) {
    const { getDemoMagazineArticles } = await import(
      "@/lib/verejnost/demo-magazine-articles"
    );
    return getDemoMagazineArticles().slice(0, limit);
  }
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit * 4);

  if (error) {
    console.error("getFeaturedArticles", error);
    const { getDemoMagazineArticles } = await import(
      "@/lib/verejnost/demo-magazine-articles"
    );
    return getDemoMagazineArticles().slice(0, limit);
  }
  const filtered = filterMagazineListableArticles(
    filterForReader(
      mapArticleList(data as Record<string, unknown>[] | null),
      isVip,
      accessLevel,
      locale
    )
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
  const { getDemoMagazineArticles } = await import(
    "@/lib/verejnost/demo-magazine-articles"
  );
  const demo = () =>
    mergeNativeDeskFeed(getDemoMagazineArticles(), locale).slice(offset, offset + limit);

  const supabase = await createDataClient();
  if (!supabase) return demo();

  const fetchLimit = Math.min(Math.max(limit * 3, limit + 24), 200);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const load = (async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(articleSelect)
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .range(offset, offset + fetchLimit - 1);

      if (error) {
        console.error("getLatestArticles", error);
        return demo();
      }
      const rows = mapArticleList(data as Record<string, unknown>[] | null);
      const filtered = mergeNativeDeskFeed(
        filterMagazineListableArticles(
          filterForReader(rows, isVip, accessLevel, locale)
        ),
        locale
      );
      const prepared = await prepareArticlesForDisplay(filtered, locale, {
        mode: "card",
        maxTranslate: Math.min(limit, 4),
        maxLive: 0,
      });
      const slice = prepared.slice(0, limit);
      return slice.length > 0 ? slice : demo();
    })();

    return await Promise.race([
      load,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("latest-articles-timeout")), 3_000);
      }),
    ]);
  } catch (error) {
    console.error("getLatestArticles", error);
    return demo();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function getArticlesBySection(
  sectionSlug: MedicalSectionSlug,
  limit = 12,
  isVip = false,
  accessLevel: AccessLevelId = "physician",
  locale: LocaleCode = "cs",
  contentTypeSlug?: string | null
) {
  const rubricSlugs = contentTypeSlug
    ? [contentTypeSlug]
    : rubricSlugsForSectionFetch(sectionSlug);

  const allowLay = sectionShowsLayContent(sectionSlug);
  const {
    getDemoMagazineArticles,
    shouldUseDemoMagazineArticles,
  } = await import("@/lib/verejnost/demo-magazine-articles");
  const demoForLay = () =>
    allowLay ? getDemoMagazineArticles().slice(0, limit) : [];

  const supabase = await createDataClient();
  if (!supabase) return demoForLay();

  let q = supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .in("rubric_slug", rubricSlugs);

  let { data, error } = await q
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit * 8);

  if (error?.message?.includes("rubric_slug")) {
    const res = await supabase
      .from("articles")
      .select(articleSelect)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit * 12);
    data = res.data;
    error = res.error;
  }

  if (error) {
    console.error("getArticlesBySection", error);
    return demoForLay();
  }

  const rows = mapArticleList(data as Record<string, unknown>[] | null);

  const sectionMatched = rows.filter((article) => {
    if (!allowLay && isLayAudienceArticle(article)) return false;
    return articleMatchesSection(article, sectionSlug, contentTypeSlug);
  });

  let candidates = sectionMatched;
  if (candidates.length < limit) {
    const seen = new Set(candidates.map((a) => a.id));
    const professionalPool = rows.filter((article) => {
      if (seen.has(article.id)) return false;
      if (!allowLay && isLayAudienceArticle(article)) return false;
      return (
        article.rubric_slug === V19_RUBRIC_SLUG || article.rubric_slug === V24_RUBRIC_SLUG
      );
    });
    candidates = [...candidates, ...professionalPool];
  }

  const filtered = filterForSectionReader(candidates, isVip, accessLevel, locale);
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: limit,
  });
  if (shouldUseDemoMagazineArticles(prepared)) return demoForLay();
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
  const supabase = await createDataClient();
  if (!supabase) {
    if (accessLevel === "public") {
      const { getDemoMagazineArticles } = await import(
        "@/lib/verejnost/demo-magazine-articles"
      );
      return getDemoMagazineArticles().slice(0, limit);
    }
    return [];
  }
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
    if (accessLevel === "public") {
      const { getDemoMagazineArticles } = await import(
        "@/lib/verejnost/demo-magazine-articles"
      );
      return getDemoMagazineArticles().slice(0, limit);
    }
    return [];
  }
  const filtered = filterForReader(
    mapArticleList(data as Record<string, unknown>[] | null),
    isVip,
    accessLevel,
    locale
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
  const supabase = await createDataClient();
  if (!supabase) return { articles: [] as DisplayArticle[], total: 0 };
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
    accessLevel,
    locale
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
  const { resolveCanonicalArticleSlug } = await import(
    "@/lib/editorial/clinician-anonymize"
  );
  const { getDemoMagazineArticleBySlug } = await import(
    "@/lib/verejnost/demo-magazine-articles"
  );
  const dbSlug = resolveCanonicalArticleSlug(slug);
  const nativeDesk = getNativeDeskArticleBySlug(dbSlug);
  if (nativeDesk) {
    return prepareArticleForDisplay(nativeDesk, locale, "full");
  }

  const supabase = await createDataClient();
  if (!supabase) {
    const demo = getDemoMagazineArticleBySlug(dbSlug);
    return demo ? prepareArticleForDisplay(demo, locale, "full") : null;
  }
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("slug", dbSlug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("getArticleBySlug", error);
    const demo = getDemoMagazineArticleBySlug(dbSlug);
    return demo ? prepareArticleForDisplay(demo, locale, "full") : null;
  }
  const row = data
    ? (mapArticleList([data as Record<string, unknown>])[0] ?? null)
    : null;
  if (!row) {
    const demo = getDemoMagazineArticleBySlug(dbSlug);
    return demo ? prepareArticleForDisplay(demo, locale, "full") : null;
  }
  // Listing hide is for magazine hubs. Special-access medical/doctor
  // articles must resolve so the existing VIP / physician gate can run.
  if (shouldHideFromArticleDetail(row)) {
    return null;
  }
  return prepareArticleForDisplay(row, locale, "full");
}

async function relatedFallback(
  excludeId: string,
  limit: number,
  locale: LocaleCode
) {
  const native = relatedNativeDeskArticles(locale, { id: excludeId }, limit);
  if (native.length > 0) return native;
  if (primaryArticleLocale(locale) !== "cs") return [];

  const { getDemoMagazineArticles } = await import(
    "@/lib/verejnost/demo-magazine-articles"
  );
  const raw = getDemoMagazineArticles()
    .filter((a) => a.id !== excludeId)
    .slice(0, limit);
  return prepareArticlesForDisplay(raw, locale, { mode: "card", maxTranslate: limit });
}

export async function getRelatedArticles(
  categoryId: string,
  excludeId: string,
  limit = 3,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
) {
  const nativePins = relatedNativeDeskArticles(locale, { id: excludeId }, limit);
  // Seeded native-desk rows are not in the articles.category_id table.
  if (categoryId === "native-desk") return nativePins;

  const supabase = await createDataClient();
  if (!supabase) return relatedFallback(excludeId, limit, locale);
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
    return relatedFallback(excludeId, limit, locale);
  }
  const filtered = filterArticlesForLocale(
    filterForReader(
      mapArticleList(data as Record<string, unknown>[] | null),
      isVip,
      accessLevel,
      locale
    ).filter((article) => !shouldHideFromArticleDetail(article)),
    locale,
    { minNative: limit, courtesyBorrow: 0, maxBorrow: 0 }
  );
  const merged = mergeNativeDeskFeed(filtered, locale).filter(
    (article) => article.id !== excludeId
  );
  const prepared = await prepareArticlesForDisplay(merged, locale, {
    mode: "card",
    maxTranslate: limit,
  });
  if (prepared.length === 0) return relatedFallback(excludeId, limit, locale);
  return prepared.slice(0, limit);
}

const wireCardSelect =
  "id, title, slug, excerpt, published, published_at, created_at, locale, vip_only, metadata, rubric_slug, cover_image_url, source_name";

function mergeArticleRows(
  ...groups: Array<Record<string, unknown>[] | null | undefined>
): Record<string, unknown>[] {
  const merged = new Map<string, Record<string, unknown>>();
  for (const group of groups) {
    for (const row of group ?? []) {
      const key = String(row.slug ?? row.id ?? "");
      if (key && !merged.has(key)) merged.set(key, row);
    }
  }
  return [...merged.values()];
}

/** Card rows for homepage Aktuality — date window first, then professional titles. */
export async function listWireZpravyCards(
  limit = 8,
  locale: LocaleCode = "cs"
): Promise<DisplayArticle[]> {
  const supabase = await createDataClient();
  if (!supabase) return [];
  const freshFrom = new Date(Date.now() - 45 * 86_400_000).toISOString();
  const scan = Math.max(limit * 6, 80);

  const fetchPair = async (since?: string) => {
    let zpravy = supabase
      .from("articles")
      .select(wireCardSelect)
      .eq("published", true)
      .like("slug", "zpravy-%")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(scan);
    let section = supabase
      .from("articles")
      .select(wireCardSelect)
      .eq("published", true)
      .eq("metadata->>section", "aktuální-zprávy")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(scan);
    if (since) {
      zpravy = zpravy.gte("published_at", since);
      section = section.gte("published_at", since);
    }
    return Promise.all([zpravy, section]);
  };

  const [freshSlug, freshSection] = await fetchPair(freshFrom);
  if (freshSlug.error) console.error("listWireZpravyCards", "zpravy", freshSlug.error);
  if (freshSection.error) console.error("listWireZpravyCards", "section", freshSection.error);
  let rows = mergeArticleRows(
    freshSlug.data as Record<string, unknown>[] | null,
    freshSection.data as Record<string, unknown>[] | null
  );

  const { isSeedOrDemoArticle } = await import("@/lib/editorial/article-quality-audit");
  const { rankAktualityByDate } = await import("@/lib/v271/news-desks");
  const toRanked = (pool: Record<string, unknown>[]) =>
    rankAktualityByDate(
      filterActiveArticles(mapArticleList(pool)).filter(
        (article) => !isSeedOrDemoArticle(article)
      ),
      Math.max(limit, 12),
      new Date(),
      { rotate: true }
    );

  let ranked = toRanked(rows);
  if (ranked.length < limit) {
    const [olderSlug, olderSection] = await fetchPair();
    if (olderSlug.error) console.error("listWireZpravyCards", "zpravy-older", olderSlug.error);
    if (olderSection.error) console.error("listWireZpravyCards", "section-older", olderSection.error);
    rows = mergeArticleRows(
      rows,
      olderSlug.data as Record<string, unknown>[] | null,
      olderSection.data as Record<string, unknown>[] | null
    );
    ranked = toRanked(rows);
  }
  const prepared = await prepareArticlesForDisplay(ranked, locale, {
    mode: "card",
    maxTranslate: Math.min(limit, 4),
    maxLive: 0,
  });
  return prepared.slice(0, limit);
}

/** Same pool as `/aktualni-zpravy` — no invented titles. */
export async function listAktualitySection(
  limit = 24,
  locale: LocaleCode = "cs"
): Promise<DisplayArticle[]> {
  const supabase = await createDataClient();
  if (!supabase) return [];
  const scan = Math.max(limit * 4, 80);
  const freshFrom = new Date(Date.now() - 45 * 86_400_000).toISOString();
  const [section, bySlug] = await Promise.all([
    supabase
      .from("articles")
      .select(articleSelect)
      .eq("published", true)
      .eq("metadata->>section", "aktuální-zprávy")
      .gte("published_at", freshFrom)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(scan),
    supabase
      .from("articles")
      .select(articleSelect)
      .eq("published", true)
      .like("slug", "zpravy-%")
      .gte("published_at", freshFrom)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(scan),
  ]);
  if (section.error) console.error("listAktualitySection", "section", section.error);
  if (bySlug.error) console.error("listAktualitySection", "zpravy", bySlug.error);

  const merged = new Map<string, Record<string, unknown>>();
  for (const row of [
    ...((bySlug.data ?? []) as Record<string, unknown>[]),
    ...((section.data ?? []) as Record<string, unknown>[]),
  ]) {
    const key = String(row.slug ?? row.id ?? "");
    if (key && !merged.has(key)) merged.set(key, row);
  }

  const mapped = mapArticleList([...merged.values()]);
  const active = filterActiveArticles(mapped);
  const zpravy = active.filter((article) => String(article.slug ?? "").startsWith("zpravy-"));
  const rest = filterForMetadataRubricListing(
    active.filter((article) => !String(article.slug ?? "").startsWith("zpravy-")),
    locale
  );
  const { isSeedOrDemoArticle } = await import("@/lib/editorial/article-quality-audit");
  const { rankAktualityByDate } = await import("@/lib/v271/news-desks");
  let filtered = rankAktualityByDate(
    [...zpravy, ...rest].filter((article) => !isSeedOrDemoArticle(article)),
    limit,
    new Date()
  );
  if (filtered.length < Math.min(limit, 8)) {
    const older = await supabase
      .from("articles")
      .select(articleSelect)
      .eq("published", true)
      .like("slug", "zpravy-%")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(scan);
    if (older.error) console.error("listAktualitySection", "zpravy-older", older.error);
    const olderMapped = filterActiveArticles(
      mapArticleList((older.data ?? []) as Record<string, unknown>[])
    ).filter((article) => !isSeedOrDemoArticle(article));
    filtered = rankAktualityByDate([...filtered, ...olderMapped], limit, new Date());
  }
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: Math.min(limit, 8),
    maxLive: 0,
  });
  return prepared.slice(0, limit);
}

/** Articles tagged with metadata.section (e.g. v26 foreign news rubric). */
export async function getArticlesByMetadataSection(
  section: string,
  limit = 24,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
) {
  if (section === "aktuální-zprávy") {
    return listAktualitySection(limit, locale);
  }
  const supabase = await createDataClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .eq("metadata->>section", section)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("getArticlesByMetadataSection", error);
    return [];
  }

  const filtered = filterForMetadataRubricListing(
    mapArticleList(data as Record<string, unknown>[] | null),
    locale
  );
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: limit,
  });
  return prepared.slice(0, limit);
}

/** Archived articles (pre-2026 legacy / expired v19 briefs) — direct slug access still works. */
export async function getArchivedArticles(
  limit = 48,
  offset = 0,
  locale: LocaleCode = "cs"
): Promise<{ articles: DisplayArticle[]; total: number }> {
  const supabase = await createDataClient();
  if (!supabase) return { articles: [], total: 0 };
  const { data, error, count } = await supabase
    .from("articles")
    .select(articleSelect, { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit * 3 - 1);

  if (error) {
    console.error("getArchivedArticles", error);
    return { articles: [], total: 0 };
  }

  const rows = mapArticleList(data as Record<string, unknown>[] | null);
  const archived = filterArticlesForLocale(
    rows.filter((a) => isArchivedArticle(a)),
    locale
  );
  const prepared = await prepareArticlesForDisplay(archived, locale, {
    mode: "card",
    maxTranslate: limit,
  });

  return {
    articles: prepared.slice(0, limit),
    total: count ?? archived.length,
  };
}
