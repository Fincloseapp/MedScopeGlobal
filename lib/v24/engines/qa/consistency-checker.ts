import type { V24ContentDraft } from "@/lib/v24/types";

export function checkConsistency(draft: V24ContentDraft) {
  const issues: string[] = [];
  const titleWords = new Set(draft.title.toLowerCase().split(/\s+/));
  const summaryOverlap = draft.summary
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => titleWords.has(w) && w.length > 4).length;

  if (summaryOverlap < 1) issues.push("shrnutí nekoresponduje s nadpisem");
  if (draft.bodyHtml.length < draft.summary.length * 2) {
    issues.push("tělo článku příliš krátké vůči shrnutí");
  }
  if (draft.differentialDiagnosis?.some((d) => d.length < 4)) {
    issues.push("neúplná diferenciální diagnostika");
  }
  if (draft.treatmentPlan?.some((t) => /mg\/kg|dávka/i.test(t))) {
    issues.push("léčebný plán obsahuje konkrétní dávkování");
  }

  return { passed: issues.length === 0, issues };
}
