import type { GraphBuildResult, GraphNode, ReasoningGraphInput } from "@/lib/v17/graph/types";
import { makeNodeId } from "@/lib/v17/graph/types";

function pushStringNodes(
  nodes: GraphNode[],
  items: string[],
  type: GraphNode["type"]
): void {
  items.forEach((value, index) => {
    nodes.push({ id: makeNodeId(type, value, index), type, value });
  });
}

/** Build MKG nodes from mixed reasoning pipeline outputs. */
export async function buildGraph(input: ReasoningGraphInput): Promise<GraphBuildResult> {
  const { extracted, evaluated, compared, inferred } = input;
  const nodes: GraphNode[] = [];

  pushStringNodes(nodes, extracted.symptoms, "symptom");
  pushStringNodes(nodes, extracted.diagnoses, "diagnosis");
  pushStringNodes(nodes, extracted.treatments, "treatment");
  pushStringNodes(nodes, extracted.risks, "risk");

  evaluated.items.forEach((item, index) => {
    nodes.push({
      id: makeNodeId("evidence", item.item, index),
      type: "evidence",
      value: {
        item: item.item,
        category: item.category,
        relevance: item.relevance,
        evidenceLevel: item.evidenceLevel,
      },
    });
  });

  compared.conflicts.forEach((conflict, index) => {
    nodes.push({
      id: makeNodeId("comparison", `${conflict.a}_${conflict.b}`, index),
      type: "comparison",
      value: {
        kind: "conflict",
        a: conflict.a,
        b: conflict.b,
        reason: conflict.reason,
      },
    });
  });

  compared.alignments.forEach((alignment, index) => {
    const isGuideline = /guideline|doporučení|recommendation/i.test(alignment.note);
    nodes.push({
      id: makeNodeId(isGuideline ? "guideline_alignment" : "comparison", alignment.note, index),
      type: isGuideline ? "guideline_alignment" : "comparison",
      value: {
        kind: "alignment",
        items: alignment.items,
        note: alignment.note,
      },
    });
  });

  compared.priorities.slice(0, 5).forEach((priority, index) => {
    nodes.push({
      id: makeNodeId("comparison", priority.item, index + 100),
      type: "comparison",
      value: {
        kind: "priority",
        item: priority.item,
        score: priority.score,
        category: priority.category,
      },
    });
  });

  nodes.push({
    id: makeNodeId("conclusion", inferred.conclusion, 0),
    type: "conclusion",
    value: {
      text: inferred.conclusion,
      confidence: inferred.confidence,
    },
  });

  inferred.reasoningChain.forEach((step, index) => {
    nodes.push({
      id: makeNodeId("conclusion", step, index + 1),
      type: "conclusion",
      value: { text: step, step: index + 1 },
    });
  });

  return { nodes };
}
