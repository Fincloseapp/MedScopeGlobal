import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale, type LocaleCode, type RegionCode } from "@/lib/i18n/config";

const EUROZONE = new Set(["de", "fr", "it", "es", "sk", "nl", "pt", "fi", "at", "be", "ie", "lt", "lv", "ee", "si", "mt", "cy", "lu"]);

export type PaymentTiers = {
  amounts: number[];
  currency: string;
  symbol: string;
  minAmount: number;
};

const EUR: PaymentTiers = { amounts: [200, 500, 1000], currency: "eur", symbol: "€", minAmount: 50 };
const USD: PaymentTiers = { amounts: [200, 500, 1000], currency: "usd", symbol: "$", minAmount: 50 };
const GBP: PaymentTiers = { amounts: [200, 500, 1000], currency: "gbp", symbol: "£", minAmount: 50 };
const CZK: PaymentTiers = { amounts: [1500, 2000, 5000], currency: "czk", symbol: "Kč", minAmount: 1500 };

const BY_LOCALE: Partial<Record<string, PaymentTiers>> = {
  cs: CZK,
  sk: EUR,
  de: EUR,
  fr: EUR,
  it: EUR,
  es: EUR,
  nl: EUR,
  pt: EUR,
  pl: { amounts: [1000, 2500, 4900], currency: "pln", symbol: "zł", minAmount: 100 },
  ro: { amounts: [1000, 2500, 4900], currency: "ron", symbol: "lei", minAmount: 100 },
  hu: { amounts: [80000, 200000, 390000], currency: "huf", symbol: "Ft", minAmount: 8000 },
  ru: { amounts: [10000, 25000, 49000], currency: "rub", symbol: "₽", minAmount: 1000 },
  uk: { amounts: [10000, 25000, 49000], currency: "uah", symbol: "₴", minAmount: 1000 },
  be: { amounts: [1000, 2500, 4900], currency: "byn", symbol: "Br", minAmount: 100 },
  "zh-CN": { amounts: [1000, 2500, 4900], currency: "cny", symbol: "¥", minAmount: 100 },
  ja: { amounts: [30000, 60000, 98000], currency: "jpy", symbol: "¥", minAmount: 3000 },
  ko: { amounts: [300000, 600000, 980000], currency: "krw", symbol: "₩", minAmount: 30000 },
  vi: { amounts: [5000000, 12000000, 24000000], currency: "vnd", symbol: "₫", minAmount: 500000 },
  id: { amounts: [3000000, 7500000, 14900000], currency: "idr", symbol: "Rp", minAmount: 300000 },
  en: USD,
  "en-US": USD,
  "en-UK": GBP,
};

const BY_REGION: Partial<Record<RegionCode, PaymentTiers>> = {
  EU: EUR,
  USA: USD,
  UK: GBP,
  CA: { amounts: [200, 500, 1000], currency: "cad", symbol: "C$", minAmount: 50 },
  ASIA: BY_LOCALE.ja,
  INDIA: { amounts: [10000, 25000, 49000], currency: "inr", symbol: "₹", minAmount: 100 },
};

/** Stripe / UI currency from the visitor's locale (and optional region cookie). */
export function paymentTiersForUser(
  locale: string | null | undefined,
  region?: string | null
): PaymentTiers {
  if (region && region in BY_REGION && BY_REGION[region as RegionCode]) {
    const regional = BY_REGION[region as RegionCode];
    if (regional) return regional;
  }

  const normalized = normalizeLocale(locale);
  const exact = BY_LOCALE[normalized];
  if (exact) return exact;

  const primary = primaryArticleLocale(normalized);
  if (BY_LOCALE[primary]) return BY_LOCALE[primary]!;
  if (EUROZONE.has(primary)) return EUR;

  const listed = GLOBAL_LOCALES.find((item) => item.code === normalized || item.code === primary);
  if (listed?.currency === "CZK") return CZK;
  if (listed?.currency === "EUR") return EUR;
  if (listed?.currency === "USD") return USD;

  return USD;
}

export function paymentLocaleTag(locale: string | null | undefined): GlobalLocaleCode {
  const normalized = normalizeLocale(locale) as LocaleCode;
  const listed = GLOBAL_LOCALES.find((item) => item.code === normalized);
  if (listed) return listed.code;
  const primary = primaryArticleLocale(normalized);
  const byPrimary = GLOBAL_LOCALES.find((item) => item.code === primary);
  if (byPrimary) return byPrimary.code;
  if (primary === "ja") return "ja";
  if (primary === "zh") return "zh-CN";
  return primary === "cs" ? "cs" : "en";
}
