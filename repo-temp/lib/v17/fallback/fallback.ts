type FallbackStage = "reduced-reasoning" | "reduced-mkg" | "safe-summary";

function normalizeStage(stage: string): FallbackStage {
  if (stage === "1" || stage === "reduced-reasoning") return "reduced-reasoning";
  if (stage === "2" || stage === "reduced-mkg") return "reduced-mkg";
  return "safe-summary";
}

function reducedReasoning(acp: any): any {
  return {
    ...acp,
    reasoning: {
      ...acp.reasoning,
      compared: { conflicts: [], alignments: [], priorities: [] },
      inferred: {
        conclusion: acp.reasoning?.inferred?.conclusion || "Reduced reasoning fallback applied.",
        reasoningChain: (acp.reasoning?.inferred?.reasoningChain ?? []).slice(0, 2),
        confidence: Math.min(acp.reasoning?.inferred?.confidence ?? 0.5, 0.5),
      },
    },
  };
}

function reducedMkg(acp: any): any {
  const nodes = acp.graph?.nodes ?? [];
  const edges = acp.graph?.edges ?? [];
  const topNodes = nodes.slice(0, Math.max(5, Math.ceil(nodes.length * 0.5)));
  const nodeIds = new Set(topNodes.map((n: any) => n.id));
  const topEdges = edges
    .filter((e: any) => nodeIds.has(e.from) && nodeIds.has(e.to))
    .slice(0, Math.max(3, Math.ceil(edges.length * 0.5)));

  return { ...acp, graph: { nodes: topNodes, edges: topEdges } };
}

function safeSummary(acp: any): any {
  return {
    ...acp,
    inference: {
      ...acp.inference,
      diagnosis: (acp.inference?.diagnosis ?? []).slice(0, 1),
      treatment: [],
      risk: {
        ...acp.inference?.risk,
        riskScore: Math.min(acp.inference?.risk?.riskScore ?? 0.5, 0.5),
      },
    },
    summary: {
      ...acp.summary,
      headline: "Safe summary mode",
      primaryDiagnoses: (acp.summary?.primaryDiagnoses ?? []).slice(0, 1),
      recommendedTreatments: [],
      keyRisks: (acp.summary?.keyRisks ?? []).slice(0, 2),
      guidelineAlignment: (acp.summary?.guidelineAlignment ?? []).slice(0, 2),
      reasoningChain: (acp.summary?.reasoningChain ?? []).slice(0, 3),
      narrative:
        "Safe summary fallback: treatment recommendations suppressed pending clinical review.",
    },
  };
}

/** Apply fallback stage to ACP output without rerunning upstream pipelines. */
export function applyFallback(acpOutput: any, stage: string): any {
  const acp = acpOutput?.acp ?? acpOutput;
  const normalized = normalizeStage(stage);

  if (normalized === "reduced-reasoning") {
    return { stage: normalized, acp: reducedReasoning(acp), note: "Reduced Reasoning" };
  }
  if (normalized === "reduced-mkg") {
    return { stage: normalized, acp: reducedMkg(acp), note: "Reduced MKG" };
  }
  return { stage: "safe-summary", acp: safeSummary(acp), note: "Safe Summary" };
}

/** Run all three fallback stages in sequence. */
export function applyFallbackChain(acpOutput: any): any {
  let current = acpOutput?.acp ?? acpOutput;
  let last = applyFallback(current, "reduced-reasoning");
  current = last.acp;
  last = applyFallback(current, "reduced-mkg");
  current = last.acp;
  return applyFallback(current, "safe-summary");
}
