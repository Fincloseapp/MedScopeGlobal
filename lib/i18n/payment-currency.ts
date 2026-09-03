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
  "pt-BR": { amounts: [990, 1990, 3990], currency: "brl", symbol: "R$", minAmount: 500 },
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

/** Editorial CZK list prices that appear in public copy. Largest first. */
const LISTED_CZK_AMOUNTS = [15000, 5000, 4900, 3900, 1788, 1490, 490, 390, 149, 99] as const;

function listedAmountPattern(czk: number): string {
  const raw = String(czk);
  if (czk >= 1000) {
    const head = raw.slice(0, -3);
    const tail = raw.slice(-3);
    return `(?:${head}[\\s.,\\u00a0]?${tail}|${raw})`;
  }
  return raw;
}

/**
 * Rewrite leftover “99 Kč / 149 CZK” amounts in chrome copy to the edition currency.
 * Czech pages stay as authored (CZK). Does not invent live FX — uses convertCzkToCharge.
 */
export function localizeListedCzk(
  text: string,
  locale?: string | null,
  region?: string | null
): string {
  if (!text) return text;
  if (paymentTiersForUser(locale, region).currency === "czk") return text;

  let out = text.replace(
    /99\s*\/\s*149\s*\/\s*390\s*\/\s*490(?:\s*(?:Kč|CZK))?/g,
    () =>
      [99, 149, 390, 490]
        .map((amount) => formatCzkListPrice(amount, locale, region))
        .join(" / ")
  );

  const mark = "(?:Kč|CZK)";
  for (const czk of LISTED_CZK_AMOUNTS) {
    const formatted = formatCzkListPrice(czk, locale, region);
    const amount = listedAmountPattern(czk);
    const re = new RegExp(
      `(?:${mark}\\s*)?(?<![\\d])${amount}(?![\\d])(?:\\s*[-–]?${mark})?`,
      "g"
    );
    out = out.replace(re, formatted);
  }
  return out;
}

/** Swap leftover CZK / Kč tokens (e.g. “CZK/mois”) after amounts are gone. */
export function localizeCurrencyToken(
  text: string,
  locale?: string | null,
  region?: string | null
): string {
  if (!text) return text;
  const { currency, symbol } = convertCzkToCharge(1, locale, region);
  if (currency === "czk") return text;
  return text.replace(/\bCZK\b/g, currency.toUpperCase()).replace(/\bKč\b/g, symbol);
}

export function localizeListedCzkIn<T>(
  value: T,
  locale?: string | null,
  region?: string | null
): T {
  if (typeof value === "string") {
    return localizeListedCzk(value, locale, region) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => localizeListedCzkIn(item, locale, region)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = localizeListedCzkIn(nested, locale, region);
    }
    return out as T;
  }
  return value;
}
