import type { DiagnosisCandidate, TreatmentRecommendation } from "@/lib/v17/clinical/types";
import {
  edgeKey,
  findDiagnosisNode,
  nodeById,
  treatmentText,
} from "@/lib/v17/clinical/graph-context";
import type { EvidenceLevel } from "@/lib/v17/clinical/evidence";
import type { EvidenceStrength, GraphNormalizeResult } from "@/lib/v17/graph/types";

function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

function toEvidenceLevel(strength: EvidenceStrength): EvidenceLevel {
  if (strength === "high" || strength === "moderate" || strength === "low") return strength;
  return "low";
}

export type GenerateTreatmentPlanInput = {
  diagnosisList: DiagnosisCandidate[];
  graph: GraphNormalizeResult;
};

/** Generate evidence-weighted treatment plan from diagnosis list + MKG. */
export async function generateTreatmentPlan(
  input: GenerateTreatmentPlanInput
): Promise<TreatmentRecommendation[]> {
  const recommendations = new Map<string, TreatmentRecommendation>();

  for (const candidate of input.diagnosisList) {
    const diagnosisNode = findDiagnosisNode(input.graph, candidate.diagnosis);
    if (!diagnosisNode) continue;

    const treatedByEdges = input.graph.edges.filter(
      (edge) => edge.relation === "treated_by" && edge.from === diagnosisNode.id
    );

    for (const edge of treatedByEdges) {
      const treatmentNode = nodeById(input.graph, edge.to);
      if (!treatmentNode) continue;

      const treatment = treatmentText(treatmentNode);
      const key = treatment.toLowerCase();
      const riskPenalty = edge.metadata.riskImpact < 0 ? Math.abs(edge.metadata.riskImpact) * 0.15 : 0;
      const confidence = clamp(
        edge.finalScore * 0.55 +
          edge.confidence * 0.25 +
          (edge.metadata.guidelineSupport ? 0.12 : 0) -
          riskPenalty +
          candidate.confidence * 0.08
      );

      const existing = recommendations.get(key);
      const next: TreatmentRecommendation = {
        treatment,
        evidenceLevel: toEvidenceLevel(edge.metadata.evidenceStrength),
        guidelineSupport: edge.metadata.guidelineSupport,
        confidence,
        audit: {
          nodeIds: [diagnosisNode.id, treatmentNode.id],
          edgesUsed: [edgeKey(edge)],
        },
      };

      if (!existing || next.confidence > existing.confidence) {
        recommendations.set(key, next);
      }
    }
  }

  return [...recommendations.values()].sort((a, b) => b.confidence - a.confidence);
}

/** V17 clinical treatment module — skeleton assess hook. */
export async function assessTreatment(_input: unknown): Promise<null> {
  return null;
}
