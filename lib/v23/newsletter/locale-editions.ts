import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { PRIMARY_EDITORIAL_LOCALES } from "@/lib/ecosystem/editorial/desks";
import { localeToPathSegment, pathSegmentToLocale, resolveGlobalLocale } from "@/lib/i18n/locale-path";

const DATE_SLUG = /^(\d{4}-\d{2}-\d{2})(?:-(.+))?$/;

/** High-traffic desks — default cron set. Override with NEWSLETTER_EDITION_LOCALES. */
export const NEWSLETTER_PRIMARY_LOCALES: GlobalLocaleCode[] = [...PRIMARY_EDITORIAL_LOCALES];

export type NewsletterSlugParts = {
  issueDate: string;
  locale: GlobalLocaleCode;
  segment: string | null;
};

/** Czech keeps YYYY-MM-DD. Other desks: YYYY-MM-DD-{path-segment} (pt-br, en-us, cn, jp). */
export function newsletterIssueSlug(issueDate: string, locale: string = "cs"): string {
  const resolved = resolveGlobalLocale(locale);
  if (resolved === "cs") return issueDate;
  return `${issueDate}-${localeToPathSegment(resolved)}`;
}

export function parseNewsletterIssueSlug(slug: string): NewsletterSlugParts {
  const match = slug.match(DATE_SLUG);
  if (!match) {
    return { issueDate: slug, locale: "cs", segment: null };
  }
  const issueDate = match[1]!;
  const segment = match[2] ?? null;
  if (!segment) {
    return { issueDate, locale: "cs", segment: null };
  }
  const fromSegment = pathSegmentToLocale(segment);
  if (fromSegment) {
    return { issueDate, locale: fromSegment, segment };
  }
  return { issueDate, locale: resolveGlobalLocale(segment), segment };
}

export function newsletterSlugCandidates(issueDate: string, locale: string): string[] {
  const preferred = newsletterIssueSlug(issueDate, locale);
  const dated = issueDate;
  return preferred === dated ? [dated] : [preferred, dated];
}

export function publicNewsletterSlugCandidates(requestedSlug: string, pageLocale: string): string[] {
  const parsed = parseNewsletterIssueSlug(requestedSlug);
  const out: string[] = [];
  const push = (value: string) => {
    if (value && !out.includes(value)) out.push(value);
  };
  if (parsed.segment) {
    push(requestedSlug);
  }
  for (const slug of newsletterSlugCandidates(parsed.issueDate, pageLocale)) {
    push(slug);
  }
  if (!parsed.segment) {
    push(requestedSlug);
  }
  return out;
}

function parseEditionEnv(raw: string | undefined): GlobalLocaleCode[] | null {
  if (!raw?.trim()) return null;
  const seen = new Set<GlobalLocaleCode>();
  const list: GlobalLocaleCode[] = [];
  for (const token of raw.split(/[\s,]+/)) {
    if (!token) continue;
    const locale = resolveGlobalLocale(token);
    if (seen.has(locale)) continue;
    seen.add(locale);
    list.push(locale);
  }
  return list.length ? list : null;
}

/** Cron / admin generate set. Default = primary desks (15). `all` = every GLOBAL_LOCALE. */
export function newsletterEditionLocales(): GlobalLocaleCode[] {
  const raw = process.env.NEWSLETTER_EDITION_LOCALES?.trim();
  if (raw === "all") return GLOBAL_LOCALES.map((item) => item.code);
  return parseEditionEnv(raw) ?? NEWSLETTER_PRIMARY_LOCALES;
}

export function isNewsletterEditionLocale(locale: string): boolean {
  const resolved = resolveGlobalLocale(locale);
  return GLOBAL_LOCALES.some((item) => item.code === resolved);
}
