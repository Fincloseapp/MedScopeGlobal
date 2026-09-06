export const LOCALES = [
  "cs",
  "sk",
  "pl",
  "de",
  "fr",
  "it",
  "es",
  "ro",
  "hu",
  "ru",
  "uk",
  "be",
  "zh-CN",
  "ja",
  "ko",
  "vi",
  "id",
  "en",
  "en-US",
  "en-UK",
  "pt",
  "pt-BR",
  "nl",
  "jp",
  "kr",
  "cn",
  "hi",
  "ar",
] as const;

export type LocaleCode = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = "cs";

export const LOCALE_COOKIE = "medscope_locale";

/** Middleware → RSC: path-prefix locale for the current rewritten request. */
export const LOCALE_REQUEST_HEADER = "x-medscope-locale";

/** Original URL path (with locale prefix) so AdSense can stay off pro/admin routes. */
export const PATHNAME_REQUEST_HEADER = "x-medscope-pathname";

/** Set when user picks language in the header — stops auto-sync from device language. */
export const LOCALE_MANUAL_COOKIE = "medscope_locale_manual";

export const REGIONS = ["EU", "USA", "UK", "CA", "ASIA", "INDIA"] as const;
export type RegionCode = (typeof REGIONS)[number];

export const REGION_COOKIE = "medscope_region";

export const REGION_CURRENCY: Record<RegionCode, string> = {
  EU: "EUR",
  USA: "USD",
  UK: "GBP",
  CA: "CAD",
  ASIA: "JPY",
  INDIA: "INR",
};

/** Map common URL / BCP-47 aliases onto LOCALES entries. */
const LOCALE_INPUT_ALIASES: Record<string, LocaleCode> = {
  "en-us": "en-US",
  en_us: "en-US",
  "en-uk": "en-UK",
  en_uk: "en-UK",
  "en-gb": "en-UK",
  "zh-cn": "zh-CN",
  zh_cn: "zh-CN",
  cn: "zh-CN",
  jp: "ja",
  kr: "ko",
  "pt-br": "pt-BR",
  pt_br: "pt-BR",
  "pt-pt": "pt",
  pt_pt: "pt",
};

/**
 * Map a BCP-47 / URL tag onto a supported locale, or `null` when unknown.
 * Exact and alias matches win; otherwise the longest hyphen-prefix so
 * `en-US-x-foo` stays `en-US` instead of collapsing to `en`.
 */
export function resolveSupportedLocale(
  input: string | null | undefined
): LocaleCode | null {
  if (!input?.trim()) return null;
  const lower = input.trim().toLowerCase().replace(/_/g, "-");
  if (lower === "*") return null;

  const aliased = LOCALE_INPUT_ALIASES[lower];
  if (aliased) return aliased;

  const exact = LOCALES.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;

  const ordered = [...LOCALES].sort((a, b) => b.length - a.length);
  const prefix = ordered.find((l) => lower.startsWith(`${l.toLowerCase()}-`));
  return prefix ?? null;
}

/**
 * Normalize a locale string to a supported LocaleCode.
 * Unknown values fall back to the Czech default edition.
 */
export function normalizeLocale(input: string | null | undefined): LocaleCode {
  return resolveSupportedLocale(input) ?? DEFAULT_LOCALE;
}
