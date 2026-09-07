import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";

/** Every public edition — arena hops and IndexNow must cover the subscribe page on each. */
export const ARENA_DISCOVERY_LOCALES = GLOBAL_LOCALES.map((row) => row.code);

export function isArenaDiscoveryLocale(value?: string | null): boolean {
  return ARENA_DISCOVERY_LOCALES.includes(String(value ?? "") as (typeof ARENA_DISCOVERY_LOCALES)[number]);
}
