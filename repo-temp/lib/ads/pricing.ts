import type { AdPlacementId } from "@/lib/ads/placements";

const BASE_BANNER: Record<string, number> = {
  homepage_top: 45000,
  homepage_mid: 32000,
  homepage_bottom: 24000,
  homepage_inline: 18000,
  diagnosis_sidebar: 12000,
  diagnosis_inline: 15000,
  drugs_sidebar: 11000,
  drugs_under_title: 14000,
  article_sidebar: 10000,
  article_inline: 13000,
  study_sidebar: 12000,
  study_inline: 14000,
  digital_health_top: 20000,
  digital_health_mid: 16000,
  legislation_top: 18000,
  legislation_mid: 14000,
  congress_top: 16000,
  congress_detail: 12000,
  congress_calendar: 9000,
};

const TYPE_MULTIPLIER: Record<string, number> = {
  banner: 1,
  newsletter: 0.85,
  sponsored_article: 1.4,
  sponsored_section: 1.25,
  sponsored_study: 1.35,
  sponsored_diagnosis: 1.3,
  package: 1.15,
};

const DURATION_MULTIPLIER: Record<string, number> = {
  "7": 0.35,
  "14": 0.55,
  "30": 1,
  "60": 1.75,
  "90": 2.4,
};

const NEWSLETTER_ADDON: Record<string, number> = {
  header: 8000,
  mid: 5000,
  footer: 3500,
};

export function calculateAdPrice(input: {
  type: string;
  position?: string | null;
  positionNewsletter?: string | null;
  durationDays?: string | null;
  includeNewsletter?: boolean;
}): number {
  const placement = (input.position ?? "homepage_mid") as AdPlacementId;
  const base = BASE_BANNER[placement] ?? 15000;
  const typeMul = TYPE_MULTIPLIER[input.type] ?? 1;
  const durKey = input.durationDays ?? "30";
  const durMul = DURATION_MULTIPLIER[durKey] ?? 1;
  let total = Math.round(base * typeMul * durMul);

  if (input.includeNewsletter && input.positionNewsletter) {
    total += NEWSLETTER_ADDON[input.positionNewsletter] ?? 5000;
  } else if (input.type === "newsletter" && input.positionNewsletter) {
    total = Math.max(total, NEWSLETTER_ADDON[input.positionNewsletter] ?? 8000);
  }

  return total;
}

export function formatCzk(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const PRICING_CATALOG = {
  banners: [
    { placement: "homepage_top", label: "Homepage — top banner", price: 45000 },
    { placement: "homepage_mid", label: "Homepage — mid banner", price: 32000 },
    { placement: "homepage_bottom", label: "Homepage — bottom banner", price: 24000 },
    { placement: "article_inline", label: "Články — inline", price: 13000 },
    { placement: "diagnosis_sidebar", label: "Diagnózy — sidebar", price: 12000 },
  ],
  newsletter: [
    { position: "header", label: "Newsletter — hlavička", price: 8000 },
    { position: "mid", label: "Newsletter — střed", price: 5000 },
    { position: "footer", label: "Newsletter — patička", price: 3500 },
  ],
  packages: [
    { id: "starter", label: "Starter (banner 30 dní + newsletter)", from: 42000 },
    { id: "clinical", label: "Clinical (diagnóza + článek + newsletter)", from: 68000 },
    { id: "congress", label: "Congress (kongres + homepage mid)", from: 52000 },
  ],
};
