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
  cs: { monthly: 14900, currency: "czk", symbol: "Kč", label: "149 Kč/měsíc" },
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
  /** Locale → tracked /go/[slug] path (relative; 302 via route handler) */
  affiliateUrl: Record<string, string>;
  imageUrl: string;
  regions: string[];
};

/**
 * Placeholder merchant tags — replace via docs/monetization/AFFILIATE_CATALOG.md
 * before going live for revenue. Search URLs stay valid; tags unlock tracking/commission.
 */
export const AFFILIATE_TAG_PLACEHOLDERS = {
  amazon: "medscope-20",
  heurekaPartnerId: "MSG_HEUREKA_PARTNER_ID",
} as const;

function amazonSearch(host: "amazon.com" | "amazon.co.uk", query: string): string {
  const q = encodeURIComponent(query);
  return `https://www.${host}/s?k=${q}&tag=${AFFILIATE_TAG_PLACEHOLDERS.amazon}`;
}

function heurekaSearch(query: string): string {
  const q = encodeURIComponent(query);
  // Partner deep-link pattern once enrolled: replace with Heureka Partner redirect URL
  // including AFFILIATE_TAG_PLACEHOLDERS.heurekaPartnerId (see AFFILIATE_CATALOG.md).
  return `https://www.heureka.cz/?h%5Bfraze%5D=${q}`;
}

/** Curated health / longevity catalog (8–12 SKUs). Surface via AffiliateStrip / AffiliateBox. */
export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    id: "magnesium-glycinate",
    name: { cs: "Magnesium glycinát", en: "Magnesium Glycinate", "en-US": "Magnesium Glycinate" },
    description: {
      cs: "Podpora spánku, stresu a regenerace",
      en: "Sleep, stress and recovery support",
      "en-US": "Sleep and recovery support",
    },
    category: "supplements",
    affiliateUrl: { cs: "/go/mg-cz", en: "/go/mg-en", "en-US": "/go/mg-us" },
    imageUrl: "/assets/affiliate/magnesium.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "vitamin-d3-k2",
    name: { cs: "Vitamin D3 + K2", en: "Vitamin D3 + K2", "en-US": "Vitamin D3 + K2" },
    description: {
      cs: "Imunita, kosti a metabolismus vápníku",
      en: "Immunity, bones and calcium metabolism",
      "en-US": "Bone and immune support",
    },
    category: "supplements",
    affiliateUrl: { cs: "/go/d3k2-cz", en: "/go/d3k2-en", "en-US": "/go/d3k2-us" },
    imageUrl: "/assets/affiliate/vitamin-d.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "omega-3-epa-dha",
    name: { cs: "Omega-3 EPA/DHA", en: "Omega-3 EPA/DHA", "en-US": "Omega-3 Fish Oil" },
    description: {
      cs: "Srdce, mozek a zánětlivá rovnováha",
      en: "Heart, brain and inflammation balance",
      "en-US": "Heart and brain support",
    },
    category: "supplements",
    affiliateUrl: { cs: "/go/omega3-cz", en: "/go/omega3-en", "en-US": "/go/omega3-us" },
    imageUrl: "/assets/affiliate/omega-test.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "creatine-monohydrate",
    name: { cs: "Kreatin monohydrát", en: "Creatine Monohydrate", "en-US": "Creatine Monohydrate" },
    description: {
      cs: "Síla, kognice a longevity protokoly",
      en: "Strength, cognition and longevity protocols",
      "en-US": "Strength and cognitive support",
    },
    category: "fitness",
    affiliateUrl: { cs: "/go/creatine-cz", en: "/go/creatine-en", "en-US": "/go/creatine-us" },
    imageUrl: "/assets/affiliate/creatine.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "collagen-peptides",
    name: { cs: "Kolagenové peptidy", en: "Collagen Peptides", "en-US": "Collagen Peptides" },
    description: {
      cs: "Kůže, klouby a pojivové tkáně",
      en: "Skin, joints and connective tissue",
      "en-US": "Skin and joint support",
    },
    category: "longevity",
    affiliateUrl: { cs: "/go/collagen-cz", en: "/go/collagen-en", "en-US": "/go/collagen-us" },
    imageUrl: "/assets/affiliate/collagen.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "nmn-nad",
    name: { cs: "NMN / NAD+ prekurzor", en: "NMN / NAD+ Precursor", "en-US": "NMN Supplement" },
    description: {
      cs: "Buněčná energie a longevity stack",
      en: "Cellular energy and longevity stack",
      "en-US": "Cellular energy support",
    },
    category: "longevity",
    affiliateUrl: { cs: "/go/nmn-cz", en: "/go/nmn-en", "en-US": "/go/nmn-us" },
    imageUrl: "/assets/affiliate/nmn.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "omega-3-test",
    name: { cs: "Omega-3 laboratorní test", en: "Omega-3 Lab Test", "en-US": "Omega-3 Index Test" },
    description: {
      cs: "Domácí test indexu omega-3",
      en: "At-home omega-3 index test",
      "en-US": "CLIA-certified omega-3 index",
    },
    category: "lab-tests",
    affiliateUrl: { cs: "/go/omega-cz", en: "/go/omega-en", "en-US": "/go/omega-us" },
    imageUrl: "/assets/affiliate/omega-test.svg",
    regions: ["EU", "USA"],
  },
  {
    id: "longevity-blood-panel",
    name: { cs: "Longevity krevní panel", en: "Longevity Blood Panel", "en-US": "Comprehensive Longevity Labs" },
    description: {
      cs: "Lipidy, HbA1c, vitaminy, zánět",
      en: "Lipids, HbA1c, vitamins, inflammation",
      "en-US": "Full metabolic and inflammation labs",
    },
    category: "lab-tests",
    affiliateUrl: { cs: "/go/labs-cz", en: "/go/labs-en", "en-US": "/go/labs-us" },
    imageUrl: "/assets/affiliate/blood-panel.svg",
    regions: ["EU", "USA"],
  },
  {
    id: "sleep-tracker",
    name: { cs: "Chytrý sleep tracker", en: "Smart Sleep Tracker", "en-US": "Oura / Whoop-class Wearable" },
    description: {
      cs: "Sledování spánku a HRV",
      en: "Sleep and HRV monitoring",
      "en-US": "Advanced sleep and recovery wearable",
    },
    category: "sleep",
    affiliateUrl: { cs: "/go/sleep-cz", en: "/go/sleep-en", "en-US": "/go/sleep-us" },
    imageUrl: "/assets/affiliate/sleep-tracker.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "blood-pressure-monitor",
    name: { cs: "Tlakoměr na paži", en: "Upper-Arm BP Monitor", "en-US": "Validated BP Monitor" },
    description: {
      cs: "Domácí monitoring krevního tlaku",
      en: "Home blood-pressure monitoring",
      "en-US": "Clinically validated home BP cuff",
    },
    category: "longevity",
    affiliateUrl: { cs: "/go/bp-cz", en: "/go/bp-en", "en-US": "/go/bp-us" },
    imageUrl: "/assets/affiliate/bp-monitor.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
];

/**
 * Outbound affiliate destinations keyed by /go/[slug].
 * Swap search placeholders for deep partner URLs + real tags when enrolled
 * (see docs/monetization/AFFILIATE_CATALOG.md).
 */
export const AFFILIATE_REDIRECT_DESTINATIONS: Record<string, string> = {
  // Magnesium
  "mg-cz": heurekaSearch("magnesium glycinát"),
  "mg-en": amazonSearch("amazon.co.uk", "magnesium glycinate"),
  "mg-us": amazonSearch("amazon.com", "magnesium glycinate"),
  magnesium: heurekaSearch("magnesium glycinát"),
  "magnesium-glycinate": heurekaSearch("magnesium glycinát"),

  // Vitamin D3+K2
  "d3k2-cz": heurekaSearch("vitamin D3 K2"),
  "d3k2-en": amazonSearch("amazon.co.uk", "vitamin D3 K2"),
  "d3k2-us": amazonSearch("amazon.com", "vitamin D3 K2"),
  "vitamin-d3-k2": heurekaSearch("vitamin D3 K2"),

  // Omega-3 oil
  "omega3-cz": heurekaSearch("omega 3 EPA DHA"),
  "omega3-en": amazonSearch("amazon.co.uk", "omega 3 EPA DHA"),
  "omega3-us": amazonSearch("amazon.com", "omega 3 fish oil"),
  "omega-3-epa-dha": heurekaSearch("omega 3 EPA DHA"),

  // Creatine
  "creatine-cz": heurekaSearch("kreatin monohydrát"),
  "creatine-en": amazonSearch("amazon.co.uk", "creatine monohydrate"),
  "creatine-us": amazonSearch("amazon.com", "creatine monohydrate"),
  "creatine-monohydrate": heurekaSearch("kreatin monohydrát"),

  // Collagen
  "collagen-cz": heurekaSearch("kolagenové peptidy"),
  "collagen-en": amazonSearch("amazon.co.uk", "collagen peptides"),
  "collagen-us": amazonSearch("amazon.com", "collagen peptides"),
  "collagen-peptides": heurekaSearch("kolagenové peptidy"),

  // NMN
  "nmn-cz": heurekaSearch("NMN NAD"),
  "nmn-en": amazonSearch("amazon.co.uk", "NMN supplement"),
  "nmn-us": amazonSearch("amazon.com", "NMN NAD precursor"),
  "nmn-nad": heurekaSearch("NMN NAD"),

  // Omega-3 lab test
  "omega-cz": heurekaSearch("omega 3 test"),
  "omega-en": amazonSearch("amazon.co.uk", "omega 3 index test"),
  "omega-us": amazonSearch("amazon.com", "omega 3 index test"),
  omega: heurekaSearch("omega 3 test"),
  "omega-3-test": heurekaSearch("omega 3 test"),

  // Longevity labs
  "labs-cz": heurekaSearch("preventivní krevní testy"),
  "labs-en": amazonSearch("amazon.co.uk", "at home blood test kit"),
  "labs-us": amazonSearch("amazon.com", "longevity blood panel test"),
  "longevity-blood-panel": heurekaSearch("preventivní krevní testy"),

  // Sleep tracker
  "sleep-cz": heurekaSearch("sleep tracker"),
  "sleep-en": amazonSearch("amazon.co.uk", "sleep tracker HRV"),
  "sleep-us": amazonSearch("amazon.com", "oura ring whoop"),
  sleep: heurekaSearch("sleep tracker"),
  "sleep-tracker": heurekaSearch("sleep tracker"),

  // BP monitor
  "bp-cz": heurekaSearch("tlakoměr na paži"),
  "bp-en": amazonSearch("amazon.co.uk", "upper arm blood pressure monitor"),
  "bp-us": amazonSearch("amazon.com", "validated blood pressure monitor"),
  "blood-pressure-monitor": heurekaSearch("tlakoměr na paži"),
};

export function getAffiliateRedirectDestination(slug: string): string | null {
  const key = slug.trim().toLowerCase();
  return AFFILIATE_REDIRECT_DESTINATIONS[key] ?? null;
}

/** Products to feature in compact strips (apps page, article sidebar). */
export function getAffiliateStripProducts(limit = 6): AffiliateProduct[] {
  return AFFILIATE_PRODUCTS.slice(0, Math.max(1, limit));
}

export const HIGH_CTR_PLACEMENTS: AdPlacement[] = ["below-title", "in-content", "sticky"];

export function formatDonationAmount(amountMinor: number, locale: GlobalLocaleCode): string {
  const tier = DONATION_TIERS[locale] ?? DONATION_TIERS.en;
  return formatMinorAmount(amountMinor, locale, tier.symbol);
}

/** Tringelt (article tip) tiers — micro-contributions from ~2 CZK equivalent */
export const ARTICLE_TIP_TIERS: Record<
  GlobalLocaleCode,
  { amounts: number[]; currency: string; symbol: string; minAmount: number }
> = {
  cs: { amounts: [200, 500, 1000, 2000, 5000], currency: "czk", symbol: "Kč", minAmount: 200 },
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
