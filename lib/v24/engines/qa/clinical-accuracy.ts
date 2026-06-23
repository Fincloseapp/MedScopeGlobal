import type { V24ContentDraft } from "@/lib/v24/types";

const REQUIRED_SECTIONS = ["klinický dopad", "diferenciál", "léčba", "prevence", "závažnost"];

export function checkClinicalAccuracy(draft: V24ContentDraft) {
  const issues: string[] = [];
  const lower = draft.bodyHtml.toLowerCase();

  if (draft.contentType === "differential-diagnosis") {
    const count = draft.differentialDiagnosis?.length ?? 0;
    if (count < 3) issues.push("DDx musí obsahovat min. 3 diagnózy");
    if (!lower.includes("red flags") && !lower.includes("varovné")) {
      issues.push("chybí varovné příznaky / red flags");
    }
  }

  if (draft.contentType === "treatment-plan") {
    if (!lower.includes("monitorování") && !lower.includes("kontrola")) {
      issues.push("léčebný plán bez monitorování");
    }
  }

  if (draft.contentType === "case-study" && !draft.casePresentation) {
    issues.push("kazuistika bez prezentace případu");
  }

  const sectionHits = REQUIRED_SECTIONS.filter((s) => lower.includes(s)).length;
  if (sectionHits < 2 && draft.contentType === "article") {
    issues.push("málo klinických sekcí");
  }

  return { passed: issues.length === 0, issues };
}
