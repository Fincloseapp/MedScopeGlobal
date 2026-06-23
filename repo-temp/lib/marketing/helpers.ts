import type { PublicAdCampaign } from "@/lib/queries/verejnost";
import type { ProAdCampaign, StudentAdCampaign } from "@/lib/queries/marketing";

export function computeAdStats(
  campaigns: Array<Pick<PublicAdCampaign | StudentAdCampaign | ProAdCampaign, "active" | "impressions" | "clicks">>
) {
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

export function filterStudentCampaigns(
  campaigns: StudentAdCampaign[],
  article: {
    study_year?: number | null;
    med_track?: string | null;
    student_topic?: string | null;
  }
): StudentAdCampaign[] {
  if (!campaigns.length) return [];
  const year = article.study_year ?? null;
  const track = article.med_track ?? null;
  const topic = article.student_topic ?? null;

  const matched = campaigns.filter((c) => {
    const years = c.study_years ?? [];
    const tracks = c.med_tracks ?? [];
    const topics = c.target_topics ?? [];
    const yearOk = years.length === 0 || (year != null && years.includes(year));
    const trackOk = tracks.length === 0 || (track && tracks.includes(track));
    const topicOk = topics.length === 0 || (topic && topics.includes(topic));
    return yearOk && trackOk && topicOk;
  });
  return matched.length ? matched : campaigns;
}
