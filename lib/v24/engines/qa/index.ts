import type { V24ContentDraft, V24QaReport } from "@/lib/v24/types";
import { V24_MAX_ARTICLE_WORDS, V24_MIN_ARTICLE_WORDS } from "@/lib/v24/config";
import { reviewMedicalContent } from "@/lib/v24/engines/qa/medical-reviewer";
import { checkConsistency } from "@/lib/v24/engines/qa/consistency-checker";
import { detectDuplicateInDraft } from "@/lib/v24/engines/qa/duplicate-detector";
import { checkClinicalAccuracy } from "@/lib/v24/engines/qa/clinical-accuracy";

export function runV24QaPipeline(draft: V24ContentDraft, existingTitles: string[]): V24QaReport {
  const medical = reviewMedicalContent(draft);
  const consistency = checkConsistency(draft);
  const duplicate = detectDuplicateInDraft(draft, existingTitles);
  const clinical = checkClinicalAccuracy(draft);
  const wordCount = draft.bodyHtml.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const lengthOk = wordCount >= V24_MIN_ARTICLE_WORDS && wordCount <= V24_MAX_ARTICLE_WORDS;
  const structureOk =
    Boolean(draft.title?.length > 12) &&
    Boolean(draft.summary?.length > 40) &&
    draft.bodyHtml.includes("<h2") &&
    draft.keywords.length >= 3;

  const checks: Record<string, boolean> = {
    medical: medical.passed,
    consistency: consistency.passed,
    duplicate: !duplicate.isDuplicate,
    clinical: clinical.passed,
    length: lengthOk,
    structure: structureOk,
    differential:
      draft.contentType !== "differential-diagnosis" ||
      (draft.differentialDiagnosis?.length ?? 0) >= 3,
    treatment:
      draft.contentType !== "treatment-plan" || (draft.treatmentPlan?.length ?? 0) >= 2,
  };

  const issues = [
    ...medical.issues,
    ...consistency.issues,
    ...(duplicate.isDuplicate ? [`duplicita: ${duplicate.reason}`] : []),
    ...clinical.issues,
    ...(!lengthOk ? [`délka ${wordCount} slov mimo rozsah`] : []),
    ...(!structureOk ? ["neúplná struktura článku"] : []),
  ];

  const passed = Object.values(checks).every(Boolean);
  const score = Math.round(
    (Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100
  );

  return { passed, score, issues, checks };
}
