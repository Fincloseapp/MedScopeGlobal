import type {
  ComparedResult,
  EvaluatedResult,
  ExtractedResult,
  InferredResult,
} from "@/lib/v17/reasoning/types";

function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

/** Mixed clinical + evidence-based inference (placeholder heuristics). */
export async function infer(
  compared: ComparedResult,
  evaluated: EvaluatedResult,
  extracted: ExtractedResult
): Promise<InferredResult> {
  const reasoningChain: string[] = [];
  const top = compared.priorities.slice(0, 3);

  if (extracted.symptoms.length) {
    reasoningChain.push(`Symptoms identified: ${extracted.symptoms.slice(0, 3).join(", ")}`);
  }
  if (extracted.diagnoses.length) {
    reasoningChain.push(`Working diagnoses: ${extracted.diagnoses.slice(0, 3).join(", ")}`);
  }

  const highEvidence = evaluated.items.filter((e) => e.evidenceLevel === "high");
  if (highEvidence.length) {
    reasoningChain.push(
      `High-evidence signals: ${highEvidence.slice(0, 2).map((e) => e.item).join("; ")}`
    );
  }

  if (compared.alignments.length) {
    reasoningChain.push(
      `Guideline/clinical alignment: ${compared.alignments[0].note} (${compared.alignments[0].items.slice(0, 2).join(", ")})`
    );
  }

  if (compared.conflicts.length) {
    reasoningChain.push(
      `Conflict flagged: ${compared.conflicts[0].a} vs ${compared.conflicts[0].b} (${compared.conflicts[0].reason})`
    );
  }

  if (extracted.risks.length) {
    reasoningChain.push(`Risk factors: ${extracted.risks.slice(0, 3).join(", ")}`);
  }

  if (extracted.treatments.length) {
    reasoningChain.push(`Treatment mentions: ${extracted.treatments.slice(0, 3).join(", ")}`);
  }

  let conclusion: string;
  if (!top.length && !extracted.facts.length) {
    conclusion =
      "Insufficient structured clinical input; provide symptoms, diagnosis, or evidence text for mixed reasoning.";
    reasoningChain.push("No prioritized evidence items available.");
  } else if (compared.conflicts.length) {
    conclusion =
      "Mixed reasoning suggests caution: evidence contains conflicting signals; reconcile guidelines and clinical context before action.";
  } else if (extracted.diagnoses.length && extracted.treatments.length) {
    conclusion = `Clinical–evidence synthesis: prioritize ${extracted.diagnoses[0]} management with ${extracted.treatments[0]} while monitoring ${extracted.risks[0] ?? "standard risk factors"}.`;
  } else if (top.length) {
    conclusion = `Evidence-weighted focus: ${top[0].item} (priority score ${top[0].score}).`;
  } else {
    conclusion = "Preliminary mixed reasoning completed from available clinical facts.";
  }

  const avgRelevance =
    evaluated.items.length > 0
      ? evaluated.items.reduce((s, e) => s + e.relevance, 0) / evaluated.items.length
      : 0.2;
  const alignmentBoost = compared.alignments.length * 0.08;
  const conflictPenalty = compared.conflicts.length * 0.12;
  const confidence = clamp(avgRelevance + alignmentBoost - conflictPenalty, 0.15, 0.92);

  return {
    conclusion,
    reasoningChain,
    confidence: Number(confidence.toFixed(2)),
  };
}
