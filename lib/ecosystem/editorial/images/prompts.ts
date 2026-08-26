/** Image brief templates aligned with article text and editorial topics */

import type { EditorialTopic } from "../desks";
import type { ArticleForImageMatch } from "./types";
import { TOPIC_VISUAL_GUIDELINES } from "./policy";

export type ImageBrief = {
  topic: EditorialTopic;
  prompt: string;
  searchKeywords: string[];
  mood: string;
  disclaimers: string[];
};

const TOPIC_BRIEFS: Record<EditorialTopic, Omit<ImageBrief, "topic">> = {
  longevity: {
    prompt:
      "Editorial health photo: diverse adults practicing longevity habits — walking, balanced nutrition, restorative sleep. Warm natural light, no medical claims, no political symbols.",
    searchKeywords: ["healthy aging", "active senior", "wellness lifestyle", "longevity"],
    mood: "optimistic, evidence-based, globally inclusive",
    disclaimers: ["Ilustrační foto — nenahrazuje lékařskou péči", "Stock image — not medical advice"],
  },
  lifestyle: {
    prompt:
      "Editorial lifestyle photo: inclusive group enjoying everyday wellness — fresh food, gentle exercise, mindfulness. Subtle, non-commercial, seniors-friendly.",
    searchKeywords: ["healthy lifestyle", "wellness", "nutrition", "mindful living"],
    mood: "approachable, calm, diverse ages",
    disclaimers: ["Ilustrační foto — individuální doporučení konzultujte s lékařem"],
  },
  seniors: {
    prompt:
      "Dignified seniors-friendly health imagery: older adults staying active with support, community, mobility aids used positively. Respectful, never patronizing.",
    searchKeywords: ["seniors health", "active elderly", "community care", "healthy aging"],
    mood: "dignified, supportive, accessible",
    disclaimers: ["Ilustrační foto — obsah není personalizovaná zdravotní rada"],
  },
  trending: {
    prompt:
      "Neutral health news visual: research, prevention, public health context. Informative, non-alarmist, no political or partisan imagery.",
    searchKeywords: ["health research", "medical science", "public health", "prevention"],
    mood: "informative, neutral, professional",
    disclaimers: ["Ilustrační foto k redakčnímu článku"],
  },
};

export function buildImageBrief(
  article: ArticleForImageMatch,
  topic: EditorialTopic
): ImageBrief {
  const base = TOPIC_BRIEFS[topic];
  const excerpt = article.excerpt?.slice(0, 120) ?? "";
  return {
    topic,
    ...base,
    prompt: `${base.prompt} Article: "${article.title}". ${excerpt ? `Context: ${excerpt}` : ""}`.trim(),
    searchKeywords: [
      ...base.searchKeywords,
      ...extractKeywords(article.title),
    ],
  };
}

export function buildAltText(
  article: ArticleForImageMatch,
  topic: EditorialTopic
): { cs: string; en: string } {
  const title = article.title.trim();
  const topicLabels: Record<EditorialTopic, { cs: string; en: string }> = {
    longevity: { cs: "dlouhověkost a zdravé stárnutí", en: "longevity and healthy aging" },
    lifestyle: { cs: "zdravý životní styl", en: "healthy lifestyle" },
    seniors: { cs: "zdraví seniorů", en: "seniors health" },
    trending: { cs: "aktuální zdravotní téma", en: "current health topic" },
  };
  const label = topicLabels[topic];
  return {
    cs: `Ilustrační foto k článku „${title}" — ${label.cs}, různorodá skupina dospělých`,
    en: `Illustration for "${title}" — ${label.en}, diverse group of adults`,
  };
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 6);
}

export function getTopicVisualGuidelines(topic: EditorialTopic) {
  return TOPIC_VISUAL_GUIDELINES[topic];
}
