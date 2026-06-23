import type {
  EdgeRelevance,
  GraphEdge,
  GraphEdgeAuditMeta,
  GraphEdgeInput,
  GraphEdgeMetadata,
} from "@/lib/v17/graph/types";

export const ESL_CONSTANTS = { w: 0.4, s: 0.3, r: 0.2, g: 0.1 } as const;

const ESL_AUDIT_META: GraphEdgeAuditMeta = {
  source: "linker",
  rules: ["weighting", "scoring", "normalization"],
  constants: { ...ESL_CONSTANTS },
};

function relevanceFromConfidence(confidence: number): EdgeRelevance {
  if (confidence > 0.66) return "high";
  if (confidence > 0.33) return "medium";
  return "low";
}

/** Deterministic finalScore from edge metadata (ESL weighting). */
export function computeFinalScore(metadata: GraphEdgeMetadata): number {
  const guidelineBonus = metadata.guidelineSupport ? ESL_CONSTANTS.g : 0;
  return (
    metadata.weight * ESL_CONSTANTS.w +
    metadata.score * ESL_CONSTANTS.s +
    metadata.riskImpact * ESL_CONSTANTS.r +
    guidelineBonus
  );
}

/** Apply Edge Scoring Layer — finalScore, confidence, relevance, audit.meta. */
export function applyEdgeScoring(edges: GraphEdgeInput[]): GraphEdge[] {
  if (edges.length === 0) return [];

  const finalScores = edges.map((edge) => computeFinalScore(edge.metadata));
  const maxFinalScore = Math.max(...finalScores, 0);

  return edges.map((edge, index) => {
    const finalScore = finalScores[index];
    const confidence =
      maxFinalScore > 0 ? Math.max(0, finalScore / maxFinalScore) : 0;

    return {
      ...edge,
      finalScore,
      confidence,
      relevance: relevanceFromConfidence(confidence),
      audit: { meta: ESL_AUDIT_META },
    };
  });
}
