import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPublishedReadClient } from "@/lib/supabase/published-read";
import { isLayAudienceArticle } from "@/lib/config/section-article-map";
import { resolveWriterAgent } from "@/lib/editorial/writer-agents";
import { mapArticleList } from "@/lib/db/map-article";
import {
  prepareArticleForDisplay,
  prepareArticlesForDisplay,
  type DisplayArticle,
} from "@/lib/articles/prepare-for-display";
import type { LocaleCode } from "@/lib/i18n/config";
import type { ArticleWithRelations } from "@/types/database";

export type PublicTopic = "zivotni-styl" | "nemoci" | "prevence" | "rozhovory";

export type PublicAdCampaign = {
  id: string;
  title: string;
  body_html: string;
  type: string;
  target_topics: string[];
  affiliate_url: string | null;
  cta_text: string | null;
  frequency: number;
  active: boolean;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
};

const articleSelect = `
  *,
  categories ( id, name, slug ),
  users!author_id ( id, full_name, avatar_url )
`;

export async function listPublicArticles(options?: {
  topic?: PublicTopic | null;
  limit?: number;
  offset?: number;
  locale?: LocaleCode;
  /** Spustí seed/cron pokud je DB prázdná (default true u hubu). */
  ensureContent?: boolean;
  /** full = načte celý obsah článku (pro expand-on-click). */
  mode?: "card" | "full";
}): Promise<DisplayArticle[]> {
  if (options?.ensureContent !== false) {
    const { ensurePublicArticlesSeeded } = await import("@/lib/verejnost/ensure-content");
    await ensurePublicArticlesSeeded();
  }

  const limit = options?.limit ?? 12;
  const offset = options?.offset ?? 0;
  const locale = options?.locale ?? "cs";
  const supabase = await getPublishedReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(0, 79);

  if (error) {
    console.error("listPublicArticles", error);
    return [];
  }

  const rows = mapArticleList(data as Record<string, unknown>[] | null) as ArticleWithRelations[];
  const publicFacing = rows.filter(
    (article) =>
      !article.vip_only &&
      (isLayAudienceArticle(article) ||
        article.min_access_level === "public" ||
        article.slug.startsWith("verejnost-") ||
        Boolean(resolveWriterAgent(article)))
  );
  const mode = options?.mode ?? "card";
  const prepared = await prepareArticlesForDisplay(publicFacing, locale, { mode, maxTranslate: limit });
  const { resolveVerejnostCoverUrl } = await import("@/lib/verejnost/resolve-cover");
  let withCovers = prepared.map((a) => ({ ...a, cover_image_url: resolveVerejnostCoverUrl(a) }));

  if (options?.topic) {
    const topic = options.topic;
    withCovers = withCovers.filter((article) => articleMatchesPublicTopic(article, topic));
  }

  return withCovers.slice(offset, offset + limit);
}

function articleMatchesPublicTopic(
  article: DisplayArticle,
  topic: PublicTopic
): boolean {
  if (article.public_topic === topic) return true;
  if (article.slug.includes(`verejnost-${topic}`)) return true;
  const agent = resolveWriterAgent(article);
  if (agent?.topic === topic) return true;
  if (topic === "zivotni-styl" && (agent?.id === "writer5" || article.slug.includes("dlouhovekost"))) {
    return true;
  }
  return false;
}

export async function getPublicArticleBySlug(
  slug: string,
  locale: LocaleCode = "cs"
): Promise<DisplayArticle | null> {
  const supabase = await getPublishedReadClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublicArticleBySlug", error);
    return null;
  }

  const row = data ? (mapArticleList([data as Record<string, unknown>])[0] ?? null) : null;
  if (!row) return null;
  const article = await prepareArticleForDisplay(row, locale, "full");
  const { resolveVerejnostCoverUrl } = await import("@/lib/verejnost/resolve-cover");
  return { ...article, cover_image_url: resolveVerejnostCoverUrl(article) };
}

export async function listPublicAdCampaigns(options?: {
  activeOnly?: boolean;
  topic?: PublicTopic | null;
}): Promise<PublicAdCampaign[]> {
  const supabase = await getPublishedReadClient();
  if (!supabase) return [];
  let q = supabase.from("public_ad_campaigns").select("*").order("updated_at", { ascending: false });
  if (options?.activeOnly !== false) q = q.eq("active", true);

  const { data, error } = await q;
  if (error) {
    console.error("listPublicAdCampaigns", error);
    return [];
  }

  let campaigns = (data ?? []) as PublicAdCampaign[];
  if (options?.topic) {
    campaigns = campaigns.filter(
      (c) => !c.target_topics?.length || c.target_topics.includes(options.topic!)
    );
  }
  return campaigns;
}

export async function getPublicAdCampaign(id: string): Promise<PublicAdCampaign | null> {
  const supabase = await getPublishedReadClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("public_ad_campaigns").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getPublicAdCampaign", error);
    return null;
  }
  return (data as PublicAdCampaign) ?? null;
}

/** Service role — pro cron/ad engine (bez RLS omezení zápisu metrik). */
export async function incrementPublicAdClick(campaignId: string): Promise<boolean> {
  const admin = createServiceRoleClient();
  const { data } = await admin.from("public_ad_campaigns").select("clicks").eq("id", campaignId).maybeSingle();
  const next = (data?.clicks ?? 0) + 1;
  const { error } = await admin
    .from("public_ad_campaigns")
    .update({ clicks: next, updated_at: new Date().toISOString() })
    .eq("id", campaignId);
  return !error;
}

export async function countPublicArticlesByTopic(): Promise<Record<string, number>> {
  const supabase = await getPublishedReadClient();
  const topics: PublicTopic[] = ["zivotni-styl", "nemoci", "prevence", "rozhovory"];
  const out: Record<string, number> = {
    "zivotni-styl": 0,
    nemoci: 0,
    prevence: 0,
    rozhovory: 0,
  };
  if (!supabase) return out;
  for (const topic of topics) {
    const { count } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .eq("public_topic", topic);
    out[topic] = count ?? 0;
  }
  return out;
}
