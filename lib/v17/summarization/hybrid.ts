import { summarizeAbstractive } from "@/lib/v17/summarization/abstractive";
import { summarizeExtractive } from "@/lib/v17/summarization/extractive";

export type HybridSummary = {
  mode: "hybrid";
  summary: string;
  sentences: string[];
};

/** V17 hybrid summarization — extractive sentences + abstractive headline. */
export async function summarizeHybrid(text: string): Promise<HybridSummary> {
  const sentences = await summarizeExtractive(text);
  const summary = (await summarizeAbstractive(text)) || sentences.join(" ");
  return { mode: "hybrid", summary, sentences };
}
