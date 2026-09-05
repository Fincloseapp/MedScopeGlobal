import { localeFromCountry } from "@/lib/ecosystem/locales";
import {
  DEFAULT_LOCALE,
  LOCALES,
  resolveSupportedLocale,
  type LocaleCode,
} from "@/lib/i18n/config";

/**
 * Parse Accept-Language (browser / OS language) and pick the best site locale.
 * Longer / aliased tags win (`cs-CZ` → `cs`, `en-GB` → `en-UK`, `zh` → `zh-CN`).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
 */
export function detectLocaleFromAcceptLanguage(
  acceptLanguage: string | null | undefined
): LocaleCode {
  return firstMatchingLocale(acceptLanguage) ?? DEFAULT_LOCALE;
}

/**
 * Bare domain / unprefixed public URLs follow the device language first.
 * Cloudflare country is only a tie-breaker: generic `en` or a missing
 * Accept-Language from the US/CA opens English (USA). A Czech phone in
 * the US stays `/cs`. Search bots stay on the Czech x-default edition.
 * Explicit prefixes (`/cs`, `/en-us`) are never rewritten here.
 */
export function localeForUnprefixedEntry(
  acceptLanguage: string | null | undefined,
  isBot: boolean,
  countryCode?: string | null
): LocaleCode {
  if (isBot) return DEFAULT_LOCALE;

  const matched = firstMatchingLocale(acceptLanguage);
  const geo = countryCode?.trim()
    ? (localeFromCountry(countryCode) as LocaleCode)
    : null;

  if (matched && matched !== "en") return matched;
  if (geo && (!matched || matched === "en")) return geo;
  return matched ?? DEFAULT_LOCALE;
}

function firstMatchingLocale(
  acceptLanguage: string | null | undefined
): LocaleCode | null {
  if (!acceptLanguage?.trim()) return null;

  const preferences = acceptLanguage
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const qPart = params.find((p) => p.trim().toLowerCase().startsWith("q="));
      const q = qPart ? Number.parseFloat(qPart.trim().slice(2)) : 1;
      return { tag: rawTag.trim(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((item) => item.tag && item.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferences) {
    const matched = matchLocaleTag(tag);
    if (matched) return matched;
  }

  return null;
}

function matchLocaleTag(tag: string): LocaleCode | null {
  const supported = resolveSupportedLocale(tag);
  if (supported) return supported;

  const base = tag.split(/[-_]/)[0]?.toLowerCase();
  if (!base) return null;

  const baseExact = resolveSupportedLocale(base);
  if (baseExact) return baseExact;

  return LOCALES.find((l) => l.toLowerCase().startsWith(`${base}-`)) ?? null;
}
