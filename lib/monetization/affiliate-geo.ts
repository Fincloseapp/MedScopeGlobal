/**
 * Locale / region → local checkout for affiliate products.
 *
 * Rule: language mutation first, then region cookie (generic English only).
 * Global catalogue (magnesium, D3+K2, sleep tracker) is shown everywhere;
 * the outbound URL is always the local marketplace so checkout friction stays low.
 *
 * CZ → Heureka.cz (Trixam 282255 on a clean search URL). SK still waits for its own id.
 * Untagged Heureka URLs fall back to Amazon.de with language=cs (Czech UI).
 * PL/DE/FR/IT/ES/UK/US/JP → Amazon local storefront.
 * Other EU locales (RO, HU, NL) → Amazon.de (ships across the EU).
 * Remaining locales → Amazon.com (widest catalogue, highest typical EPC).
 */

import { normalizeLocale, type RegionCode } from "@/lib/i18n/config";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import {
  applyHeurekaHaff,
  heurekaUrlHasHaff,
  resolveHeurekaHaffSync,
} from "@/lib/monetization/heureka-affiliate";

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
  "creatine-monohydrate",
  "collagen-peptides",
  "electrolyte-powder",
  "sleep-mask",
  "blood-pressure-monitor",
  "resistance-bands",
  "protein-powder",
  "probiotic",
  "zinc",
  "foam-roller",
  "yoga-mat",
  "glass-water-bottle",
  "blue-light-glasses",
  "weighted-blanket",
  "coq10",
  "grip-strengthener",
  "sunrise-alarm",
  "walking-pad",
  "tart-cherry",
  "kitchen-scale",
  "mineral-spf",
  "retinoid-serum",
  "vitamin-c-serum",
  "ceramide-moisturizer",
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
  creatine: "creatine-monohydrate",
  "creatine-monohydrate": "creatine-monohydrate",
  collagen: "collagen-peptides",
  "collagen-peptides": "collagen-peptides",
  electrolyte: "electrolyte-powder",
  "electrolyte-powder": "electrolyte-powder",
  "sleep-mask": "sleep-mask",
  mask: "sleep-mask",
  "blood-pressure-monitor": "blood-pressure-monitor",
  "blood-pressure": "blood-pressure-monitor",
  tlak: "blood-pressure-monitor",
  "resistance-bands": "resistance-bands",
  bands: "resistance-bands",
  protein: "protein-powder",
  "protein-powder": "protein-powder",
  probiotic: "probiotic",
  zinc: "zinc",
  "foam-roller": "foam-roller",
  roller: "foam-roller",
  "yoga-mat": "yoga-mat",
  yoga: "yoga-mat",
  "glass-water-bottle": "glass-water-bottle",
  bottle: "glass-water-bottle",
  "blue-light-glasses": "blue-light-glasses",
  glasses: "blue-light-glasses",
  "weighted-blanket": "weighted-blanket",
  blanket: "weighted-blanket",
  coq10: "coq10",
  q10: "coq10",
  "grip-strengthener": "grip-strengthener",
  grip: "grip-strengthener",
  "sunrise-alarm": "sunrise-alarm",
  alarm: "sunrise-alarm",
  "walking-pad": "walking-pad",
  walk: "walking-pad",
  "tart-cherry": "tart-cherry",
  cherry: "tart-cherry",
  "kitchen-scale": "kitchen-scale",
  scale: "kitchen-scale",
  "mineral-spf": "mineral-spf",
  spf: "mineral-spf",
  sunscreen: "mineral-spf",
  "retinoid-serum": "retinoid-serum",
  retinol: "retinoid-serum",
  "vitamin-c-serum": "vitamin-c-serum",
  "ceramide-moisturizer": "ceramide-moisturizer",
  ceramide: "ceramide-moisturizer",
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
  "creatine-monohydrate": {
    "heureka-cz": "kreatin monohydrát",
    "heureka-sk": "kreatín monohydrát",
    "amazon-de": "Kreatin Monohydrat",
    "amazon-fr": "créatine monohydrate",
    "amazon-it": "creatina monoidrato",
    "amazon-es": "creatina monohidrato",
    "amazon-pl": "kreatyna monohydrat",
    "amazon-uk": "creatine monohydrate",
    "amazon-us": "creatine monohydrate",
    "amazon-jp": "creatine monohydrate",
  },
  "collagen-peptides": {
    "heureka-cz": "kolagen peptidy",
    "heureka-sk": "kolagén peptidy",
    "amazon-de": "Kollagen Peptide",
    "amazon-fr": "collagène peptides",
    "amazon-it": "collagene peptidi",
    "amazon-es": "colágeno péptidos",
    "amazon-pl": "kolagen peptydy",
    "amazon-uk": "collagen peptides",
    "amazon-us": "collagen peptides",
    "amazon-jp": "collagen peptides",
  },
  "electrolyte-powder": {
    "heureka-cz": "elektrolyty prášek",
    "heureka-sk": "elektrolyty prášok",
    "amazon-de": "Elektrolyte Pulver",
    "amazon-fr": "électrolytes poudre",
    "amazon-it": "elettroliti polvere",
    "amazon-es": "electrolitos polvo",
    "amazon-pl": "elektrolity proszek",
    "amazon-uk": "electrolyte powder",
    "amazon-us": "electrolyte powder",
    "amazon-jp": "electrolyte powder",
  },
  "sleep-mask": {
    "heureka-cz": "maska na spaní",
    "heureka-sk": "maska na spanie",
    "amazon-de": "Schlafmaske",
    "amazon-fr": "masque de sommeil",
    "amazon-it": "mascherina sonno",
    "amazon-es": "antifaz dormir",
    "amazon-pl": "opaska na oczy sen",
    "amazon-uk": "sleep mask",
    "amazon-us": "sleep mask",
    "amazon-jp": "sleep mask",
  },
  "blood-pressure-monitor": {
    "heureka-cz": "tlakoměr paže",
    "heureka-sk": "tlakomer rameno",
    "amazon-de": "Blutdruckmessgerät Oberarm",
    "amazon-fr": "tensiomètre bras",
    "amazon-it": "misuratore pressione braccio",
    "amazon-es": "tensiómetro brazo",
    "amazon-pl": "ciśnieniomierz ramię",
    "amazon-uk": "blood pressure monitor upper arm",
    "amazon-us": "blood pressure monitor upper arm",
    "amazon-jp": "blood pressure monitor",
  },
  "resistance-bands": {
    "heureka-cz": "odporové gumy",
    "heureka-sk": "odporové gumy",
    "amazon-de": "Fitnessbänder Widerstand",
    "amazon-fr": "élastiques musculation",
    "amazon-it": "bande elastiche fitness",
    "amazon-es": "bandas elásticas fitness",
    "amazon-pl": "taśmy oporowe",
    "amazon-uk": "resistance bands",
    "amazon-us": "resistance bands",
    "amazon-jp": "resistance bands",
  },
  "protein-powder": {
    "heureka-cz": "proteinový prášek",
    "heureka-sk": "proteínový prášok",
    "amazon-de": "Proteinpulver",
    "amazon-fr": "protéine poudre",
    "amazon-it": "proteine in polvere",
    "amazon-es": "proteína en polvo",
    "amazon-pl": "białko w proszku",
    "amazon-uk": "protein powder",
    "amazon-us": "protein powder",
    "amazon-jp": "protein powder",
  },
  probiotic: {
    "heureka-cz": "probiotika",
    "heureka-sk": "probiotiká",
    "amazon-de": "Probiotika",
    "amazon-fr": "probiotiques",
    "amazon-it": "probiotici",
    "amazon-es": "probióticos",
    "amazon-pl": "probiotyki",
    "amazon-uk": "probiotic",
    "amazon-us": "probiotic",
    "amazon-jp": "probiotic",
  },
  zinc: {
    "heureka-cz": "zinek tablety",
    "heureka-sk": "zinok tablety",
    "amazon-de": "Zink Tabletten",
    "amazon-fr": "zinc comprimé",
    "amazon-it": "zinco compresse",
    "amazon-es": "zinc comprimidos",
    "amazon-pl": "cynk tabletki",
    "amazon-uk": "zinc tablets",
    "amazon-us": "zinc tablets",
    "amazon-jp": "zinc",
  },
  "foam-roller": {
    "heureka-cz": "foam roller",
    "heureka-sk": "foam roller",
    "amazon-de": "Faszienrolle",
    "amazon-fr": "rouleau fascia",
    "amazon-it": "foam roller",
    "amazon-es": "rodillo fascia",
    "amazon-pl": "roller do masażu",
    "amazon-uk": "foam roller",
    "amazon-us": "foam roller",
    "amazon-jp": "foam roller",
  },
  "yoga-mat": {
    "heureka-cz": "podložka na jógu",
    "heureka-sk": "podložka na jogu",
    "amazon-de": "Yogamatte",
    "amazon-fr": "tapis de yoga",
    "amazon-it": "tappetino yoga",
    "amazon-es": "esterilla yoga",
    "amazon-pl": "mata do jogi",
    "amazon-uk": "yoga mat",
    "amazon-us": "yoga mat",
    "amazon-jp": "yoga mat",
  },
  "glass-water-bottle": {
    "heureka-cz": "skleněná lahev na vodu",
    "heureka-sk": "sklenená fľaša na vodu",
    "amazon-de": "Glasflasche Wasser",
    "amazon-fr": "bouteille verre eau",
    "amazon-it": "bottiglia vetro acqua",
    "amazon-es": "botella cristal agua",
    "amazon-pl": "butelka szklana",
    "amazon-uk": "glass water bottle",
    "amazon-us": "glass water bottle",
    "amazon-jp": "glass water bottle",
  },
  "blue-light-glasses": {
    "heureka-cz": "brýle proti modrému světlu",
    "heureka-sk": "okuliare proti modrému svetlu",
    "amazon-de": "Blaulichtfilter Brille",
    "amazon-fr": "lunettes lumière bleue",
    "amazon-it": "occhiali luce blu",
    "amazon-es": "gafas luz azul",
    "amazon-pl": "okulary niebieskie światło",
    "amazon-uk": "blue light glasses",
    "amazon-us": "blue light glasses",
    "amazon-jp": "blue light glasses",
  },
  "weighted-blanket": {
    "heureka-cz": "zátěžová deka",
    "heureka-sk": "záťažová deka",
    "amazon-de": "Gewichtsdecke",
    "amazon-fr": "couverture lestée",
    "amazon-it": "coperta ponderata",
    "amazon-es": "manta pesada",
    "amazon-pl": "kołdra obciążeniowa",
    "amazon-uk": "weighted blanket",
    "amazon-us": "weighted blanket",
    "amazon-jp": "weighted blanket",
  },
  coq10: {
    "heureka-cz": "koenzym Q10",
    "heureka-sk": "koenzým Q10",
    "amazon-de": "Coenzym Q10",
    "amazon-fr": "coenzyme Q10",
    "amazon-it": "coenzima Q10",
    "amazon-es": "coenzima Q10",
    "amazon-pl": "koenzym Q10",
    "amazon-uk": "coq10",
    "amazon-us": "coq10",
    "amazon-jp": "coq10",
  },
  "grip-strengthener": {
    "heureka-cz": "posilovač stisku",
    "heureka-sk": "posilňovač stisku",
    "amazon-de": "Handtrainer",
    "amazon-fr": "poignée musculation",
    "amazon-it": "hand grip",
    "amazon-es": "ejercitador mano",
    "amazon-pl": "ściskacz do rąk",
    "amazon-uk": "grip strengthener",
    "amazon-us": "grip strengthener",
    "amazon-jp": "grip strengthener",
  },
  "sunrise-alarm": {
    "heureka-cz": "světelný budík",
    "heureka-sk": "svetelný budík",
    "amazon-de": "Lichtwecker",
    "amazon-fr": "réveil lumineux",
    "amazon-it": "sveglia luminosa",
    "amazon-es": "despertador luz",
    "amazon-pl": "budzik świetlny",
    "amazon-uk": "sunrise alarm clock",
    "amazon-us": "sunrise alarm clock",
    "amazon-jp": "sunrise alarm",
  },
  "walking-pad": {
    "heureka-cz": "walking pad",
    "heureka-sk": "walking pad",
    "amazon-de": "Walking Pad",
    "amazon-fr": "tapis de marche",
    "amazon-it": "walking pad",
    "amazon-es": "cinta caminar",
    "amazon-pl": "walking pad",
    "amazon-uk": "walking pad",
    "amazon-us": "walking pad",
    "amazon-jp": "walking pad",
  },
  "tart-cherry": {
    "heureka-cz": "višňový extrakt",
    "heureka-sk": "višňový extrakt",
    "amazon-de": "Sauerkirsche Extrakt",
    "amazon-fr": "cerise acide",
    "amazon-it": "ciliegia acida",
    "amazon-es": "cereza ácida",
    "amazon-pl": "wiśnia tart cherry",
    "amazon-uk": "tart cherry",
    "amazon-us": "tart cherry",
    "amazon-jp": "tart cherry",
  },
  "kitchen-scale": {
    "heureka-cz": "kuchyňská váha",
    "heureka-sk": "kuchynská váha",
    "amazon-de": "Küchenwaage",
    "amazon-fr": "balance de cuisine",
    "amazon-it": "bilancia cucina",
    "amazon-es": "báscula cocina",
    "amazon-pl": "waga kuchenna",
    "amazon-uk": "kitchen scale",
    "amazon-us": "kitchen scale",
    "amazon-jp": "kitchen scale",
  },
  "mineral-spf": {
    "heureka-cz": "minerální opalovací krém SPF 50",
    "heureka-sk": "minerálny opaľovací krém SPF 50",
    "amazon-de": "mineralischer Sonnenschutz SPF 50",
    "amazon-fr": "écran solaire minéral SPF 50",
    "amazon-it": "solare minerale SPF 50",
    "amazon-es": "protector solar mineral SPF 50",
    "amazon-pl": "mineralny krem SPF 50",
    "amazon-uk": "mineral sunscreen SPF 50",
    "amazon-us": "mineral sunscreen SPF 50",
    "amazon-jp": "mineral sunscreen SPF 50",
  },
  "retinoid-serum": {
    "heureka-cz": "retinol sérum",
    "heureka-sk": "retinol sérum",
    "amazon-de": "Retinol Serum",
    "amazon-fr": "sérum rétinol",
    "amazon-it": "siero retinolo",
    "amazon-es": "sérum retinol",
    "amazon-pl": "serum retinol",
    "amazon-uk": "retinol serum",
    "amazon-us": "retinol serum",
    "amazon-jp": "retinol serum",
  },
  "vitamin-c-serum": {
    "heureka-cz": "sérum vitamin C",
    "heureka-sk": "sérum vitamín C",
    "amazon-de": "Vitamin C Serum",
    "amazon-fr": "sérum vitamine C",
    "amazon-it": "siero vitamina C",
    "amazon-es": "sérum vitamina C",
    "amazon-pl": "serum witamina C",
    "amazon-uk": "vitamin C serum",
    "amazon-us": "vitamin C serum",
    "amazon-jp": "vitamin C serum",
  },
  "ceramide-moisturizer": {
    "heureka-cz": "krém s ceramidy",
    "heureka-sk": "krém s ceramidmi",
    "amazon-de": "Ceramide Creme",
    "amazon-fr": "crème céramides",
    "amazon-it": "crema ceramidi",
    "amazon-es": "crema ceramidas",
    "amazon-pl": "krem ceramidy",
    "amazon-uk": "ceramide moisturizer",
    "amazon-us": "ceramide moisturizer",
    "amazon-jp": "ceramide cream",
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

function wantsAmazonDeCzechUi(locale?: string | null): boolean {
  const key = (locale ?? "").toLowerCase();
  return key === "cs" || key.startsWith("cs-") || key === "sk" || key.startsWith("sk-");
}

function marketplaceSearchUrl(
  market: AffiliateMarketId,
  query: string,
  locale?: string | null
): string {
  const encoded = encodeURIComponent(query);
  if (market === "heureka-cz") {
    return `https://www.heureka.cz/?h%5Bfraze%5D=${encoded}`;
  }
  if (market === "heureka-sk") {
    return `https://www.heureka.sk/?h%5Bfraze%5D=${encoded}`;
  }
  const host = AMAZON_HOST[market];
  const url = new URL(`https://${host}/s`);
  url.searchParams.set("k", query);
  if (market === "amazon-de" && wantsAmazonDeCzechUi(locale)) {
    url.searchParams.set("language", "cs");
  }
  return url.toString();
}

/** Untracked Heureka search → Amazon.de (Czech UI). Tagged haff URLs stay on Heureka. */
export function fallbackUntrackedHeurekaToAmazonDe(
  url: string,
  locale?: string | null
): string {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)heureka\.(cz|sk)$/i.test(parsed.hostname)) return url;
    if (heurekaUrlHasHaff(url)) return url;
    const query =
      parsed.searchParams.get("h[fraze]") ||
      parsed.searchParams.get("h%5Bfraze%5D") ||
      "magnesium glycinate";
    return applyAmazonAssociateTag(marketplaceSearchUrl("amazon-de", query, locale ?? "cs"));
  } catch {
    return url;
  }
}

export function amazonTagForHost(hostname: string): string {
  const host = hostname.replace(/^www\./, "www.").toLowerCase();
  const envName = AMAZON_TAG_ENV[host] ?? AMAZON_TAG_ENV[`www.${host}`];
  const specific = envName ? (process.env[envName] ?? "").trim() : "";
  if (specific) return specific;
  return (process.env.AFFILIATE_AMAZON_TAG ?? "").trim();
}

/**
 * Optional legacy wrap (`{url}` / `{q}`), then official Přímý odkaz (`haff=`).
 */
export function applyHeurekaTracking(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isCz = /(^|\.)heureka\.cz$/i.test(host);
    const isSk = /(^|\.)heureka\.sk$/i.test(host);
    if (!isCz && !isSk) return url;
    const template = (
      isSk ? process.env.AFFILIATE_HEUREKA_SK_TEMPLATE : process.env.AFFILIATE_HEUREKA_CZ_TEMPLATE
    )?.trim();
    if (template && !/data-trixam-positionid|heureka-affiliate-link|haff=/i.test(template)) {
      if (template.includes("{url}")) {
        return template.split("{url}").join(encodeURIComponent(url));
      }
      if (template.includes("{q}")) {
        const q =
          parsed.searchParams.get("h[fraze]") ??
          parsed.searchParams.get("h%5Bfraze%5D") ??
          "";
        return template.split("{q}").join(encodeURIComponent(q));
      }
    }
    const haff = resolveHeurekaHaffSync(isSk ? "sk" : "cz");
    return haff ? applyHeurekaHaff(url, haff) : url;
  } catch {
    return url;
  }
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
  const raw = marketplaceSearchUrl(market, query, ctx.locale);
  return applyAmazonAssociateTag(applyHeurekaTracking(raw));
}

export function resolveAffiliateDestination(
  slug: string,
  ctx: AffiliateContext = {}
): string | null {
  const parsed = parseAffiliateSlug(slug);
  if (!parsed) return null;
  return affiliateDestinationForProduct(parsed.productId, ctx, parsed.market);
}

/**
 * Public card href. Keep it on-site and clean — no Heureka/Amazon query string.
 * Pass `{ carryLocale: true }` for email, where cookies are missing.
 */
export function affiliateGoPath(
  productId: string,
  locale?: string,
  options?: { carryLocale?: boolean }
): string {
  const id = String(productId || "").trim().toLowerCase();
  if (!id) return "/";
  if (options?.carryLocale && locale) {
    return `/go/${encodeURIComponent(id)}?locale=${encodeURIComponent(locale)}`;
  }
  return `/go/${encodeURIComponent(id)}`;
}

export function isLocalCheckoutMarket(market: AffiliateMarketId): boolean {
  return market === "heureka-cz" || market === "heureka-sk";
}
