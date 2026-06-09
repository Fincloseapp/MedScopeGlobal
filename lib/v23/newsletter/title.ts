import { formatIssueDateCs } from "@/lib/v23/newsletter/sanitize";

/** Jednotný název vydání: MedScopeGlobal Newsletter — 3. června 2026 */
export function newsletterHeadline(issueDate: string): string {
  return `MedScopeGlobal Newsletter — ${formatIssueDateCs(issueDate)}`;
}

export function normalizeNewsletterHeadline(issueDate: string, existing?: string | null): string {
  const canonical = newsletterHeadline(issueDate);
  if (!existing?.trim()) return canonical;
  if (existing.includes("MedScopeGlobal Newsletter")) return canonical;
  return canonical;
}
