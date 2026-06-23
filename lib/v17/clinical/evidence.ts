import type { WeightedEvidenceItem } from "@/lib/v17/clinical/types";
import type { EvaluatedResult } from "@/lib/v17/reasoning/types";

export type EvidenceLevel = "low" | "moderate" | "high";

export const EVIDENCE_LEVEL_WEIGHT: Record<EvidenceLevel, number> = {
  high: 1,
  moderate: 0.65,
  low: 0.35,
};

function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

/** Deterministic weight from evidence level (GRADE-style heuristic). */
export function evidenceLevelWeight(level: EvidenceLevel | string): number {
  return EVIDENCE_LEVEL_WEIGHT[level as EvidenceLevel] ?? EVIDENCE_LEVEL_WEIGHT.low;
}

/** Combined evidence weight = level weight × evaluator relevance. */
export function computeEvidenceWeight(
  level: EvidenceLevel | string,
  relevance: number
): number {
  return evidenceLevelWeight(level) * clamp(relevance);
}

/** Weight evaluated items by EBM hierarchy (level × relevance). */
export function weightEvidence(evaluated: EvaluatedResult): WeightedEvidenceItem[] {
  return evaluated.items
    .map((item) => ({
      item: item.item,
      weight: computeEvidenceWeight(item.evidenceLevel, item.relevance),
      level: item.evidenceLevel as EvidenceLevel,
    }))
    .sort((a, b) => b.weight - a.weight);
}

/** V17 clinical evidence module — skeleton assess hook. */
export async function assessEvidence(_input: unknown): Promise<null> {
  return null;
}
