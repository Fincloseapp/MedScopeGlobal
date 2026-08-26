import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { normalizeLocale } from "@/lib/i18n/config";

/** URL path segment for each global locale (lowercase, spec aliases cn/jp/kr/en-us). */
const LOCALE_TO_SEGMENT: Record<GlobalLocaleCode, string> = {
  cs: "cs",
  sk: "sk",
  pl: "pl",
  de: "de",
  fr: "fr",
  it: "it",
  es: "es",
  ro: "ro",
  hu: "hu",
  ru: "ru",
  uk: "uk",
  be: "be",
  "zh-CN": "cn",
  ja: "jp",
  ko: "kr",
  vi: "vi",
  id: "id",
  en: "en",
  "en-US": "en-us",
};

const SEGMENT_TO_LOCALE: Record<string, GlobalLocaleCode> = {
  cs: "cs",
  sk: "sk",
  pl: "pl",
  de: "de",
  fr: "fr",
  it: "it",
  es: "es",
  ro: "ro",
  hu: "hu",
  ru: "ru",
  uk: "uk",
  be: "be",
  cn: "zh-CN",
  "zh-cn": "zh-CN",
  jp: "ja",
  ko: "ko",
  kr: "ko",
  vi: "vi",
  id: "id",
  en: "en",
  "en-us": "en-US",
  "en-uk": "en",
};

export const LOCALE_PATH_SEGMENTS = GLOBAL_LOCALES.map((l) => localeToPathSegment(l.code));

export function resolveGlobalLocale(input: string): GlobalLocaleCode {
  const lower = input.toLowerCase();
  if (lower === "en-us" || lower === "en_us") return "en-US";
  if (lower === "zh-cn" || lower === "cn") return "zh-CN";
  if (lower === "jp" || lower === "ja") return "ja";
  if (lower === "kr" || lower === "ko") return "ko";

  const fromSegment = pathSegmentToLocale(lower);
  if (fromSegment) return fromSegment;

  const exact = GLOBAL_LOCALES.find((l) => l.code.toLowerCase() === lower);
  if (exact) return exact.code;

  return normalizeLocale(input) as GlobalLocaleCode;
}

export function localeToPathSegment(locale: string): string {
  const resolved = resolveGlobalLocale(locale);
  return LOCALE_TO_SEGMENT[resolved] ?? resolved.toLowerCase();
}

export function pathSegmentToLocale(segment: string): GlobalLocaleCode | null {
  const key = segment.toLowerCase();
  return SEGMENT_TO_LOCALE[key] ?? null;
}

export function resolveLocalePath(pathname: string): {
  locale: GlobalLocaleCode | null;
  pathname: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { locale: null, pathname: "/" };
  }

  const locale = pathSegmentToLocale(segments[0]!);
  if (!locale) {
    return { locale: null, pathname };
  }

  const rest = segments.slice(1);
  return {
    locale,
    pathname: rest.length === 0 ? "/" : `/${rest.join("/")}`,
  };
}

/** Build a locale-prefixed public path, e.g. `/de/articles`. */
export function buildLocalePath(locale: string, pathname: string): string {
  const segment = localeToPathSegment(locale);
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (clean === "/") return `/${segment}`;
  return `/${segment}${clean}`;
}

/** Filename slug for per-locale sitemaps: sitemap-cs.xml, sitemap-en-us.xml, … */
export function localeToSitemapSlug(locale: GlobalLocaleCode): string {
  return localeToPathSegment(locale);
}

const LOCALE_EXCLUDED_PREFIXES = [
  "/app/",
  "/api/",
  "/admin",
  "/auth/",
  "/dashboard",
  "/go/",
  "/_next/",
  "/sw-",
];

const LOCALE_EXCLUDED_EXACT = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
]);

/** Paths that must not receive locale redirect/rewrite (PWAs, API, admin, assets). */
export function isLocaleRoutingExcluded(pathname: string): boolean {
  if (LOCALE_EXCLUDED_EXACT.has(pathname)) return true;
  if (/^\/sitemap(-[a-z0-9-]+)?\.xml$/i.test(pathname)) return true;
  if (/^\/sitemaps\/[a-z0-9-]+$/i.test(pathname)) return true;
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot|json|xml|txt|webmanifest)$/i.test(pathname)) {
    return true;
  }
  if (pathname.includes("-manifest.json")) return true;
  return LOCALE_EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix)
  );
}
