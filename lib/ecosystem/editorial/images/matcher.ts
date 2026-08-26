/** Score and select editorial images for article slug/title/excerpt */

import type { EditorialTopic } from "../desks";
import { DEFAULT_TOPIC_WEIGHTS } from "../desks";
import type { ArticleForImageMatch, ArticleImageCandidate } from "./types";
import { buildImageBrief, buildAltText } from "./prompts";
import {
  listCuratedCandidates,
  buildCandidateFromUrl,
  fetchUnsplashIfAvailable,
  getPlaceholderFallback,
} from "./sources";
import { validateImageCompliance } from "./policy";

const TOPIC_KEYWORDS: Record<EditorialTopic, string[]> = {
  longevity: [
    "longevity",
    "dlouhověkost",
    "stárnutí",
    "aging",
    "anti-aging",
    "telomere",
    "biohacking",
    "preventivní",
    "vitality",
  ],
  lifestyle: [
    "lifestyle",
    "životní styl",
    "strava",
    "nutrition",
    "cvičení",
    "exercise",
    "spánek",
    "sleep",
    "wellness",
    "mindfulness",
  ],
  seniors: [
    "senior",
    "senioři",
    "elderly",
    "geriatr",
    "pečovatelsk",
    "domácí péče",
    "mobilita",
    "fall prevention",
  ],
  trending: [
    "zprávy",
    "news",
    "studie",
    "study",
    "výzkum",
    "research",
    "guideline",
    "doporučení",
    "epidemi",
  ],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/** Infer editorial topic from article text using desk-weighted keyword scoring */
export function inferArticleTopic(article: ArticleForImageMatch): EditorialTopic {
  const corpus = `${article.title} ${article.excerpt ?? ""} ${article.content?.slice(0, 500) ?? ""}`;
  const tokens = tokenize(corpus);

  let bestTopic: EditorialTopic = "longevity";
  let bestScore = -1;

  for (const topic of Object.keys(TOPIC_KEYWORDS) as EditorialTopic[]) {
    const keywords = TOPIC_KEYWORDS[topic];
    let hits = 0;
    for (const kw of keywords) {
      if (corpus.toLowerCase().includes(kw.toLowerCase())) hits += 1;
      if (tokens.some((t) => t.includes(kw.toLowerCase()) || kw.toLowerCase().includes(t))) {
        hits += 0.5;
      }
    }
    const weighted = hits * (DEFAULT_TOPIC_WEIGHTS[topic] ?? 0.25);
    if (weighted > bestScore) {
      bestScore = weighted;
      bestTopic = topic;
    }
  }

  return bestTopic;
}

function scoreCandidate(
  candidate: ArticleImageCandidate,
  article: ArticleForImageMatch
): number {
  const corpus = `${article.title} ${article.excerpt ?? ""}`.toLowerCase();
  let score = candidate.score;

  for (const kw of candidate.keywords) {
    if (corpus.includes(kw.toLowerCase())) score += 2;
  }

  // Prefer unique match per slug — stable tie-breaker
  const slugHash = article.slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const urlHash = candidate.url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  score += ((slugHash + urlHash) % 100) / 1000;

  if (candidate.sourceType === "curated") score += 0.5;

  return score;
}

export function rankCuratedCandidates(
  article: ArticleForImageMatch,
  topic: EditorialTopic
): ArticleImageCandidate[] {
  const candidates = listCuratedCandidates(topic).map((c) => {
    const alt = buildAltText(article, topic);
    const scored = { ...c, altTextCs: alt.cs, altTextEn: alt.en, score: scoreCandidate(c, article) };
    return scored;
  });

  return candidates.sort((a, b) => b.score - a.score);
}

/** Select best compliant image for an article */
export async function matchImageForArticle(
  article: ArticleForImageMatch,
  topicOverride?: EditorialTopic
): Promise<ArticleImageCandidate | null> {
  const topic = topicOverride ?? inferArticleTopic(article);
  const brief = buildImageBrief(article, topic);

  const ranked = rankCuratedCandidates(article, topic);

  for (const candidate of ranked) {
    const compliance = validateImageCompliance({
      url: candidate.url,
      altTextCs: candidate.altTextCs,
      altTextEn: candidate.altTextEn,
      topic,
      articleTitle: article.title,
    });
    if (compliance.passed) return candidate;
  }

  // Optional Unsplash when curated pool fails compliance (unlikely) or for variety
  const unsplashUrl = await fetchUnsplashIfAvailable(brief.searchKeywords.slice(0, 3).join(" "));
  if (unsplashUrl) {
    const candidate = buildCandidateFromUrl(
      unsplashUrl,
      topic,
      "unsplash",
      article,
      1,
      brief.searchKeywords
    );
    const compliance = validateImageCompliance({
      url: candidate.url,
      altTextCs: candidate.altTextCs,
      altTextEn: candidate.altTextEn,
      topic,
      articleTitle: article.title,
    });
    if (compliance.passed) return candidate;
  }

  // SVG placeholder fallback — always compliant
  const fallbackUrl = getPlaceholderFallback(topic);
  const fallback = buildCandidateFromUrl(fallbackUrl, topic, "placeholder", article, 0, []);
  const compliance = validateImageCompliance({
    url: fallback.url,
    altTextCs: fallback.altTextCs,
    altTextEn: fallback.altTextEn,
    topic,
    articleTitle: article.title,
  });
  return compliance.passed ? fallback : null;
}

export function matchImageForArticleSync(
  article: ArticleForImageMatch,
  topicOverride?: EditorialTopic
): ArticleImageCandidate | null {
  const topic = topicOverride ?? inferArticleTopic(article);
  const ranked = rankCuratedCandidates(article, topic);

  for (const candidate of ranked) {
    const compliance = validateImageCompliance({
      url: candidate.url,
      altTextCs: candidate.altTextCs,
      altTextEn: candidate.altTextEn,
      topic,
      articleTitle: article.title,
    });
    if (compliance.passed) return candidate;
  }

  const fallbackUrl = getPlaceholderFallback(topic);
  const fallback = buildCandidateFromUrl(fallbackUrl, topic, "placeholder", article, 0, []);
  return fallback;
}
