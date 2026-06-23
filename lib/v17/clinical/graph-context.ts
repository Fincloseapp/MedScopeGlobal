import type { GraphEdge, GraphNode, GraphNormalizeResult } from "@/lib/v17/graph/types";
import { nodeText } from "@/lib/v17/graph/linking/text-match";

export function edgeKey(edge: GraphEdge): string {
  return `${edge.from}|${edge.relation}|${edge.to}`;
}

export function nodesByType(
  graph: GraphNormalizeResult,
  type: GraphNode["type"]
): GraphNode[] {
  return graph.nodes.filter((node) => node.type === type);
}

export function nodeById(graph: GraphNormalizeResult, id: string): GraphNode | undefined {
  return graph.nodes.find((node) => node.id === id);
}

export function edgesByRelation(graph: GraphNormalizeResult, relation: string): GraphEdge[] {
  return graph.edges.filter((edge) => edge.relation === relation);
}

export function findDiagnosisNode(
  graph: GraphNormalizeResult,
  diagnosis: string
): GraphNode | undefined {
  return nodesByType(graph, "diagnosis").find(
    (node) => nodeText(node.value).toLowerCase() === diagnosis.toLowerCase()
  );
}

export function diagnosisText(node: GraphNode): string {
  return nodeText(node.value);
}

export function symptomText(node: GraphNode): string {
  return nodeText(node.value);
}

export function treatmentText(node: GraphNode): string {
  return nodeText(node.value);
}

export function riskText(node: GraphNode): string {
  return nodeText(node.value);
}
