import { unstable_cache } from "next/cache";
import { prepareArticlesForDisplay } from "@/lib/articles/prepare-for-display";
import { mapArticleList } from "@/lib/db/map-article";
import { filterMagazineListableArticles } from "@/lib/editorial/article-quality-audit";
import { filterActiveArticles } from "@/lib/v20/content-rules";
import { pinLongevityIntoFeed } from "@/lib/v271/news-desks";
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
    return pinLongevityIntoFeed(
      mergeNativeDeskFeed(getDemoMagazineArticles(), locale),
      36,
      locale
    );
  }

  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(160);

  if (error) {
    console.error("loadArticlesPublic", error);
    return pinLongevityIntoFeed(
      mergeNativeDeskFeed(getDemoMagazineArticles(), locale),
      36,
      locale
    );
  }

  const mapped = mapArticleList(data as Record<string, unknown>[] | null);
  const localeKey = normalizeLocale(locale);
  const active = filterArticlesForLocale(
    filterActiveArticles(mapped),
    localeKey,
    primaryArticleLocale(localeKey) === "cs"
      ? undefined
      : { minNative: 8, courtesyBorrow: 2, maxBorrow: 4 }
  );
  const publicOnly = filterMagazineListableArticles(
    active.filter((a) => !a.vip_only)
  );
  const withDesk = mergeNativeDeskFeed(publicOnly, localeKey);
  const feed = primaryArticleLocale(localeKey) === "cs" ? withDesk : withDesk.slice(0, 48);
  const prepared = await prepareArticlesForDisplay(feed, localeKey, {
    mode: "card",
    maxTranslate: 12,
    maxLive: 0,
  });
  if (prepared.length === 0) {
    return pinLongevityIntoFeed(
      mergeNativeDeskFeed(getDemoMagazineArticles(), localeKey),
      36,
      localeKey
    );
  }
  return pinLongevityIntoFeed(prepared, 36, localeKey);
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

export function getHomepageCachedData(locale = "cs") {
  return unstable_cache(
    () => loadHomepageData(locale),
    ["v22-homepage-public-v19-native-desk-tight-borrow", locale],
    { revalidate: 60, tags: ["medscope-ui-v22.5", "v22-content", "article-covers"] }
  )();
}
