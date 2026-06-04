import { compare } from "@/lib/v17/reasoning/comparator";
import { evaluate } from "@/lib/v17/reasoning/evaluator";
import { extract } from "@/lib/v17/reasoning/extractor";
import { infer } from "@/lib/v17/reasoning/inference";

export type ReasoningPipelineResult = {
  status: "ok";
  pipeline: {
    facts: unknown[];
    evidence: unknown[];
    comparisons: unknown[];
    conclusion: string;
  };
};

/** V17 reasoning edge — runs extract → evaluate → compare → infer (skeleton). */
export default async function reasoningEdge(input = ""): Promise<ReasoningPipelineResult> {
  const { facts } = await extract(input);
  const { evidence } = await evaluate(facts);
  const { comparisons } = await compare(evidence);
  const { conclusion } = await infer(comparisons);

  return {
    status: "ok",
    pipeline: {
      facts,
      evidence,
      comparisons,
      conclusion,
    },
  };
}
