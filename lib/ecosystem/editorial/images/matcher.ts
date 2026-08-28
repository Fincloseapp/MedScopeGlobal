/** Score and select editorial images for article slug/title/excerpt */

import type { EditorialTopic } from "../desks";
import { DEFAULT_TOPIC_WEIGHTS } from "../desks";
import type { ArticleForImageMatch, ArticleImageCandidate } from "./types";
import { buildImageBrief, buildAltText } from "./prompts";
import {
  buildCandidateFromUrl,
  fetchUnsplashIfAvailable,
  getPlaceholderFallback,
  listCuratedCandidatesForVisualTopic,
} from "./sources";
import { validateImageCompliance } from "./policy";
import {
  classifyCoverTopic,
  mapCoverVisualTopicToEditorialTopic,
  type CoverVisualTopic,
} from "./cover";

const TOPIC_KEYWORDS: Record<EditorialTopic, string[]> = {
  longevity: [
    "longevity",
    "dlouhověkost",
    "dlouhovekost",
    "stárnutí",
    "starnuti",
    "aging",
    "anti-aging",
    "telomere",
    "biohacking",
    "preventivní",
    "preventivni",
    "vitality",
  ],
  lifestyle: [
    "lifestyle",
    "životní styl",
    "zivotni styl",
    "strava",
    "nutrition",
    "výživa",
    "vyziva",
    "cvičení",
    "cviceni",
    "exercise",
    "spánek",
    "spanek",
    "sleep",
    "wellness",
    "mindfulness",
    "talíř",
    "talir",
    "středomořsk",
    "stredomorsk",
    "kuchyn",
    "jídlo",
    "jidlo",
    "meal",
    "diet",
    "salát",
    "salat",
    "potravin",
    "ovoce",
    "zelenin",
    "bílkovin",
    "bilkovin",
    "protein",
    "sytost",
    "recept",
  ],
  seniors: [
    "senior",
    "senioři",
    "seniori",
    "elderly",
    "geriatr",
    "pečovatelsk",
    "pecovatelsk",
    "domácí péče",
    "domaci pece",
    "mobilita",
    "fall prevention",
    "menopauz",
    "důchod",
    "duchod",
  ],
  trending: [
    "zprávy",
    "zpravy",
    "news",
    "studie",
    "study",
    "výzkum",
    "vyzkum",
    "research",
    "guideline",
    "doporučení",
    "doporuceni",
    "epidemi",
    "biomarker",
    "klinick",
    "nemoc",
    "chorob",
  ],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function articleHaystack(article: ArticleForImageMatch): string {
  const publicTopic =
    typeof article.metadata?.public_topic === "string"
      ? article.metadata.public_topic
      : null;
  return `${article.title} ${article.excerpt ?? ""} ${article.content?.slice(0, 500) ?? ""} ${publicTopic ?? ""}`;
}

/** Infer editorial desk topic from article text (metadata / alt-text). */
export function inferArticleTopic(article: ArticleForImageMatch): EditorialTopic {
  const corpus = articleHaystack(article);
  const tokens = tokenize(corpus);

  let bestTopic: EditorialTopic = "lifestyle";
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

/** Infer visual cover topic — shared classifier with article page + listings. */
export function inferVisualTopic(article: ArticleForImageMatch): CoverVisualTopic {
  const publicTopic =
    typeof article.metadata?.public_topic === "string"
      ? article.metadata.public_topic
      : null;
  return classifyCoverTopic({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    publicTopic,
  });
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

  const slugHash = article.slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const urlHash = candidate.url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  score += ((slugHash + urlHash) % 100) / 1000;

  if (candidate.sourceType === "curated") score += 0.5;

  return score;
}

export function rankCuratedCandidates(
  article: ArticleForImageMatch,
  visualTopic: CoverVisualTopic
): ArticleImageCandidate[] {
  const editorialTopic = mapCoverVisualTopicToEditorialTopic(visualTopic);
  const candidates = listCuratedCandidatesForVisualTopic(visualTopic).map((c) => {
    const alt = buildAltText(article, editorialTopic);
    const scored = {
      ...c,
      topic: editorialTopic,
      altTextCs: alt.cs,
      altTextEn: alt.en,
      score: scoreCandidate({ ...c, topic: editorialTopic, altTextCs: alt.cs, altTextEn: alt.en }, article),
    };
    return scored;
  });

  return candidates.sort((a, b) => b.score - a.score);
}

/** Select best compliant image for an article */
export async function matchImageForArticle(
  article: ArticleForImageMatch,
  topicOverride?: EditorialTopic
): Promise<ArticleImageCandidate | null> {
  const visualTopic = inferVisualTopic(article);
  const editorialTopic =
    topicOverride ?? mapCoverVisualTopicToEditorialTopic(visualTopic);
  const brief = buildImageBrief(article, editorialTopic);

  const ranked = rankCuratedCandidates(article, visualTopic);

  for (const candidate of ranked) {
    const compliance = validateImageCompliance({
      url: candidate.url,
      altTextCs: candidate.altTextCs,
      altTextEn: candidate.altTextEn,
      topic: editorialTopic,
      articleTitle: article.title,
      articleSlug: article.slug,
      excerpt: article.excerpt,
      visualTopic,
    });
    if (compliance.passed) return { ...candidate, topic: editorialTopic };
  }

  const unsplashUrl = await fetchUnsplashIfAvailable(brief.searchKeywords.slice(0, 3).join(" "));
  if (unsplashUrl) {
    const candidate = buildCandidateFromUrl(
      unsplashUrl,
      editorialTopic,
      "unsplash",
      article,
      1,
      brief.searchKeywords
    );
    const compliance = validateImageCompliance({
      url: candidate.url,
      altTextCs: candidate.altTextCs,
      altTextEn: candidate.altTextEn,
      topic: editorialTopic,
      articleTitle: article.title,
      articleSlug: article.slug,
      excerpt: article.excerpt,
      visualTopic,
    });
    if (compliance.passed) return candidate;
  }

  const fallbackUrl = getPlaceholderFallback(visualTopic);
  const fallback = buildCandidateFromUrl(
    fallbackUrl,
    editorialTopic,
    "placeholder",
    article,
    0,
    []
  );
  const compliance = validateImageCompliance({
    url: fallback.url,
    altTextCs: fallback.altTextCs,
    altTextEn: fallback.altTextEn,
    topic: editorialTopic,
    articleTitle: article.title,
    articleSlug: article.slug,
    excerpt: article.excerpt,
    visualTopic,
  });
  return compliance.passed ? fallback : null;
}

export function matchImageForArticleSync(
  article: ArticleForImageMatch,
  topicOverride?: EditorialTopic
): ArticleImageCandidate | null {
  const visualTopic = inferVisualTopic(article);
  const editorialTopic =
    topicOverride ?? mapCoverVisualTopicToEditorialTopic(visualTopic);
  const ranked = rankCuratedCandidates(article, visualTopic);

  for (const candidate of ranked) {
    const compliance = validateImageCompliance({
      url: candidate.url,
      altTextCs: candidate.altTextCs,
      altTextEn: candidate.altTextEn,
      topic: editorialTopic,
      articleTitle: article.title,
      articleSlug: article.slug,
      excerpt: article.excerpt,
      visualTopic,
    });
    if (compliance.passed) return { ...candidate, topic: editorialTopic };
  }

  const fallbackUrl = getPlaceholderFallback(visualTopic);
  return buildCandidateFromUrl(fallbackUrl, editorialTopic, "placeholder", article, 0, []);
}
