/** Safe image sources — curated assets, Unsplash (optional), placeholders */

import type { EditorialTopic } from "../desks";
import type { ArticleImageCandidate, ImageSourceType, ArticleForImageMatch } from "./types";
import { buildAltText } from "./prompts";

const UNSPLASH_BASE = "https://images.unsplash.com";

/** Curated, royalty-free health imagery — diverse, non-political, globally acceptable */
export const CURATED_ASSET_POOL: Record<
  EditorialTopic,
  Array<{ url: string; keywords: string[]; sourceType?: ImageSourceType }>
> = {
  longevity: [
    {
      url: `${UNSPLASH_BASE}/photo-1571019614242-c5c5dee9f50b?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["exercise", "fitness", "movement", "active", "pohyb", "cvičení"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1498837167922-ddd27525d352?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["nutrition", "vegetables", "food", "strava", "výživa"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1544367567-0f2fcb009e0b?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["yoga", "mindfulness", "relax", "wellness", "klid"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1559757148-5c350d0d3c56?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["medical", "health", "care", "prevention", "prevence"],
    },
  ],
  lifestyle: [
    {
      url: `${UNSPLASH_BASE}/photo-1512621776951-a57141f2eefd?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["salad", "healthy eating", "meal", "jídlo", "strava"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1476480862126-209bfaa8edc8?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["walking", "nature", "outdoor", "chůze", "příroda"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1573164713714-d95e436ab8d6?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["digital health", "technology", "app", "wellness"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1506126613408-eca07ce68773?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["meditation", "balance", "calm", "mindfulness"],
    },
  ],
  seniors: [
    {
      url: `${UNSPLASH_BASE}/photo-1581579438749-86c8e8f9f9d0?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["senior", "elderly", "couple", "active", "senioři"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1576765608535-5e04c5a8f0c0?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["care", "support", "community", "peče", "komunita"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["doctor", "consultation", "health", "lékař", "preventivní"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1559757175-5700cde872bc?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["heart", "cardio", "monitoring", "srdce", "vitality"],
    },
  ],
  trending: [
    {
      url: `${UNSPLASH_BASE}/photo-1576091160550-2173dba999ef?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["research", "science", "study", "výzkum", "studie"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1584515930387-285e4804f4cb?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["medicine", "clinical", "healthcare", "medicína"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1530026405186-ed1f139313f8?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["hospital", "care", "public health", "zdravotnictví"],
    },
    {
      url: `${UNSPLASH_BASE}/photo-1635070041078-e363dbe005cb?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`,
      keywords: ["biology", "microscope", "science", "věda"],
    },
  ],
};

/** Local static fallbacks when remote URLs unavailable */
export const LOCAL_PLACEHOLDER_ASSETS: Record<EditorialTopic, string> = {
  longevity: "/assets/affiliate/magnesium.svg",
  lifestyle: "/assets/affiliate/sleep-tracker.svg",
  seniors: "/assets/affiliate/omega-test.svg",
  trending: "/assets/affiliate/magnesium.svg",
};

export function getPlaceholderFallback(topic: EditorialTopic): string {
  return LOCAL_PLACEHOLDER_ASSETS[topic] ?? LOCAL_PLACEHOLDER_ASSETS.longevity;
}

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
