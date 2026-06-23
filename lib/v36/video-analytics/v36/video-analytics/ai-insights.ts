import { generateTextFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import type { VideoEngagementStats } from "@/lib/v36/video-analytics/analyzer";
import type { DropOffBucket } from "@/lib/v36/video-analytics/heatmap";

export type VideoAiInsight = {
  summary: string;
  recommendations: string[];
  risk_level: "low" | "medium" | "high";
};

export async function generateVideoInsights(input: {
  title: string;
  stats: VideoEngagementStats;
  heatmap: DropOffBucket[];
}): Promise<VideoAiInsight> {
  const worstBucket = [...input.heatmap].sort((a, b) => b.drop_offs - a.drop_offs)[0];
  const staticInsight: VideoAiInsight = {
    summary: `Video „${input.title}" má ${input.stats.plays} přehrání a ${Math.round(input.stats.completion_rate * 100)}% dokončení.`,
    recommendations: [],
    risk_level: "low",
  };

  if (input.stats.completion_rate < 0.3 && input.stats.plays >= 3) {
    staticInsight.recommendations.push("Nízká míra dokončení — zvažte zkrácení úvodu nebo přidání kapitol.");
    staticInsight.risk_level = "high";
  }
  if (worstBucket && worstBucket.drop_offs > 2) {
    staticInsight.recommendations.push(
      `Největší odchody kolem ${worstBucket.start_sec}–${worstBucket.end_sec} s — zkontrolujte tempo a obtížnost.`
    );
    staticInsight.risk_level = staticInsight.risk_level === "high" ? "high" : "medium";
  }
  if (!staticInsight.recommendations.length) {
    staticInsight.recommendations.push("Engagement v normě — pokračujte v monitorování.");
  }

  if (!isLlmConfigured()) return staticInsight;

  try {
    const text = await generateTextFromLlm({
      system:
        'Odpověz JSON: {"summary":"cs","recommendations":["cs"],"risk_level":"low|medium|high"}',
      user: JSON.stringify({ title: input.title, stats: input.stats, worstBucket }),
      maxTokens: 300,
      temperature: 0.3,
    });
    if (!text) return staticInsight;
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as VideoAiInsight;
  } catch {
    return staticInsight;
  }
}
