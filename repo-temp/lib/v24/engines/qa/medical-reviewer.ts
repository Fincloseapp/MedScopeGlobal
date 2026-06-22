import type { V24ContentDraft } from "@/lib/v24/types";

const FORBIDDEN = [
  /dávkujte\s+\d+/i,
  /užívejte\s+\d+\s*mg/i,
  /přesný\s+recept/i,
  /garantované\s+vyléčení/i,
  /100\s*%\s*účinnost/i,
];

export function reviewMedicalContent(draft: V24ContentDraft) {
  const text = `${draft.title} ${draft.summary} ${draft.bodyHtml}`;
  const issues: string[] = [];

  for (const re of FORBIDDEN) {
    if (re.test(text)) issues.push(`zakázané tvrzení: ${re.source}`);
  }
  if (!draft.summary.includes(".")) issues.push("shrnutí bez věty");
  if (draft.keywords.length < 2) issues.push("málo klíčových slov");

  return { passed: issues.length === 0, issues };
}
