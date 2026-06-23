import type { DiagnosisCandidate, MitigationItem, RiskFactor, RiskProfile } from "@/lib/v17/clinical/types";
import {
  edgeKey,
  nodeById,
  nodesByType,
  riskText,
  treatmentText,
} from "@/lib/v17/clinical/graph-context";
import type { GraphNormalizeResult } from "@/lib/v17/graph/types";
import type { ExtractedResult } from "@/lib/v17/reasoning/types";

function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

/** Deterministic risk score from risk text + optional evaluator relevance. */
export function computeRiskScore(riskLabel: string, relevance = 0.4): number {
  let score = relevance;
  if (/vysok|high|severe|critical|significant|major|závaž|závažn/i.test(riskLabel)) {
    score += 0.25;
  }
  if (/střed|moderate|medium/i.test(riskLabel)) {
    score += 0.1;
  }
  if (/nízk|low|minor|minim/i.test(riskLabel)) {
    score -= 0.2;
  }
  if (/\d/.test(riskLabel)) {
    score += 0.05;
  }
  return clamp(score);
}
export type CalculateRiskProfileInput = {
  extracted: ExtractedResult;
  diagnosisList: DiagnosisCandidate[];
  graph: GraphNormalizeResult;
};

/** Risk scoring + risk-benefit profile from MKG risk edges. */
export async function calculateRiskProfile(
  input: CalculateRiskProfileInput
): Promise<RiskProfile> {
  const nodeIds: string[] = [];
  const edgesUsed: string[] = [];
  const riskFactors: RiskFactor[] = [];
  const mitigation: MitigationItem[] = [];

  const riskNodes = nodesByType(input.graph, "risk");
  const increaseEdges = input.graph.edges.filter((edge) => edge.relation === "increases_risk");
  const mitigationEdges = input.graph.edges.filter((edge) => edge.relation === "mitigated_by");

  for (const edge of increaseEdges) {
    const riskNode = nodeById(input.graph, edge.from);
    if (!riskNode) continue;
    const factor = riskText(riskNode);
    nodeIds.push(riskNode.id);
    edgesUsed.push(edgeKey(edge));
    riskFactors.push({
      factor,
      score: clamp(edge.finalScore),
    });
  }

  for (const edge of mitigationEdges) {
    const riskNode = nodeById(input.graph, edge.from);
    const treatmentNode = nodeById(input.graph, edge.to);
    if (!riskNode || !treatmentNode) continue;
    nodeIds.push(riskNode.id, treatmentNode.id);
    edgesUsed.push(edgeKey(edge));
    mitigation.push({
      treatment: treatmentText(treatmentNode),
      strength: clamp(edge.finalScore > 0 ? edge.finalScore : edge.metadata.weight),
    });
  }

  if (riskFactors.length === 0) {
    for (const riskNode of riskNodes) {
      const factor = riskText(riskNode);
      nodeIds.push(riskNode.id);
      riskFactors.push({
        factor,
        score: computeRiskScore(factor, 0.4),
      });
    }
  }

  if (riskFactors.length === 0) {
    for (const extractedRisk of input.extracted.risks) {
      riskFactors.push({
        factor: extractedRisk,
        score: computeRiskScore(extractedRisk, 0.4),
      });
    }
  }

  const diagnosisRiskBoost = input.diagnosisList.reduce(
    (sum, item) => sum + item.confidence * 0.05,
    0
  );

  const rawRiskScore =
    riskFactors.length > 0
      ? riskFactors.reduce((sum, item) => sum + item.score, 0) / riskFactors.length
      : 0.25;

  const mitigationReduction =
    mitigation.length > 0
      ? mitigation.reduce((sum, item) => sum + item.strength, 0) / mitigation.length * 0.25
      : 0;

  const riskScore = clamp(rawRiskScore + diagnosisRiskBoost - mitigationReduction);

  return {
    riskScore,
    riskFactors,
    mitigation,
    audit: {
      nodeIds: [...new Set(nodeIds)],
      edgesUsed: [...new Set(edgesUsed)],
    },
  };
}

/** V17 clinical risk module — skeleton assess hook. */
export async function assessRisk(_input: unknown): Promise<null> {
  return null;
}
