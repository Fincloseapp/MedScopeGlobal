/**
 * Locale / region → local checkout for affiliate products.
 *
 * Rule: language mutation first, then region cookie (generic English only).
 * Global catalogue (magnesium, D3+K2, sleep tracker) is shown everywhere;
 * the outbound URL is always the local marketplace so checkout friction stays low.
 *
 * CZ/SK → Heureka (Amazon has no .cz/.sk store).
 * PL/DE/FR/IT/ES/UK/US/JP → Amazon local storefront.
 * Other EU locales (RO, HU, NL) → Amazon.de (ships across the EU).
 * Remaining locales → Amazon.com (widest catalogue, highest typical EPC).
 */

import { normalizeLocale, type RegionCode } from "@/lib/i18n/config";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";

export type AffiliateMarketId =
  | "heureka-cz"
  | "heureka-sk"
  | "amazon-de"
  | "amazon-fr"
  | "amazon-it"
  | "amazon-es"
  | "amazon-pl"
  | "amazon-uk"
  | "amazon-us"
  | "amazon-jp";

export type AffiliateContext = {
  locale?: string | null;
  region?: string | null;
  country?: string | null;
};

export const AFFILIATE_PRODUCT_IDS = [
  "magnesium-glycinate",
  "omega-3-test",
  "sleep-tracker",
  "vitamin-d3-k2",
] as const;

export type AffiliateProductId = (typeof AFFILIATE_PRODUCT_IDS)[number];

const LOCALE_MARKET: Record<string, AffiliateMarketId> = {
  cs: "heureka-cz",
  sk: "heureka-sk",
  pl: "amazon-pl",
  de: "amazon-de",
  fr: "amazon-fr",
  it: "amazon-it",
  es: "amazon-es",
  pt: "amazon-es",
  nl: "amazon-de",
  ro: "amazon-de",
  hu: "amazon-de",
  ja: "amazon-jp",
  jp: "amazon-jp",
  "en-US": "amazon-us",
  "en-UK": "amazon-uk",
  "en-GB": "amazon-uk",
};

const REGION_MARKET: Record<string, AffiliateMarketId> = {
  USA: "amazon-us",
  UK: "amazon-uk",
  CA: "amazon-us",
  EU: "amazon-de",
  ASIA: "amazon-jp",
  INDIA: "amazon-us",
};

const COUNTRY_MARKET: Record<string, AffiliateMarketId> = {
  CZ: "heureka-cz",
  SK: "heureka-sk",
  PL: "amazon-pl",
  DE: "amazon-de",
  AT: "amazon-de",
  CH: "amazon-de",
  FR: "amazon-fr",
  BE: "amazon-fr",
  IT: "amazon-it",
  ES: "amazon-es",
  PT: "amazon-es",
  GB: "amazon-uk",
  UK: "amazon-uk",
  US: "amazon-us",
  JP: "amazon-jp",
  NL: "amazon-de",
  RO: "amazon-de",
  HU: "amazon-de",
};

const SUFFIX_MARKET: Record<string, AffiliateMarketId> = {
  cz: "heureka-cz",
  sk: "heureka-sk",
  de: "amazon-de",
  fr: "amazon-fr",
  it: "amazon-it",
  es: "amazon-es",
  pl: "amazon-pl",
  en: "amazon-uk",
  us: "amazon-us",
  uk: "amazon-uk",
  jp: "amazon-jp",
  ja: "amazon-jp",
};

const SLUG_TO_PRODUCT: Record<string, AffiliateProductId> = {
  magnesium: "magnesium-glycinate",
  "magnesium-glycinate": "magnesium-glycinate",
  mg: "magnesium-glycinate",
  omega: "omega-3-test",
  "omega-3-test": "omega-3-test",
  "omega-3": "omega-3-test",
  sleep: "sleep-tracker",
  "sleep-tracker": "sleep-tracker",
  d3: "vitamin-d3-k2",
  "vitamin-d3-k2": "vitamin-d3-k2",
  "d3-k2": "vitamin-d3-k2",
};

/** Local search queries — what people actually type on that storefront. */
const PRODUCT_QUERIES: Record<AffiliateProductId, Record<AffiliateMarketId, string>> = {
  "magnesium-glycinate": {
    "heureka-cz": "magnesium glycinát",
    "heureka-sk": "horčík glycinát",
    "amazon-de": "Magnesiumglycinat",
    "amazon-fr": "magnésium glycinate",
    "amazon-it": "magnesio glicinato",
    "amazon-es": "magnesio glicinato",
    "amazon-pl": "magnez bisglicynian",
    "amazon-uk": "magnesium glycinate",
    "amazon-us": "magnesium glycinate",
    "amazon-jp": "magnesium glycinate",
  },
  "omega-3-test": {
    "heureka-cz": "omega 3",
    "heureka-sk": "omega 3",
    "amazon-de": "omega 3 kapseln",
    "amazon-fr": "oméga 3",
    "amazon-it": "omega 3",
    "amazon-es": "omega 3",
    "amazon-pl": "omega 3",
    "amazon-uk": "omega 3 index test",
    "amazon-us": "omega 3 index test",
    "amazon-jp": "omega 3",
  },
  "sleep-tracker": {
    "heureka-cz": "sleep tracker",
    "heureka-sk": "sleep tracker",
    "amazon-de": "sleep tracker HRV",
    "amazon-fr": "tracker sommeil",
    "amazon-it": "tracker sonno",
    "amazon-es": "tracker sueño",
    "amazon-pl": "tracker snu",
    "amazon-uk": "sleep tracker HRV",
    "amazon-us": "oura ring",
    "amazon-jp": "sleep tracker",
  },
  "vitamin-d3-k2": {
    "heureka-cz": "vitamin D3 K2",
    "heureka-sk": "vitamín D3 K2",
    "amazon-de": "Vitamin D3 K2",
    "amazon-fr": "vitamine D3 K2",
    "amazon-it": "vitamina D3 K2",
    "amazon-es": "vitamina D3 K2",
    "amazon-pl": "witamina D3 K2",
    "amazon-uk": "vitamin D3 K2",
    "amazon-us": "vitamin D3 K2",
    "amazon-jp": "vitamin D3 K2",
  },
};

const AMAZON_HOST: Record<
  Exclude<AffiliateMarketId, "heureka-cz" | "heureka-sk">,
  string
> = {
  "amazon-de": "www.amazon.de",
  "amazon-fr": "www.amazon.fr",
  "amazon-it": "www.amazon.it",
  "amazon-es": "www.amazon.es",
  "amazon-pl": "www.amazon.pl",
  "amazon-uk": "www.amazon.co.uk",
  "amazon-us": "www.amazon.com",
  "amazon-jp": "www.amazon.co.jp",
};

const AMAZON_TAG_ENV: Record<string, string> = {
  "www.amazon.com": "AFFILIATE_AMAZON_TAG_US",
  "www.amazon.co.uk": "AFFILIATE_AMAZON_TAG_UK",
  "www.amazon.de": "AFFILIATE_AMAZON_TAG_DE",
  "www.amazon.fr": "AFFILIATE_AMAZON_TAG_FR",
  "www.amazon.it": "AFFILIATE_AMAZON_TAG_IT",
  "www.amazon.es": "AFFILIATE_AMAZON_TAG_ES",
  "www.amazon.pl": "AFFILIATE_AMAZON_TAG_PL",
  "www.amazon.co.jp": "AFFILIATE_AMAZON_TAG_JP",
};

const AMAZON_HOST_RE =
  /(^|\.)amazon\.(com|co\.uk|co\.jp|de|fr|it|es|pl|com\.au|ca|in)\b/i;

export function resolveAffiliateMarket(ctx: AffiliateContext = {}): AffiliateMarketId {
  const rawLocale = (ctx.locale ?? "").trim();
  if (rawLocale && LOCALE_MARKET[rawLocale]) return LOCALE_MARKET[rawLocale];

  if (rawLocale) {
    try {
      const primary = primaryArticleLocale(normalizeLocale(rawLocale));
      if (LOCALE_MARKET[primary]) return LOCALE_MARKET[primary];
      if (primary === "en") {
        const region = (ctx.region ?? "").trim() as RegionCode | "";
        if (region && REGION_MARKET[region]) return REGION_MARKET[region];
      }
    } catch {
      /* fall through */
    }
  }

  const country = (ctx.country ?? "").trim().toUpperCase();
  if (country && COUNTRY_MARKET[country]) return COUNTRY_MARKET[country];

  const region = (ctx.region ?? "").trim();
  if (region && REGION_MARKET[region]) return REGION_MARKET[region];

  return "amazon-us";
}

export function parseAffiliateSlug(slug: string): {
  productId: AffiliateProductId;
  market?: AffiliateMarketId;
} | null {
  const key = slug.trim().toLowerCase();
  if (!key) return null;

  if (SLUG_TO_PRODUCT[key]) {
    return { productId: SLUG_TO_PRODUCT[key] };
  }

  const dash = key.lastIndexOf("-");
  if (dash > 0) {
    const suffix = key.slice(dash + 1);
    const prefix = key.slice(0, dash);
    const market = SUFFIX_MARKET[suffix];
    const productId = SLUG_TO_PRODUCT[prefix];
    if (market && productId) return { productId, market };
  }

  return null;
}

function marketplaceSearchUrl(market: AffiliateMarketId, query: string): string {
  const encoded = encodeURIComponent(query);
  if (market === "heureka-cz") {
    return `https://www.heureka.cz/?h%5Bfraze%5D=${encoded}`;
  }
  if (market === "heureka-sk") {
    return `https://www.heureka.sk/?h%5Bfraze%5D=${encoded}`;
  }
  const host = AMAZON_HOST[market];
  return `https://${host}/s?k=${encoded}`;
}

export function amazonTagForHost(hostname: string): string {
  const host = hostname.replace(/^www\./, "www.").toLowerCase();
  const envName = AMAZON_TAG_ENV[host] ?? AMAZON_TAG_ENV[`www.${host}`];
  const specific = envName ? (process.env[envName] ?? "").trim() : "";
  if (specific) return specific;
  return (process.env.AFFILIATE_AMAZON_TAG ?? "").trim();
}

export function applyAmazonAssociateTag(url: string, tag?: string | null): string {
  try {
    const parsed = new URL(url);
    if (!AMAZON_HOST_RE.test(parsed.hostname)) return url;
    const affiliateTag = (tag ?? amazonTagForHost(parsed.hostname)).trim();
    if (!affiliateTag) return url;
    parsed.searchParams.set("tag", affiliateTag);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function affiliateDestinationForProduct(
  productId: AffiliateProductId,
  ctx: AffiliateContext = {},
  marketOverride?: AffiliateMarketId
): string {
  const market = marketOverride ?? resolveAffiliateMarket(ctx);
  const query = PRODUCT_QUERIES[productId][market];
  return applyAmazonAssociateTag(marketplaceSearchUrl(market, query));
}

export function resolveAffiliateDestination(
  slug: string,
  ctx: AffiliateContext = {}
): string | null {
  const parsed = parseAffiliateSlug(slug);
  if (!parsed) return null;
  return affiliateDestinationForProduct(parsed.productId, ctx, parsed.market);
}

/** In-site tracked hop — locale query keeps /go/ on the local storefront. */
export function affiliateGoPath(productId: string, locale: string): string {
  const loc = encodeURIComponent(locale || "en");
  return `/go/${productId}?locale=${loc}`;
}

export function isLocalCheckoutMarket(market: AffiliateMarketId): boolean {
  return market === "heureka-cz" || market === "heureka-sk";
}
