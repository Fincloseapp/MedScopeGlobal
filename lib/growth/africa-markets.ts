/**
 * African ISO countries → existing public editions only.
 * No new locales (no sw/yo/am/ar path). Maghreb uses /fr; Arabic-majority
 * states without a French edition use international /en, never /en-us.
 */

export type AfricaEdition = "fr" | "en" | "pt" | "es";

export const AFRICA_GEO_LOCALE_MAP = {
  SN: "fr",
  CI: "fr",
  CM: "fr",
  CD: "fr",
  CG: "fr",
  GA: "fr",
  ML: "fr",
  BF: "fr",
  BJ: "fr",
  NE: "fr",
  TG: "fr",
  GN: "fr",
  TD: "fr",
  CF: "fr",
  MG: "fr",
  BI: "fr",
  DJ: "fr",
  KM: "fr",
  MA: "fr",
  TN: "fr",
  DZ: "fr",
  RE: "fr",
  YT: "fr",
  NG: "en",
  KE: "en",
  GH: "en",
  ZA: "en",
  UG: "en",
  TZ: "en",
  ZW: "en",
  ZM: "en",
  MW: "en",
  BW: "en",
  NA: "en",
  SL: "en",
  LR: "en",
  GM: "en",
  LS: "en",
  SZ: "en",
  SS: "en",
  RW: "en",
  MU: "en",
  SC: "en",
  EG: "en",
  LY: "en",
  SD: "en",
  SO: "en",
  ER: "en",
  ET: "en",
  AO: "pt",
  MZ: "pt",
  GW: "pt",
  ST: "pt",
  CV: "pt",
  GQ: "es",
} as const satisfies Record<string, AfricaEdition>;

export type AfricaCountryCode = keyof typeof AFRICA_GEO_LOCALE_MAP;

export const AFRICA_DISCOVERY_LOCALES = ["fr", "en", "pt", "es"] as const;

export function africaCountryCodes(): AfricaCountryCode[] {
  return Object.keys(AFRICA_GEO_LOCALE_MAP).sort() as AfricaCountryCode[];
}

export function isAfricaCountry(code?: string | null): code is AfricaCountryCode {
  return Boolean(code && code.toUpperCase() in AFRICA_GEO_LOCALE_MAP);
}

export function africaLocaleForCountry(code: string): AfricaEdition | null {
  const key = code.toUpperCase() as AfricaCountryCode;
  return AFRICA_GEO_LOCALE_MAP[key] ?? null;
}

export type AfricaCoverageRow = {
  country: AfricaCountryCode;
  locale: AfricaEdition;
  cluster: AfricaEdition;
};

export function africaCoverageRows(): AfricaCoverageRow[] {
  return africaCountryCodes().map((country) => {
    const locale = AFRICA_GEO_LOCALE_MAP[country];
    const cluster = AFRICA_DISCOVERY_LOCALES.includes(locale as (typeof AFRICA_DISCOVERY_LOCALES)[number])
      ? (locale as (typeof AFRICA_DISCOVERY_LOCALES)[number])
      : "en";
    return { country, locale, cluster };
  });
}
