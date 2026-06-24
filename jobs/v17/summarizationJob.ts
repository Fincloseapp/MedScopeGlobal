import summarizationEdge from "@/edge/v17/summarization-edge";

/** V17 summarization job. */
export default async function summarizationJob(input = "") {
  return summarizationEdge(input);
}
