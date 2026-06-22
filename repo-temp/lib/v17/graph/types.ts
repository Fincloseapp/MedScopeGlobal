import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

export type GraphNodeType =
  | "symptom"
  | "diagnosis"
  | "treatment"
  | "risk"
  | "evidence"
  | "comparison"
  | "conclusion"
  | "guideline_alignment";

export type GraphNode = {
  id: string;
  type: GraphNodeType;
  value: string | Record<string, unknown>;
};

export type EvidenceStrength = "low" | "moderate" | "high";

export type GraphEdgeMetadata = {
  weight: number;
  score: number;
  evidenceStrength: EvidenceStrength;
  riskImpact: number;
  guidelineSupport: boolean;
};

export type EdgeRelevance = "low" | "medium" | "high";

export type GraphEdgeAuditMeta = {
  source: "linker";
  rules: string[];
  constants: { w: number; s: number; r: number; g: number };
};

export type GraphEdgeAudit = {
  meta: GraphEdgeAuditMeta;
};

export type GraphEdgeInput = {
  from: string;
  to: string;
  relation: string;
  metadata: GraphEdgeMetadata;
};

export type GraphEdge = GraphEdgeInput & {
  finalScore: number;
  confidence: number;
  relevance: EdgeRelevance;
  audit: GraphEdgeAudit;
};

export type GraphBuildResult = {
  nodes: GraphNode[];
};

export type GraphLinkResult = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphNormalizeResult = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

export function makeNodeId(type: GraphNodeType, value: string, index: number): string {
  return `${type}_${index}_${slug(value) || "item"}`;
}

export type ReasoningGraphInput = ReasoningPipelinePayload;
