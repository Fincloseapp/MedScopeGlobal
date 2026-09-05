import { unstable_cache } from "next/cache";
import { prepareArticlesForDisplay } from "@/lib/articles/prepare-for-display";
import { mapArticleList } from "@/lib/db/map-article";
import { filterActiveArticles } from "@/lib/v20/content-rules";
import {
  isHomepageDeskArticle,
  pinHomepageDesks,
  prependUniqueArticles,
} from "@/lib/v271/news-desks";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import type { DisplayArticle } from "@/lib/queries/articles";
import { normalizeLocale } from "@/lib/i18n/config";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { filterArticlesForLocale } from "@/lib/i18n/filter-articles-for-locale";
import { mergeNativeDeskFeed } from "@/lib/editorial/native-desk-articles";
import type { AdRow } from "@/types/database";

const articleSelect = `
  *,
  categories ( id, name, slug ),
  users!author_id ( id, full_name, avatar_url )
`;

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

  const [{ data, error }, section] = await Promise.all([
    supabase
      .from("articles")
      .select(articleSelect)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(160),
    supabase
      .from("articles")
      .select(articleSelect)
      .eq("published", true)
      .eq("metadata->>section", "aktuální-zprávy")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(24),
  ]);

  if (error) {
    console.error("loadArticlesPublic", error);
    return pinHomepageDesks(
      mergeNativeDeskFeed(getDemoMagazineArticles(), locale),
      48,
      locale
    );
  }

  const mapped = prependUniqueArticles(
    mapArticleList((section.data ?? []) as Record<string, unknown>[]),
    mapArticleList(data as Record<string, unknown>[] | null)
  );
  const localeKey = normalizeLocale(locale);
  const active = filterArticlesForLocale(
    filterActiveArticles(mapped),
    localeKey,
    primaryArticleLocale(localeKey) === "cs"
      ? undefined
      : { minNative: 8, courtesyBorrow: 2, maxBorrow: 4 }
  );
  const publicOnly = active.filter(
    (article) => !article.vip_only && isHomepageDeskArticle(article, new Date(), localeKey)
  );
  const withDesk = mergeNativeDeskFeed(publicOnly, localeKey);
  const feed = primaryArticleLocale(localeKey) === "cs" ? withDesk : withDesk.slice(0, 48);
  const prepared = await prepareArticlesForDisplay(feed, localeKey, {
    mode: "card",
    maxTranslate: 12,
    maxLive: 0,
  });
  if (prepared.length === 0) {
    return pinHomepageDesks(
      mergeNativeDeskFeed(getDemoMagazineArticles(), localeKey),
      48,
      localeKey
    );
  }
  return pinHomepageDesks(prepared, 48, localeKey);
}

async function loadHomepageData(locale: string): Promise<{
  articles: DisplayArticle[];
  topAds: AdRow[];
  midAds: AdRow[];
  bottomAds: AdRow[];
}> {
  const [articles, topAds, midAds, bottomAds] = await Promise.all([
    loadArticlesPublic(locale),
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
        timer = setTimeout(() => reject(new Error("homepage-timeout")), 8_000);
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
  return unstable_cache(
    () => loadHomepageDataOrFallback(locale),
    ["v22-homepage-public-v21-related-borrow-v23-18-no-double-section", locale, day],
    { revalidate: 60, tags: ["medscope-ui-v22.5", "v22-content", "article-covers"] }
  )();
}
