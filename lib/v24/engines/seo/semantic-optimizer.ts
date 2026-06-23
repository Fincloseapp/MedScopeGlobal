import type { V24ContentDraft } from "@/lib/v24/types";

const INTERNAL_ROUTES: Record<string, string> = {
  medicine: "/studie",
  drugs: "/leky",
  legislation: "/legislativa",
  "digital-health": "/digitalni-zdravi",
  news: "/articles",
  study: "/studium",
  "pre-med": "/studium/priprava",
  specialties: "/obory",
  articles: "/articles",
  quizzes: "/kvizy",
};

const SAFE_EXTERNAL = [
  "https://www.nzip.cz/",
  "https://pubmed.ncbi.nlm.nih.gov/",
  "https://www.who.int/",
  "https://www.ema.europa.eu/",
];

export function optimizeSemantics(
  draft: V24ContentDraft,
  meta: { title: string; description: string; keywords: string[] }
) {
  const internalLinks = [INTERNAL_ROUTES[draft.section] ?? "/articles"].filter(Boolean);
  const externalLinks = SAFE_EXTERNAL.slice(0, 2);
  if (draft.sourceUrl?.startsWith("https://")) externalLinks.unshift(draft.sourceUrl);

  return {
    ...meta,
    internalLinks,
    externalLinks: [...new Set(externalLinks)].slice(0, 4),
  };
}
