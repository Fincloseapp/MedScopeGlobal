/**
 * B2B Exchange regional availability — required on every listing.
 * Distinct from magazine REGIONS (EU/USA/UK/CA/ASIA/INDIA) used for currency.
 */

export const AVAILABILITY_REGIONS = ["EU", "USA", "Asia", "Global"] as const;
export type AvailabilityRegion = (typeof AVAILABILITY_REGIONS)[number];

export const REGION_COOKIE_EXCHANGE = "medscope_exchange_region";

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "IS", "LI", "NO", "CH", "GB", "UK", "AD", "MC", "SM", "VA", "BA", "RS",
  "ME", "MK", "AL", "MD", "UA",
]);

const USA_COUNTRIES = new Set(["US", "PR", "GU", "VI", "AS", "MP"]);

const ASIA_COUNTRIES = new Set([
  "CN", "JP", "KR", "IN", "ID", "TH", "VN", "MY", "SG", "PH", "TW", "HK", "MO",
  "PK", "BD", "LK", "NP", "MM", "KH", "LA", "BN", "MN", "KZ", "UZ", "KG", "TJ",
  "TM", "AF", "IR", "IQ", "SA", "AE", "QA", "KW", "OM", "BH", "JO", "LB", "IL",
  "TR", "AM", "AZ", "GE",
]);

export function isAvailabilityRegion(value: unknown): value is AvailabilityRegion {
  return typeof value === "string" && (AVAILABILITY_REGIONS as readonly string[]).includes(value);
}

export function parseAvailabilityRegions(input: unknown): AvailabilityRegion[] {
  const raw = Array.isArray(input) ? input : input != null ? [input] : [];
  const unique = [...new Set(raw.map((item) => String(item).trim()))].filter(isAvailabilityRegion);
  return unique;
}

/** At least one region is mandatory. Global alone is valid. */
export function requireAvailabilityRegions(input: unknown): AvailabilityRegion[] {
  const regions = parseAvailabilityRegions(input);
  if (regions.length === 0) {
    throw new Error("availability_region_required");
  }
  return normalizeAvailabilityRegions(regions);
}

/** Global supersedes others for matching; keep it as a single token when present. */
export function normalizeAvailabilityRegions(regions: AvailabilityRegion[]): AvailabilityRegion[] {
  if (regions.includes("Global")) return ["Global"];
  return [...new Set(regions)];
}

export function listingMatchesRegions(
  listingRegions: AvailabilityRegion[],
  filterRegions: AvailabilityRegion[]
): boolean {
  if (filterRegions.length === 0) return true;
  const listing = normalizeAvailabilityRegions(listingRegions);
  if (listing.includes("Global")) return true;
  if (filterRegions.includes("Global")) return true;
  return listing.some((region) => filterRegions.includes(region));
}

/** ISO 3166-1 alpha-2 (Cloudflare CF-IPCountry) → marketplace region. */
export function regionFromCountry(countryCode: string | null | undefined): AvailabilityRegion | null {
  const code = countryCode?.trim().toUpperCase();
  if (!code || code.length !== 2) return null;
  if (USA_COUNTRIES.has(code)) return "USA";
  if (EU_COUNTRIES.has(code)) return "EU";
  if (ASIA_COUNTRIES.has(code)) return "Asia";
  return null;
}

export function regionLabel(region: AvailabilityRegion, locale = "en"): string {
  const pack = locale.toLowerCase().startsWith("cs")
    ? "cs"
    : locale.toLowerCase().startsWith("de")
      ? "de"
      : locale.toLowerCase().startsWith("sk")
        ? "sk"
        : locale.toLowerCase().startsWith("pl")
          ? "pl"
          : locale.toLowerCase().startsWith("hu")
            ? "hu"
            : locale.toLowerCase().startsWith("fr")
              ? "fr"
              : locale.toLowerCase().startsWith("it")
                ? "it"
                : locale.toLowerCase().startsWith("es")
                  ? "es"
                  : "en";
  const labels: Record<string, Record<AvailabilityRegion, string>> = {
    cs: { EU: "EU", USA: "USA", Asia: "Asie", Global: "Globálně" },
    sk: { EU: "EÚ", USA: "USA", Asia: "Ázia", Global: "Globálne" },
    pl: { EU: "UE", USA: "USA", Asia: "Azja", Global: "Globalnie" },
    hu: { EU: "EU", USA: "USA", Asia: "Ázsia", Global: "Globális" },
    de: { EU: "EU", USA: "USA", Asia: "Asien", Global: "Global" },
    fr: { EU: "UE", USA: "USA", Asia: "Asie", Global: "Mondial" },
    it: { EU: "UE", USA: "USA", Asia: "Asia", Global: "Globale" },
    es: { EU: "UE", USA: "EE. UU.", Asia: "Asia", Global: "Global" },
    en: { EU: "EU", USA: "USA", Asia: "Asia", Global: "Global" },
  };
  return labels[pack]?.[region] ?? region;
}
