/**
 * Canonical public article length targets — shared by ecosystem crons and v25 writers.
 * Czech lay articles: professional magazine depth, not short fluff.
 */

/** Minimum words before expansion/regeneration is triggered. */
export const PUBLIC_ARTICLE_MIN_WORDS = 800;

/** Target word count for generation and expansion passes. */
export const PUBLIC_ARTICLE_TARGET_WORDS = 1500;

/** Soft ceiling — prompts should not exceed this unless expanding an existing draft. */
export const PUBLIC_ARTICLE_MAX_WORDS = 1800;

/** LLM max output tokens for full magazine drafts (Gemini/OpenAI; Groq capped at 4096). */
export const PUBLIC_ARTICLE_MAX_TOKENS = 8192;

/** Minimum words to accept from rate-limited Groq fallback (avoid rejecting all output). */
export const PUBLIC_ARTICLE_SOFT_MIN_WORDS = 750;

/** Human-readable range for prompts. */
export const PUBLIC_ARTICLE_LENGTH_RANGE = "800–1500";

/** Required section archetypes for Czech lay public articles. */
export const PUBLIC_ARTICLE_SECTIONS = [
  "úvod",
  "tělo",
  "praktické tipy",
  "shrnutí",
  "zdroje",
];

export const ARTICLE_LENGTH_CONFIG = {
  minWords: PUBLIC_ARTICLE_MIN_WORDS,
  targetWords: PUBLIC_ARTICLE_TARGET_WORDS,
  maxWords: PUBLIC_ARTICLE_MAX_WORDS,
  maxTokens: PUBLIC_ARTICLE_MAX_TOKENS,
  softMinWords: PUBLIC_ARTICLE_SOFT_MIN_WORDS,
  promptRange: PUBLIC_ARTICLE_LENGTH_RANGE,
  sections: PUBLIC_ARTICLE_SECTIONS,
  /** Minimum <h2> sections including Zdroje */
  minH2Sections: 5,
};
