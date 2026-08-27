/** Global monetization configuration — ads, donations, affiliate, VIP */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

export type AdProvider =
  | "adsense"
  | "mediavine"
  | "ezoic"
  | "adthrive"
  | "yandex"
  | "naver"
  | "baidu"
  | "native";

export type AdPlacement = "header" | "below-title" | "in-content" | "sidebar" | "footer" | "sticky";

export const AD_PROVIDERS_BY_REGION: Record<string, AdProvider[]> = {
  USA: ["mediavine", "ezoic", "adthrive", "adsense"],
  EU: ["adsense", "mediavine", "ezoic"],
  RU: ["yandex", "adsense"],
  ASIA: ["baidu", "naver", "adsense"],
  GLOBAL: ["adsense", "native"],
};

export function getAdProvidersForLocale(locale: GlobalLocaleCode): AdProvider[] {
  const regionMap: Record<string, string> = {
    "en-US": "USA", en: "GLOBAL", cs: "EU", sk: "EU", pl: "EU", de: "EU",
    fr: "EU", it: "EU", es: "EU", ro: "EU", hu: "EU",
    ru: "RU", uk: "RU", be: "RU",
    "zh-CN": "ASIA", ja: "ASIA", ko: "ASIA", vi: "ASIA", id: "ASIA",
  };
  return AD_PROVIDERS_BY_REGION[regionMap[locale] ?? "GLOBAL"] ?? ["adsense"];
}

/** Micro-donation tiers in minor currency units (cents/haléře) */
export const DONATION_TIERS: Record<GlobalLocaleCode, { amounts: number[]; currency: string; symbol: string }> = {
  cs: { amounts: [2000, 5000, 9900], currency: "czk", symbol: "Kč" },
  sk: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  pl: { amounts: [1000, 2500, 4900], currency: "pln", symbol: "zł" },
  de: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  fr: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  it: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  es: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  ro: { amounts: [1000, 2500, 4900], currency: "ron", symbol: "lei" },
  hu: { amounts: [80000, 200000, 390000], currency: "huf", symbol: "Ft" },
  ru: { amounts: [10000, 25000, 49000], currency: "rub", symbol: "₽" },
  uk: { amounts: [10000, 25000, 49000], currency: "uah", symbol: "₴" },
  be: { amounts: [1000, 2500, 4900], currency: "byn", symbol: "Br" },
  "zh-CN": { amounts: [1000, 2500, 4900], currency: "cny", symbol: "¥" },
  ja: { amounts: [30000, 60000, 98000], currency: "jpy", symbol: "¥" },
  ko: { amounts: [300000, 600000, 980000], currency: "krw", symbol: "₩" },
  vi: { amounts: [5000000, 12000000, 24000000], currency: "vnd", symbol: "₫" },
  id: { amounts: [3000000, 7500000, 14900000], currency: "idr", symbol: "Rp" },
  en: { amounts: [200, 500, 999], currency: "usd", symbol: "$" },
  "en-US": { amounts: [299, 499, 999], currency: "usd", symbol: "$" },
};

/** VIP pricing by locale */
export const VIP_PRICING: Record<GlobalLocaleCode, { monthly: number; currency: string; symbol: string; label: string }> = {
  cs: { monthly: 14900, currency: "czk", symbol: "Kč", label: "149 Kč/měsíc (VIP Longevity)" },
  sk: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/mesiac" },
  pl: { monthly: 2900, currency: "pln", symbol: "zł", label: "29 zł/miesiąc" },
  de: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/Monat" },
  fr: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/mois" },
  it: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/mese" },
  es: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/mes" },
  ro: { monthly: 2900, currency: "ron", symbol: "lei", label: "29 lei/lună" },
  hu: { monthly: 199000, currency: "huf", symbol: "Ft", label: "1 990 Ft/hó" },
  ru: { monthly: 29900, currency: "rub", symbol: "₽", label: "299 ₽/мес" },
  uk: { monthly: 14900, currency: "uah", symbol: "₴", label: "149 ₴/міс" },
  be: { monthly: 1490, currency: "byn", symbol: "Br", label: "14,90 Br/мес" },
  "zh-CN": { monthly: 2500, currency: "cny", symbol: "¥", label: "¥25/月" },
  ja: { monthly: 60000, currency: "jpy", symbol: "¥", label: "¥600/月" },
  ko: { monthly: 600000, currency: "krw", symbol: "₩", label: "₩6 000/월" },
  vi: { monthly: 12000000, currency: "vnd", symbol: "₫", label: "120 000 ₫/tháng" },
  id: { monthly: 7500000, currency: "idr", symbol: "Rp", label: "Rp 75 000/bulan" },
  en: { monthly: 499, currency: "usd", symbol: "$", label: "$4.99/month" },
  "en-US": { monthly: 699, currency: "usd", symbol: "$", label: "$6.99/month" },
};

export type AffiliateCategory = "supplements" | "lab-tests" | "fitness" | "sleep" | "longevity";

export type AffiliateProduct = {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  category: AffiliateCategory;
  affiliateUrl: Record<string, string>;
  imageUrl: string;
  regions: string[];
};

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    id: "magnesium-glycinate",
    name: { cs: "Magnesium glycinát", en: "Magnesium Glycinate", "en-US": "Magnesium Glycinate (USA)" },
    description: { cs: "Podpora spánku a regenerace", en: "Sleep and recovery support", "en-US": "Premium sleep support" },
    category: "supplements",
    affiliateUrl: { cs: "https://medscopeglobal.com/go/mg-cz", en: "https://medscopeglobal.com/go/mg-en", "en-US": "https://medscopeglobal.com/go/mg-us" },
    imageUrl: "/assets/affiliate/magnesium.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "omega-3-test",
    name: { cs: "Omega-3 laboratorní test", en: "Omega-3 Lab Test", "en-US": "Omega-3 Index Test" },
    description: { cs: "Domácí test indexu omega-3", en: "At-home omega-3 index test", "en-US": "CLIA-certified omega-3 test" },
    category: "lab-tests",
    affiliateUrl: { cs: "https://medscopeglobal.com/go/omega-cz", en: "https://medscopeglobal.com/go/omega-en", "en-US": "https://medscopeglobal.com/go/omega-us" },
    imageUrl: "/assets/affiliate/omega-test.svg",
    regions: ["EU", "USA"],
  },
  {
    id: "sleep-tracker",
    name: { cs: "Chytrý sleep tracker", en: "Smart Sleep Tracker", "en-US": "Oura Ring / Whoop" },
    description: { cs: "Sledování spánku a HRV", en: "Sleep and HRV monitoring", "en-US": "Advanced biohacking wearable" },
    category: "sleep",
    affiliateUrl: { cs: "https://medscopeglobal.com/go/sleep-cz", en: "https://medscopeglobal.com/go/sleep-en", "en-US": "https://medscopeglobal.com/go/sleep-us" },
    imageUrl: "/assets/affiliate/sleep-tracker.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
];

/** Outbound affiliate destinations keyed by /go/[slug] */
export const AFFILIATE_REDIRECT_DESTINATIONS: Record<string, string> = {
  "mg-cz": "https://www.heureka.cz/?h%5Bfraze%5D=magnesium+glycinát",
  "mg-en": "https://www.amazon.co.uk/s?k=magnesium+glycinate",
  "mg-us": "https://www.amazon.com/s?k=magnesium+glycinate",
  /** Friendly aliases (product id / marketing short links) */
  magnesium: "https://www.heureka.cz/?h%5Bfraze%5D=magnesium+glycinát",
  "magnesium-glycinate": "https://www.heureka.cz/?h%5Bfraze%5D=magnesium+glycinát",
  "omega-cz": "https://www.heureka.cz/?h%5Bfraze%5D=omega+3+test",
  "omega-en": "https://www.amazon.co.uk/s?k=omega+3+index+test",
  "omega-us": "https://www.amazon.com/s?k=omega+3+index+test",
  omega: "https://www.heureka.cz/?h%5Bfraze%5D=omega+3+test",
  "omega-3-test": "https://www.heureka.cz/?h%5Bfraze%5D=omega+3+test",
  "sleep-cz": "https://www.heureka.cz/?h%5Bfraze%5D=sleep+tracker",
  "sleep-en": "https://www.amazon.co.uk/s?k=sleep+tracker+hrv",
  "sleep-us": "https://www.amazon.com/s?k=oura+ring+whoop",
  sleep: "https://www.heureka.cz/?h%5Bfraze%5D=sleep+tracker",
  "sleep-tracker": "https://www.heureka.cz/?h%5Bfraze%5D=sleep+tracker",
};

export function getAffiliateRedirectDestination(slug: string): string | null {
  const key = slug.trim().toLowerCase();
  return AFFILIATE_REDIRECT_DESTINATIONS[key] ?? null;
}

export const HIGH_CTR_PLACEMENTS: AdPlacement[] = ["below-title", "in-content", "sticky"];

/** IAB-oriented inventory for display ads (homepage, articles, app landings). */
export type AdInventorySurface = "homepage" | "article" | "app-landing";

export type AdInventoryEntry = {
  id: string;
  surface: AdInventorySurface;
  /** Route pattern for operators */
  routes: string[];
  placement: AdPlacement;
  /** Typical creative sizes (IAB / responsive) */
  sizes: string[];
  format: "display" | "native" | "sticky-mobile";
  /** Higher = place first when inventory is scarce */
  incomePriority: 1 | 2 | 3;
  notes: string;
};

/**
 * Canonical ad placements — wire via `GlobalAdSlot`.
 * Empty in production until `NEXT_PUBLIC_ADS_ENABLED` + provider keys are set.
 */
export const AD_INVENTORY: AdInventoryEntry[] = [
  {
    id: "home-mid",
    surface: "homepage",
    routes: ["/"],
    placement: "in-content",
    sizes: ["728x90", "970x90", "320x100", "300x250"],
    format: "display",
    incomePriority: 1,
    notes: "Below magazine feed, above apps — high viewability, not in hero.",
  },
  {
    id: "home-footer",
    surface: "homepage",
    routes: ["/"],
    placement: "footer",
    sizes: ["728x90", "320x50", "300x250"],
    format: "display",
    incomePriority: 2,
    notes: "Before closing CTA strip.",
  },
  {
    id: "article-below-title",
    surface: "article",
    routes: ["/article/[slug]", "/{locale}/article/[slug]"],
    placement: "below-title",
    sizes: ["728x90", "320x100", "300x250"],
    format: "display",
    incomePriority: 1,
    notes: "Highest CTR on long-form; keep one unit only.",
  },
  {
    id: "article-in-content",
    surface: "article",
    routes: ["/article/[slug]", "/{locale}/article/[slug]"],
    placement: "in-content",
    sizes: ["300x250", "336x280", "responsive"],
    format: "display",
    incomePriority: 1,
    notes: "After primary body; never inside medical disclaimer.",
  },
  {
    id: "article-footer",
    surface: "article",
    routes: ["/article/[slug]", "/{locale}/article/[slug]"],
    placement: "footer",
    sizes: ["728x90", "300x250"],
    format: "display",
    incomePriority: 2,
    notes: "After tip / affiliate blocks, before related.",
  },
  {
    id: "article-sticky",
    surface: "article",
    routes: ["/article/[slug]"],
    placement: "sticky",
    sizes: ["320x50", "320x100"],
    format: "sticky-mobile",
    incomePriority: 3,
    notes: "Mobile only; enable only with explicit env + consent.",
  },
  {
    id: "landing-mediflow",
    surface: "app-landing",
    routes: ["/mediflow"],
    placement: "in-content",
    sizes: ["728x90", "300x250", "320x100"],
    format: "display",
    incomePriority: 2,
    notes: "Below fold after product pillars — never in hero.",
  },
  {
    id: "landing-medipacient",
    surface: "app-landing",
    routes: ["/medipacient"],
    placement: "in-content",
    sizes: ["728x90", "300x250"],
    format: "display",
    incomePriority: 2,
    notes: "Between steps grid and pricing — respectful density.",
  },
  {
    id: "landing-ordizaznam",
    surface: "app-landing",
    routes: ["/ordizaznam", "/ordizapis"],
    placement: "in-content",
    sizes: ["728x90", "300x250"],
    format: "display",
    incomePriority: 3,
    notes: "Physician landing — lighter inventory; prefer B2B later.",
  },
];

export type ClientAdConfig = {
  /** Master switch — must be true AND a provider key present to render live ads */
  enabled: boolean;
  /** Dev-only dashed boxes when live ads are off */
  showPlaceholders: boolean;
  adsenseClientId: string | null;
  mediavineSiteId: string | null;
  ezoicSiteId: string | null;
};

/** Read public ad env (inlined at build for client components). */
export function getClientAdConfig(): ClientAdConfig {
  const adsenseClientId = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "").trim() || null;
  const mediavineSiteId = (process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID ?? "").trim() || null;
  const ezoicSiteId = (process.env.NEXT_PUBLIC_EZOIC_SITE_ID ?? "").trim() || null;
  const hasProvider = Boolean(adsenseClientId || mediavineSiteId || ezoicSiteId);
  const flag = (process.env.NEXT_PUBLIC_ADS_ENABLED ?? "").trim().toLowerCase();
  const enabled =
    (flag === "1" || flag === "true" || flag === "yes") && hasProvider;
  const showPlaceholders =
    (process.env.NEXT_PUBLIC_ADS_SHOW_PLACEHOLDERS ?? "").trim().toLowerCase() === "1" ||
    (process.env.NEXT_PUBLIC_ADS_SHOW_PLACEHOLDERS ?? "").trim().toLowerCase() === "true";

  return {
    enabled,
    showPlaceholders,
    adsenseClientId,
    mediavineSiteId,
    ezoicSiteId,
  };
}

export function resolveAdProvider(
  locale: GlobalLocaleCode,
  config: ClientAdConfig = getClientAdConfig()
): AdProvider | null {
  if (!config.enabled) return null;
  const preferred = getAdProvidersForLocale(locale);
  for (const p of preferred) {
    if (p === "adsense" && config.adsenseClientId) return "adsense";
    if (p === "mediavine" && config.mediavineSiteId) return "mediavine";
    if (p === "ezoic" && config.ezoicSiteId) return "ezoic";
  }
  if (config.adsenseClientId) return "adsense";
  if (config.mediavineSiteId) return "mediavine";
  if (config.ezoicSiteId) return "ezoic";
  return null;
}

export function formatDonationAmount(amountMinor: number, locale: GlobalLocaleCode): string {
  const tier = DONATION_TIERS[locale] ?? DONATION_TIERS.en;
  return formatMinorAmount(amountMinor, locale, tier.symbol);
}

/** Tringelt (article tip) tiers — micro-contributions from ~2 CZK equivalent */
export const ARTICLE_TIP_TIERS: Record<
  GlobalLocaleCode,
  { amounts: number[]; currency: string; symbol: string; minAmount: number }
> = {
  cs: { amounts: [1500, 2000, 5000], currency: "czk", symbol: "Kč", minAmount: 1500 },
  sk: { amounts: [10, 25, 50, 100, 250], currency: "eur", symbol: "€", minAmount: 10 },
  pl: { amounts: [100, 250, 500, 1000, 2500], currency: "pln", symbol: "zł", minAmount: 100 },
  de: { amounts: [10, 25, 50, 100, 250], currency: "eur", symbol: "€", minAmount: 10 },
  fr: { amounts: [10, 25, 50, 100, 250], currency: "eur", symbol: "€", minAmount: 10 },
  it: { amounts: [10, 25, 50, 100, 250], currency: "eur", symbol: "€", minAmount: 10 },
  es: { amounts: [10, 25, 50, 100, 250], currency: "eur", symbol: "€", minAmount: 10 },
  ro: { amounts: [50, 125, 250, 500, 1250], currency: "ron", symbol: "lei", minAmount: 50 },
  hu: { amounts: [8000, 20000, 40000, 80000, 200000], currency: "huf", symbol: "Ft", minAmount: 8000 },
  ru: { amounts: [1000, 2500, 5000, 10000, 25000], currency: "rub", symbol: "₽", minAmount: 1000 },
  uk: { amounts: [1000, 2500, 5000, 10000, 25000], currency: "uah", symbol: "₴", minAmount: 1000 },
  be: { amounts: [100, 250, 500, 1000, 2500], currency: "byn", symbol: "Br", minAmount: 100 },
  "zh-CN": { amounts: [100, 250, 500, 1000, 2500], currency: "cny", symbol: "¥", minAmount: 100 },
  ja: { amounts: [3000, 6000, 12000, 24000, 60000], currency: "jpy", symbol: "¥", minAmount: 3000 },
  ko: { amounts: [30000, 60000, 120000, 240000, 600000], currency: "krw", symbol: "₩", minAmount: 30000 },
  vi: { amounts: [500000, 1250000, 2500000, 5000000, 12500000], currency: "vnd", symbol: "₫", minAmount: 500000 },
  id: { amounts: [300000, 750000, 1500000, 3000000, 7500000], currency: "idr", symbol: "Rp", minAmount: 300000 },
  en: { amounts: [10, 25, 50, 100, 250], currency: "usd", symbol: "$", minAmount: 10 },
  "en-US": { amounts: [10, 25, 50, 100, 250], currency: "usd", symbol: "$", minAmount: 10 },
};

export function formatMinorAmount(
  amountMinor: number,
  locale: GlobalLocaleCode,
  symbol?: string
): string {
  const tier = ARTICLE_TIP_TIERS[locale] ?? ARTICLE_TIP_TIERS.en;
  const sym = symbol ?? tier.symbol;
  const zeroDecimal =
    locale === "ja" || locale === "ko" || locale === "vi" || locale === "id" || locale === "hu";
  const major = zeroDecimal ? amountMinor : amountMinor / 100;
  return `${major} ${sym}`;
}

export function formatTipAmount(amountMinor: number, locale: GlobalLocaleCode): string {
  return formatMinorAmount(amountMinor, locale);
}
