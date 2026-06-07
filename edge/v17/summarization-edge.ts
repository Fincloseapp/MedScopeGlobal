import { summarizeHybrid } from "@/lib/v17/summarization/hybrid";

export type SummarizationPipelineResult = Awaited<ReturnType<typeof summarizeHybrid>>;

/** V17 summarization edge — hybrid extractive + abstractive summary. */
export default async function summarizationEdge(
  input = ""
): Promise<SummarizationPipelineResult> {
  return summarizeHybrid(input);
}
