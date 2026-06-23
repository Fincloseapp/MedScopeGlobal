export const LOCALES = [
  "cs",
  "en",
  "en-US",
  "en-UK",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "nl",
  "pl",
  "hu",
  "sk",
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

export function normalizeLocale(input: string | null | undefined): LocaleCode {
  if (!input) return DEFAULT_LOCALE;
  const lower = input.toLowerCase();
  const match = LOCALES.find(
    (l) => l.toLowerCase() === lower || lower.startsWith(l.toLowerCase())
  );
  return match ?? DEFAULT_LOCALE;
}
