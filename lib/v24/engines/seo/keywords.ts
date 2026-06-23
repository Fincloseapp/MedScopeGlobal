import type { V24ContentDraft } from "@/lib/v24/types";

const SECTION_KEYWORDS: Record<string, string[]> = {
  medicine: ["medicína", "klinická praxe", "evidence-based"],
  drugs: ["léčiva", "SÚKL", "farmakologie"],
  legislation: ["legislativa", "MZČR", "úhrady"],
  "digital-health": ["eHealth", "digitální zdravotnictví", "AI"],
  news: ["novinky", "zdravotnictví"],
  study: ["studium medicíny", "LF", "příprava"],
  "pre-med": ["přijímačky", "příprava na medicínu"],
  specialties: ["lékařský obor", "specializace"],
  articles: ["odborný článek", "medicína"],
  quizzes: ["kvíz", "studijní hra"],
};

export function extractKeywords(draft: V24ContentDraft) {
  const base = new Set([
    ...draft.keywords,
    ...(SECTION_KEYWORDS[draft.section] ?? []),
    ...(draft.specialty ? [draft.specialty.replace(/-/g, " ")] : []),
  ]);
  return [...base].filter(Boolean).slice(0, 12);
}
