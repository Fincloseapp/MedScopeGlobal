/** v27 AI marketers + coordinator — extends v25 marketing patterns */
import type { V27Audience } from "@/lib/v27/config";

export interface V27MarketingCampaign {
  id: string;
  audience: V27Audience;
  channel: "email" | "social" | "sponsored" | "affiliate";
  headline: string;
  cta: string;
}

export const V27_MARKETING_CAMPAIGNS: V27MarketingCampaign[] = [
  {
    id: "public-prevention",
    audience: "public",
    channel: "email",
    headline: "Prevence, která funguje — týdenní tipy",
    cta: "Přihlásit k newsletteru",
  },
  {
    id: "student-exam",
    audience: "student",
    channel: "social",
    headline: "Přijímačky LF 2026 — modelové otázky zdarma",
    cta: "Začít studovat",
  },
  {
    id: "physician-cme",
    audience: "physician",
    channel: "sponsored",
    headline: "CME body a nové guidelines v jednom přehledu",
    cta: "Aktivovat předplatné",
  },
  {
    id: "b2b-pharma",
    audience: "b2b",
    channel: "affiliate",
    headline: "Oslovte 50 000+ zdravotnických profesionálů",
    cta: "Zobrazit ceník",
  },
];

export function getV27CampaignsForAudience(audience: V27Audience): V27MarketingCampaign[] {
  return V27_MARKETING_CAMPAIGNS.filter((c) => c.audience === audience);
}

/** Coordinator — picks next campaign by audience priority */
export function coordinateV27Marketing(audiences: V27Audience[] = ["public", "student", "physician", "b2b"]) {
  return audiences.flatMap((a) => getV27CampaignsForAudience(a).slice(0, 1));
}
