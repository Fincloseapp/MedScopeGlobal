/** Safe image sources — curated local assets + optional Unsplash search */

import type { EditorialTopic } from "../desks";
import type { ArticleImageCandidate, ImageSourceType, ArticleForImageMatch } from "./types";
import { buildAltText } from "./prompts";
import {
  getCoverPoolForTopic,
  VISUAL_TOPIC_KEYWORDS,
  type CoverVisualTopic,
} from "./cover";

/** @deprecated Use listCuratedCandidatesForVisualTopic — kept for import stability */
export const CURATED_ASSET_POOL: Record<
  EditorialTopic,
  Array<{ url: string; keywords: string[]; sourceType?: ImageSourceType }>
> = {
  longevity: [
    {
      url: "/assets/covers/movement.webp",
      keywords: ["exercise", "fitness", "movement", "active", "pohyb", "cvičení"],
    },
    {
      url: "/assets/covers/produce.webp",
      keywords: ["nutrition", "vegetables", "food", "strava", "výživa"],
    },
    {
      url: "/assets/covers/calm.webp",
      keywords: ["yoga", "mindfulness", "relax", "wellness", "klid"],
    },
    {
      url: "/assets/covers/vitals.webp",
      keywords: ["medical", "health", "care", "prevention", "prevence"],
    },
  ],
  lifestyle: [
    {
      url: "/assets/covers/food.webp",
      keywords: ["salad", "healthy eating", "meal", "jídlo", "strava", "talíř"],
    },
    {
      url: "/assets/covers/walk.webp",
      keywords: ["walking", "nature", "outdoor", "chůze", "příroda"],
    },
    {
      url: "/assets/covers/tech.webp",
      keywords: ["digital health", "technology", "app", "wellness"],
    },
    {
      url: "/assets/covers/calm-2.webp",
      keywords: ["meditation", "balance", "calm", "mindfulness"],
    },
    {
      url: "/assets/covers/food-2.webp",
      keywords: ["meal", "diet", "strava", "jídlo", "talíř", "středomořsk"],
    },
    {
      url: "/assets/covers/sleep.webp",
      keywords: ["sleep", "rest", "spánek", "odpočinek"],
    },
  ],
  seniors: [
    {
      url: "/assets/covers/seniors.webp",
      keywords: ["senior", "elderly", "couple", "active", "senioři"],
    },
    {
      url: "/assets/covers/walk.webp",
      keywords: ["care", "support", "community", "péče", "komunita"],
    },
    {
      url: "/assets/covers/research.webp",
      keywords: ["doctor", "consultation", "health", "lékař", "preventivní"],
    },
    {
      url: "/assets/covers/clinical.webp",
      keywords: ["heart", "cardio", "monitoring", "srdce", "vitality"],
    },
  ],
  trending: [
    {
      url: "/assets/covers/research.webp",
      keywords: ["research", "science", "study", "výzkum", "studie"],
    },
    {
      url: "/assets/covers/clinical.webp",
      keywords: ["medicine", "clinical", "healthcare", "medicína"],
    },
    {
      url: "/assets/covers/research-2.webp",
      keywords: ["hospital", "care", "public health", "zdravotnictví"],
    },
    {
      url: "/assets/covers/science.webp",
      keywords: ["biology", "microscope", "science", "věda"],
    },
  ],
};

/** Local static fallbacks when remote URLs unavailable — keyed by visual topic. */
export const LOCAL_PLACEHOLDER_ASSETS: Record<CoverVisualTopic, string> = {
  food: "/assets/covers/food.webp",
  sleep: "/assets/covers/sleep.webp",
  calm: "/assets/covers/calm.webp",
  movement: "/assets/covers/movement.webp",
  seniors: "/assets/covers/seniors.webp",
  clinical: "/assets/covers/clinical.webp",
  research: "/assets/covers/research.webp",
  tech: "/assets/covers/tech.webp",
  vitals: "/assets/covers/vitals.webp",
  walk: "/assets/covers/walk.webp",
};

export function getPlaceholderFallback(visualTopic: CoverVisualTopic): string {
  return LOCAL_PLACEHOLDER_ASSETS[visualTopic] ?? LOCAL_PLACEHOLDER_ASSETS.research;
}

/** Primary candidate list — uses the same pool as resolveArticleCoverUrl. */
export function listCuratedCandidatesForVisualTopic(
  visualTopic: CoverVisualTopic
): ArticleImageCandidate[] {
  const keywords = [...VISUAL_TOPIC_KEYWORDS[visualTopic]];
  const editorialTopic =
    visualTopic === "seniors"
      ? "seniors"
      : visualTopic === "clinical" ||
          visualTopic === "research" ||
          visualTopic === "tech" ||
          visualTopic === "vitals"
        ? "trending"
        : "lifestyle";

  return getCoverPoolForTopic(visualTopic).map((url) => ({
    url,
    sourceType: "curated" as const,
    topic: editorialTopic as EditorialTopic,
    score: 0,
    keywords,
    altTextCs: "",
    altTextEn: "",
  }));
}

/** @deprecated Prefer listCuratedCandidatesForVisualTopic */
export function listCuratedCandidates(topic: EditorialTopic): ArticleImageCandidate[] {
  return CURATED_ASSET_POOL[topic].map((asset) => ({
    url: asset.url,
    sourceType: asset.sourceType ?? "curated",
    topic,
    score: 0,
    keywords: asset.keywords,
    altTextCs: "",
    altTextEn: "",
  }));
}

/** Optional Unsplash search when UNSPLASH_ACCESS_KEY is set — scaffold for future AI */
export async function fetchUnsplashIfAvailable(
  query: string
): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) return null;

  try {
    const params = new URLSearchParams({
      query: `${query} health wellness diverse`,
      per_page: "1",
      orientation: "landscape",
      content_filter: "high",
    });
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{ urls?: { regular?: string } }>;
    };
    const url = data.results?.[0]?.urls?.regular;
    if (!url) return null;
    return `${url}${url.includes("?") ? "&" : "?"}w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`;
  } catch {
    return null;
  }
}

export function buildCandidateFromUrl(
  url: string,
  topic: EditorialTopic,
  sourceType: ImageSourceType,
  article: Pick<ArticleForImageMatch, "title" | "excerpt">,
  score: number,
  keywords: string[] = []
): ArticleImageCandidate {
  const alt = buildAltText(
    { id: "", slug: "", title: article.title, excerpt: article.excerpt },
    topic
  );
  return {
    url,
    sourceType,
    topic,
    score,
    keywords,
    altTextCs: alt.cs,
    altTextEn: alt.en,
  };
}
