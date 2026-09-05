import { MAGAZINE } from "@/lib/brand/magazine";
import { formatPublicDate } from "@/lib/i18n/format-date";

/** Public issue title — date follows the page locale, never forced Czech. */
export function newsletterHeadline(issueDate: string, locale = "cs"): string {
  const date = formatPublicDate(issueDate, locale) ?? issueDate;
  return `${MAGAZINE.name} · ${date}`;
}

const LEGACY_TITLE =
  /MedScope\s+Newsletter|MedScope\s+Odborný|MedScopeGlobal\s+Newsletter/i;

export function normalizeNewsletterHeadline(
  issueDate: string,
  _existing?: string | null,
  locale = "cs"
): string {
  return newsletterHeadline(issueDate, locale);
}

export function isLegacyNewsletterTitle(title: string | null | undefined): boolean {
  if (!title?.trim()) return true;
  if (title.includes(MAGAZINE.name)) return false;
  return LEGACY_TITLE.test(title) || title.includes("MedScopeGlobal");
}
