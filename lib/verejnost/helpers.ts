import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import type { PublicAdCampaign } from "@/lib/queries/verejnost";
import { topicLabelForSlug } from "@/lib/config/verejnost-topics";
import { formatPublicDate } from "@/lib/i18n/format-date";

export function verejnostDateLabel(
  article: Pick<DisplayArticle, "published_at" | "created_at" | "displayLocale">,
  locale?: string | null
): string {
  const iso = article.published_at ?? article.created_at;
  return (
    formatPublicDate(iso, locale ?? article.displayLocale ?? "cs", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) ?? ""
  );
}

export function articleTopicLabel(
  article: DisplayArticle,
  locale?: string | null
): string {
  const loc = locale ?? article.displayLocale ?? "cs";
  const meta = article.metadata ?? {};
  const pillar = String(meta.content_pillar ?? meta.internal_topic ?? "")
    .toLowerCase()
    .trim();
  if (pillar === "dlouhovekost" || String(article.public_topic ?? "") === "dlouhovekost") {
    return topicLabelForSlug("dlouhovekost", loc);
  }
  return topicLabelForSlug(article.public_topic ?? undefined, loc);
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
