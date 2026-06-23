import { PublicAdBlocks } from "@/components/verejnost/public-ad-block";
import type { StudentAdCampaign } from "@/lib/queries/marketing";
import type { PublicAdCampaign } from "@/lib/queries/verejnost";

function toPublicShape(c: StudentAdCampaign): PublicAdCampaign {
  return {
    id: c.id,
    title: c.title,
    body_html: c.body_html,
    type: c.type,
    target_topics: c.target_topics,
    affiliate_url: c.affiliate_url,
    cta_text: c.cta_text,
    frequency: c.frequency,
    active: c.active,
    impressions: c.impressions,
    clicks: c.clicks,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

export function StudentAdBlocks({
  campaigns,
  variant,
}: {
  campaigns: StudentAdCampaign[];
  variant: "banner" | "inline" | "sidebar" | "footer";
}) {
  if (!campaigns.length) return null;
  const mapped = campaigns.map(toPublicShape);
  return <PublicAdBlocks campaigns={mapped} variant={variant} />;
}
