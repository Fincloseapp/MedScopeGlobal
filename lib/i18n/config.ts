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
};

/**
 * Normalize a locale string to a supported LocaleCode.
 * Exact / alias matches win; otherwise longest hyphen-prefix match so `en-US`
 * is not collapsed to `en` (LOCALES lists both).
 */
export function normalizeLocale(input: string | null | undefined): LocaleCode {
  if (!input) return DEFAULT_LOCALE;
  const lower = input.toLowerCase().replace(/_/g, "-");

  const aliased = LOCALE_INPUT_ALIASES[lower];
  if (aliased) return aliased;

  const exact = LOCALES.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;

  const ordered = [...LOCALES].sort((a, b) => b.length - a.length);
  const prefix = ordered.find((l) => lower.startsWith(`${l.toLowerCase()}-`));
  return prefix ?? DEFAULT_LOCALE;
}
