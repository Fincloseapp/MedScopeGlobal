import { formatIssueDateCs } from "@/lib/v23/newsletter/sanitize";

/** Jednotný název vydání: MedScopeGlobal Newsletter — 3. června 2026 */
export function newsletterHeadline(issueDate: string): string {
  return `MedScopeGlobal Newsletter — ${formatIssueDateCs(issueDate)}`;
}

const LEGACY_TITLE =
  /MedScope\s+Newsletter|MedScope\s+Odborný|MedScopeGlobal\s+Newsletter/i;

export function normalizeNewsletterHeadline(issueDate: string, _existing?: string | null): string {
  return newsletterHeadline(issueDate);
}

export function isLegacyNewsletterTitle(title: string | null | undefined): boolean {
  if (!title?.trim()) return true;
  if (title.includes("MedScopeGlobal Newsletter")) return false;
  return LEGACY_TITLE.test(title) || !title.includes("MedScopeGlobal");
}