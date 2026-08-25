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
    imageUrl: "/assets/affiliate/magnesium.webp",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "omega-3-test",
    name: { cs: "Omega-3 laboratorní test", en: "Omega-3 Lab Test", "en-US": "Omega-3 Index Test" },
    description: { cs: "Domácí test indexu omega-3", en: "At-home omega-3 index test", "en-US": "CLIA-certified omega-3 test" },
    category: "lab-tests",
    affiliateUrl: { cs: "https://medscopeglobal.com/go/omega-cz", en: "https://medscopeglobal.com/go/omega-en", "en-US": "https://medscopeglobal.com/go/omega-us" },
    imageUrl: "/assets/affiliate/omega-test.webp",
    regions: ["EU", "USA"],
  },
  {
    id: "sleep-tracker",
    name: { cs: "Chytrý sleep tracker", en: "Smart Sleep Tracker", "en-US": "Oura Ring / Whoop" },
    description: { cs: "Sledování spánku a HRV", en: "Sleep and HRV monitoring", "en-US": "Advanced biohacking wearable" },
    category: "sleep",
    affiliateUrl: { cs: "https://medscopeglobal.com/go/sleep-cz", en: "https://medscopeglobal.com/go/sleep-en", "en-US": "https://medscopeglobal.com/go/sleep-us" },
    imageUrl: "/assets/affiliate/sleep-tracker.webp",
    regions: ["EU", "USA", "GLOBAL"],
  },
];

export const HIGH_CTR_PLACEMENTS: AdPlacement[] = ["below-title", "in-content", "sticky"];

export function formatDonationAmount(amountMinor: number, locale: GlobalLocaleCode): string {
  const tier = DONATION_TIERS[locale] ?? DONATION_TIERS.en;
  const zeroDecimal = locale === "ja" || locale === "ko" || locale === "vi" || locale === "id" || locale === "hu";
  const major = zeroDecimal ? amountMinor : amountMinor / 100;
  return `${major} ${tier.symbol}`;
}
