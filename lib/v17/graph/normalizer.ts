import type { GraphEdge, GraphNode, GraphNormalizeResult } from "@/lib/v17/graph/types";

const ALLOWED_TYPES = new Set<GraphNode["type"]>([
  "symptom",
  "diagnosis",
  "treatment",
  "risk",
  "evidence",
  "comparison",
  "conclusion",
  "guideline_alignment",
]);

function nodeKey(node: GraphNode): string {
  const val =
    typeof node.value === "string"
      ? node.value
      : JSON.stringify(node.value, Object.keys(node.value as object).sort());
  return `${node.type}::${val}`;
}

function isEmptyNode(node: GraphNode): boolean {
  if (typeof node.value === "string") return node.value.trim().length === 0;
  if (typeof node.value === "object" && node.value !== null) {
    return Object.keys(node.value).length === 0;
  }
  return true;
}

/** Deduplicate nodes, validate edges, remove orphans. */
export async function normalizeGraph(input: {
  nodes: GraphNode[];
  edges: GraphEdge[];
}): Promise<GraphNormalizeResult> {
  const seen = new Map<string, GraphNode>();
  const idRemap = new Map<string, string>();

  for (const node of input.nodes) {
    if (isEmptyNode(node)) continue;
    const type = ALLOWED_TYPES.has(node.type) ? node.type : "comparison";
    const normalized: GraphNode = { ...node, type };
    const key = nodeKey(normalized);
    const existing = seen.get(key);
    if (existing) {
      idRemap.set(node.id, existing.id);
    } else {
      seen.set(key, normalized);
      idRemap.set(node.id, normalized.id);
    }
  }

  const nodes = [...seen.values()];
  const validIds = new Set(nodes.map((n) => n.id));

  const edges: GraphEdge[] = [];
  const edgeKeys = new Set<string>();

  for (const edge of input.edges) {
    const from = idRemap.get(edge.from) ?? edge.from;
    const to = idRemap.get(edge.to) ?? edge.to;
    if (!validIds.has(from) || !validIds.has(to) || from === to) continue;
    const key = `${from}|${edge.relation}|${to}`;
    if (edgeKeys.has(key)) continue;
    edgeKeys.add(key);
    edges.push({ ...edge, from, to });
  }

  const connected = new Set<string>();
  for (const e of edges) {
    connected.add(e.from);
    connected.add(e.to);
  }

  const normalizedNodes =
    edges.length > 0 ? nodes.filter((n) => connected.has(n.id)) : nodes;

  return { nodes: normalizedNodes, edges };
}
