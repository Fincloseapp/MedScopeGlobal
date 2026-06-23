import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import type { PublicAdCampaign } from "@/lib/queries/verejnost";
import { topicLabelForSlug } from "@/lib/config/verejnost-topics";

export function verejnostDateLabel(article: Pick<DisplayArticle, "published_at" | "created_at">): string {
  const iso = article.published_at ?? article.created_at;
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function articleTopicLabel(article: DisplayArticle): string {
  return topicLabelForSlug(article.public_topic ?? undefined);
}

export function computePublicAdStats(campaigns: PublicAdCampaign[]) {
  const active = campaigns.filter((c) => c.active);
  const impressions = campaigns.reduce((s, c) => s + (c.impressions ?? 0), 0);
  const clicks = campaigns.reduce((s, c) => s + (c.clicks ?? 0), 0);
  return {
    total: campaigns.length,
    active: active.length,
    impressions,
    clicks,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
  };
}
