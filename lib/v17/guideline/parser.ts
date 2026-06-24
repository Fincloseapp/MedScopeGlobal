export type GuidelineMatch = {
  title: string;
  source: string;
  excerpt: string;
};

export type GuidelineParseResult = {
  query: string;
  matches: GuidelineMatch[];
};

/** Parse guideline query into structured placeholder matches (skeleton). */
export function parseGuidelineQuery(input: string): GuidelineParseResult {
  const query = input.trim();
  if (!query) {
    return { query: "", matches: [] };
  }

  const excerpt =
    query.length > 160 ? `${query.slice(0, 160).trim()}…` : query;

  return {
    query,
    matches: [
      {
        title: "Clinical practice note (V17 skeleton)",
        source: "internal:v17-guideline",
        excerpt,
      },
    ],
  };
}
