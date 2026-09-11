/**
 * Public listing / search filters for template and wrong-locale rows
 * that already shipped to production (university stubs, invented interviews, FR-in-CS).
 */

const TEMPLATE_TITLE =
  /výzkumná novinka|legislativní novinka|research news|coming soon|připravujeme/i;

const INVENTED_CAST =
  /Jana Novotná|pečovatelka Jana|pana Karla|příběh pana Karla|praktický lékař na|Santé des seniors/i;

const FRENCH_MARKERS =
  /\b(santé|seniors|inspirer|sans sensation|pratiques éprouvées|dans un monde|il est essentiel|foyer et du service|grand public)\b/i;

export function isTemplateUniversityTitle(title: string | null | undefined): boolean {
  return TEMPLATE_TITLE.test(String(title ?? ""));
}

export function isInventedInterviewCopy(text: string | null | undefined): boolean {
  return INVENTED_CAST.test(String(text ?? ""));
}

export function looksLikeFrenchLeak(text: string | null | undefined): boolean {
  const plain = String(text ?? "").replace(/<[^>]+>/g, " ");
  if (/[čďěňřšťůýž]/i.test(plain)) return false;
  return FRENCH_MARKERS.test(plain);
}

export function isJunkPublicCopy(
  title?: string | null,
  excerpt?: string | null,
  content?: string | null
): boolean {
  const blob = `${title ?? ""} ${excerpt ?? ""} ${String(content ?? "").slice(0, 800)}`;
  return (
    isTemplateUniversityTitle(title) ||
    isInventedInterviewCopy(blob) ||
    looksLikeFrenchLeak(blob)
  );
}
