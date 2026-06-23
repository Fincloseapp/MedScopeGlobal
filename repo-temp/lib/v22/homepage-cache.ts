import { unstable_cache } from "next/cache";
import { prepareArticlesForDisplay } from "@/lib/articles/prepare-for-display";
import { mapArticleList } from "@/lib/db/map-article";
import { filterActiveArticles, filterCzechContent } from "@/lib/v20/content-rules";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { DisplayArticle } from "@/lib/queries/articles";
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
  const supabase = createServiceRoleClient();
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

async function loadArticlesPublic(): Promise<DisplayArticle[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(24);

  if (error) {
    console.error("loadArticlesPublic", error);
    return [];
  }

  const mapped = mapArticleList(data as Record<string, unknown>[] | null);
  const active = filterCzechContent(filterActiveArticles(mapped), "cs");
  const publicOnly = active.filter((a) => !a.vip_only);
  const prepared = await prepareArticlesForDisplay(publicOnly, "cs", {
    mode: "card",
    maxTranslate: 6,
  });
  return prepared.slice(0, 6);
}

async function loadHomepageData(): Promise<{
  articles: DisplayArticle[];
  topAds: AdRow[];
  midAds: AdRow[];
  bottomAds: AdRow[];
}> {
  const [articles, topAds, midAds, bottomAds] = await Promise.all([
    loadArticlesPublic(),
    loadAds("homepage_top", 1),
    loadAds("homepage_mid", 1),
    loadAds("homepage_bottom", 1),
  ]);
  return { articles, topAds, midAds, bottomAds };
}

export const getHomepageCachedData = unstable_cache(
  loadHomepageData,
  ["v22-homepage-public"],
  { revalidate: 120, tags: ["medscope-ui-v22.4", "v22-content"] }
);
