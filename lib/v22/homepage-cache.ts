import { prepareArticlesForDisplay } from "@/lib/articles/prepare-for-display";
import { mapArticleList } from "@/lib/db/map-article";
import { filterActiveArticles } from "@/lib/v20/content-rules";
import { isSeedOrDemoArticle } from "@/lib/editorial/article-quality-audit";
import {
  isHomepageDeskArticle,
  isNovinkyArticle,
  pinHomepageDesks,
  prependUniqueArticles,
  rankAktualityByDate,
} from "@/lib/v271/news-desks";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { listAktualitySection, type DisplayArticle } from "@/lib/queries/articles";
import { normalizeLocale } from "@/lib/i18n/config";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { filterArticlesForLocale } from "@/lib/i18n/filter-articles-for-locale";
import { mergeNativeDeskFeed } from "@/lib/editorial/native-desk-articles";
import type { AdRow } from "@/types/database";

/** Card columns only — `*` plus joins is what pushed the homepage into the demo fallback. */
const homepageCardSelect = [
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "cover_image_url",
  "published",
  "published_at",
  "created_at",
  "updated_at",
  "locale",
  "vip_only",
  "audience",
  "public_topic",
  "rubric_slug",
  "metadata",
  "category_id",
  "author_id",
  "min_access_level",
  "source_name",
].join(", ");

function isWithinSchedule(row: AdRow): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (row.start_date && row.start_date > today) return false;
  if (row.end_date && row.end_date < today) return false;
  if (row.ad_status && row.ad_status !== "active" && row.ad_status !== "approved") {
    return row.active;
  }
  return true;
}

async function loadAds(placement: string, limit: number): Promise<AdRow[]> {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("active", true)
    .eq("placement", placement)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("loadAds", placement, error);
    return [];
  }
  return ((data ?? []) as AdRow[]).filter(isWithinSchedule);
}

async function loadArticlesPublic(locale: string): Promise<DisplayArticle[]> {
  const { getDemoMagazineArticles } = await import(
    "@/lib/verejnost/demo-magazine-articles"
  );

  const supabase = tryCreateServiceRoleClient();
  if (!supabase) {
    return pinHomepageDesks(
      mergeNativeDeskFeed(getDemoMagazineArticles(), locale),
      48,
      locale
    );
  }

  const localeKey = normalizeLocale(locale);
  const csHome = primaryArticleLocale(localeKey) === "cs";

  const fetchMagazine = async () => {
    let query = supabase
      .from("articles")
      .select(homepageCardSelect)
      .eq("published", true)
      .like("slug", "verejnost-%")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(24);
    if (csHome) query = query.or("locale.eq.cs,locale.is.null");
    const { data, error } = await query;
    if (error) {
      console.error("loadArticlesPublic", "verejnost-", error);
      return [];
    }
    return (data ?? []) as unknown as Record<string, unknown>[];
  };

  const aktuality = await listAktualitySection(48, localeKey);
  const magazine = await fetchMagazine();
  const wire = rankAktualityByDate(
    aktuality.filter((article) => {
      const slug = String(article.slug ?? "");
      if (isSeedOrDemoArticle(article)) return false;
      return slug.startsWith("zpravy-") || isNovinkyArticle(article);
    }),
    12,
    new Date(),
    { preferLocale: localeKey }
  );

  if (magazine.length === 0 && wire.length === 0) {
    return pinHomepageDesks(
      mergeNativeDeskFeed(getDemoMagazineArticles(), locale),
      48,
      locale
    );
  }

  const mappedMagazine = filterArticlesForLocale(
    filterActiveArticles(mapArticleList(magazine)),
    localeKey,
    primaryArticleLocale(localeKey) === "cs"
      ? undefined
      : { minNative: 8, courtesyBorrow: 2, maxBorrow: 4 }
  );
  const publicMagazine = mappedMagazine.filter(
    (article) => !article.vip_only && isHomepageDeskArticle(article, new Date(), localeKey)
  );
  const withDesk = mergeNativeDeskFeed(publicMagazine, localeKey);
  const pinnedMagazine = pinHomepageDesks(
    primaryArticleLocale(localeKey) === "cs" ? withDesk : withDesk.slice(0, 48),
    48,
    localeKey
  );
  const preparedMagazine = await prepareArticlesForDisplay(pinnedMagazine, localeKey, {
    mode: "card",
    maxTranslate: primaryArticleLocale(localeKey) === "cs" ? 0 : 4,
    maxLive: 0,
  });
  const feed = prependUniqueArticles(wire, preparedMagazine);
  if (feed.length === 0) {
    return pinHomepageDesks(
      mergeNativeDeskFeed(getDemoMagazineArticles(), localeKey),
      48,
      localeKey
    );
  }
  return feed;
}

async function loadHomepageData(locale: string): Promise<{
  articles: DisplayArticle[];
  topAds: AdRow[];
  midAds: AdRow[];
  bottomAds: AdRow[];
}> {
  const articles = await loadArticlesPublic(locale);
  const [topAds, midAds, bottomAds] = await Promise.all([
    loadAds("homepage_top", 1),
    loadAds("homepage_mid", 1),
    loadAds("homepage_bottom", 1),
  ]);
  return { articles, topAds, midAds, bottomAds };
}

async function loadHomepageDataOrFallback(locale: string) {
  const fallback = async () => {
    const { getDemoMagazineArticles } = await import(
      "@/lib/verejnost/demo-magazine-articles"
    );
    return {
      articles: pinHomepageDesks(
        mergeNativeDeskFeed(getDemoMagazineArticles(), locale),
        48,
        locale
      ),
      topAds: [] as AdRow[],
      midAds: [] as AdRow[],
      bottomAds: [] as AdRow[],
    };
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      loadHomepageData(locale),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("homepage-timeout")), 12_000);
      }),
    ]);
  } catch (error) {
    console.error("getHomepageCachedData", error);
    return fallback();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function getHomepageCachedData(locale = "cs") {
  const day = new Date().toISOString().slice(0, 10);
  void ["v22-homepage-public-v23-76-open", locale, day, "medscope-ui-v23.76"];
  return loadHomepageDataOrFallback(locale);
}
