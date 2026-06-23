import type { ComparedResult, EvaluatedResult, ExtractedResult } from "@/lib/v17/reasoning/types";

const CONFLICT_PAIRS: Array<[RegExp, RegExp, string]> = [
  [/contraindicated|kontraindik/i, /recommended|indicated|first-line|prefer/i, "treatment conflict"],
  [/increase|zvyš/i, /decrease|sniž|reduce/i, "directional conflict"],
  [/acute|akutní/i, /chronic|chronick/i, "temporal conflict"],
  [/no treatment|bez léčby/i, /start treatment|zahájit léčbu/i, "management conflict"],
];

function hasGuidelineSignal(text: string): boolean {
  return /\b(guideline|guidelines|doporučení|recommendation|esc\/ers|acr|eular|nice)\b/i.test(text);
}

/** Compare evidence items for conflicts, alignment, and priority ranking. */
export async function compare(
  evaluated: EvaluatedResult,
  extracted?: ExtractedResult
): Promise<ComparedResult> {
  const conflicts: ComparedResult["conflicts"] = [];
  const alignments: ComparedResult["alignments"] = [];
  const items = evaluated.items.map((e) => e.item);

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      for (const [left, right, reason] of CONFLICT_PAIRS) {
        if ((left.test(a) && right.test(b)) || (left.test(b) && right.test(a))) {
          conflicts.push({ a, b, reason });
        }
      }
    }
  }

  if (extracted && extracted.diagnoses.length && extracted.treatments.length) {
    alignments.push({
      items: [...extracted.diagnoses.slice(0, 2), ...extracted.treatments.slice(0, 2)],
      note: "Diagnosis–treatment co-occurrence (heuristic alignment)",
    });
  }

  const guidelineFacts = evaluated.items.filter((e) => hasGuidelineSignal(e.item));
  if (guidelineFacts.length) {
    alignments.push({
      items: guidelineFacts.map((g) => g.item),
      note: "Guideline-aligned evidence",
    });
  }

  const symptomDiagnosis = evaluated.items.filter(
    (e) => e.category === "symptom" || e.category === "diagnosis"
  );
  if (symptomDiagnosis.length >= 2) {
    alignments.push({
      items: symptomDiagnosis.slice(0, 4).map((e) => e.item),
      note: "Clinical presentation alignment",
    });
  }

  const priorities = evaluated.items.map((e) => ({
    item: e.item,
    score: Number((e.relevance * (e.evidenceLevel === "high" ? 1.2 : e.evidenceLevel === "moderate" ? 1 : 0.85)).toFixed(3)),
    category: e.category,
  }));

  priorities.sort((a, b) => b.score - a.score);

  return { conflicts, alignments, priorities };
}
