import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale, type LocaleCode, type RegionCode } from "@/lib/i18n/config";
import { intlLocaleFor } from "@/lib/i18n/format-date";

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

/**
 * Stripe / UI currency from the visitor's language edition.
 * Czech page is always CZK; eurozone editions EUR; en-US USD; en-UK GBP.
 * Region cookie only fills gaps for generic English — it never overrides /cs or /fr.
 */
export function paymentTiersForUser(
  locale: string | null | undefined,
  region?: string | null
): PaymentTiers {
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

  if (region && region in BY_REGION && BY_REGION[region as RegionCode]) {
    const regional = BY_REGION[region as RegionCode];
    if (regional) return regional;
  }

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

/** Stripe zero-decimal currencies — unit_amount is the whole major unit. */
export const ZERO_DECIMAL_CURRENCIES = new Set(["jpy", "krw", "vnd", "idr", "huf"]);

/**
 * Editorial CZK per 1 unit of charge currency (list prices stay CZK).
 * Used for display + Stripe price_data so /fr charges EUR, /en-us USD, /cs CZK.
 */
const CZK_PER_UNIT: Record<string, number> = {
  czk: 1,
  eur: 25,
  usd: 23,
  gbp: 29,
  cad: 16.5,
  pln: 5.8,
  ron: 5,
  huf: 0.062,
  rub: 0.25,
  uah: 0.55,
  byn: 7,
  cny: 3.2,
  jpy: 0.155,
  krw: 0.017,
  vnd: 0.0009,
  idr: 0.0014,
  inr: 0.27,
};

export type ChargeAmount = {
  currency: string;
  symbol: string;
  unitAmount: number;
  major: number;
  formatted: string;
};

export function isZeroDecimalCurrency(currency: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase());
}

/** Convert a CZK list price into the visitor's charge currency (locale + optional region). */
export function convertCzkToCharge(
  czkMajor: number,
  locale?: string | null,
  region?: string | null
): ChargeAmount {
  const tiers = paymentTiersForUser(locale, region);
  const currency = tiers.currency.toLowerCase();
  const perUnit = CZK_PER_UNIT[currency] ?? CZK_PER_UNIT.usd!;
  const majorRaw = czkMajor / perUnit;
  const unitAmount = isZeroDecimalCurrency(currency)
    ? Math.max(1, Math.round(majorRaw))
    : Math.max(1, Math.round(majorRaw * 100));
  const major = isZeroDecimalCurrency(currency) ? unitAmount : unitAmount / 100;
  return {
    currency,
    symbol: tiers.symbol,
    unitAmount,
    major,
    formatted: formatChargeAmount(unitAmount, currency, locale, tiers.symbol),
  };
}

export function formatChargeAmount(
  unitAmount: number,
  currency: string,
  locale?: string | null,
  symbol?: string
): string {
  const ccy = currency.toLowerCase();
  const major = isZeroDecimalCurrency(ccy) ? unitAmount : unitAmount / 100;
  try {
    return new Intl.NumberFormat(intlLocaleFor(locale), {
      style: "currency",
      currency: ccy.toUpperCase(),
      maximumFractionDigits: isZeroDecimalCurrency(ccy) ? 0 : 2,
    }).format(major);
  } catch {
    const rounded = isZeroDecimalCurrency(ccy) ? String(Math.round(major)) : major.toFixed(2);
    return `${rounded} ${symbol ?? ccy.toUpperCase()}`;
  }
}

export function formatCzkListPrice(
  czkMajor: number,
  locale?: string | null,
  region?: string | null
): string {
  return convertCzkToCharge(czkMajor, locale, region).formatted;
}
