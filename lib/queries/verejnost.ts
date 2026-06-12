import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
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
}): Promise<DisplayArticle[]> {
  const limit = options?.limit ?? 12;
  const offset = options?.offset ?? 0;
  const locale = options?.locale ?? "cs";
  const supabase = await createClient();

  let q = supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .eq("audience", "public")
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (options?.topic) {
    q = q.eq("public_topic", options.topic);
  }

  const { data, error } = await q;
  if (error) {
    console.error("listPublicArticles", error);
    return [];
  }

  const rows = mapArticleList(data as Record<string, unknown>[] | null) as ArticleWithRelations[];
  return prepareArticlesForDisplay(rows, locale, { mode: "card", maxTranslate: limit });
}

export async function getPublicArticleBySlug(
  slug: string,
  locale: LocaleCode = "cs"
): Promise<DisplayArticle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("slug", slug)
    .eq("published", true)
    .eq("audience", "public")
    .maybeSingle();

  if (error) {
    console.error("getPublicArticleBySlug", error);
    return null;
  }

  const row = data ? (mapArticleList([data as Record<string, unknown>])[0] ?? null) : null;
  if (!row) return null;
  return prepareArticleForDisplay(row, locale, "full");
}

export async function listPublicAdCampaigns(options?: {
  activeOnly?: boolean;
  topic?: PublicTopic | null;
}): Promise<PublicAdCampaign[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
  const topics: PublicTopic[] = ["zivotni-styl", "nemoci", "prevence", "rozhovory"];
  const out: Record<string, number> = {};
  for (const topic of topics) {
    const { count } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("audience", "public")
      .eq("published", true)
      .eq("public_topic", topic);
    out[topic] = count ?? 0;
  }
  return out;
}
