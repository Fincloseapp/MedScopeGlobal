import type { EvaluatedItem, EvaluatedResult, ExtractedResult } from "@/lib/v17/reasoning/types";

const HIGH_EVIDENCE =
  /\b(guideline|guidelines|meta-analysis|systematic review|randomized|rct|cochrane|grade\s*a|consensus)\b/i;
const MODERATE_EVIDENCE =
  /\b(study|studie|cohort|case-control|observational|review|p<0\.05|significant|odds ratio)\b/i;

function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

function scoreRelevance(item: string, category: EvaluatedItem["category"]): number {
  let score = 0.35;
  if (item.length > 40) score += 0.15;
  if (/\d/.test(item)) score += 0.1;
  if (HIGH_EVIDENCE.test(item)) score += 0.35;
  else if (MODERATE_EVIDENCE.test(item)) score += 0.2;
  if (category === "diagnosis" || category === "treatment") score += 0.1;
  if (category === "risk") score += 0.05;
  return clamp(score);
}

function evidenceLevel(item: string): EvaluatedItem["evidenceLevel"] {
  if (HIGH_EVIDENCE.test(item)) return "high";
  if (MODERATE_EVIDENCE.test(item)) return "moderate";
  return "low";
}

function evaluateCategory(
  items: string[],
  category: EvaluatedItem["category"]
): EvaluatedItem[] {
  return items.map((item) => ({
    item,
    category,
    relevance: scoreRelevance(item, category),
    evidenceLevel: evidenceLevel(item),
  }));
}

/** Score extracted facts for clinical + evidence-based relevance. */
export async function evaluate(extracted: ExtractedResult): Promise<EvaluatedResult> {
  const items: EvaluatedItem[] = [
    ...evaluateCategory(extracted.symptoms, "symptom"),
    ...evaluateCategory(extracted.diagnoses, "diagnosis"),
    ...evaluateCategory(extracted.treatments, "treatment"),
    ...evaluateCategory(extracted.risks, "risk"),
    ...evaluateCategory(extracted.facts, "fact"),
  ];

  return { items: items.sort((a, b) => b.relevance - a.relevance) };
}
