/** v25 image section for study games and medicina/hry quizzes. */
export const STUDY_GAME_IMAGE_SECTION = "quizzes";

/** Curated European medical study photo (white-gloved hands, clinical). */
export const STUDY_GAME_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp";

export function sigForStudyGameSlug(slug: string): string {
  const n = Math.abs(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 999);
  return `&sig=${n}`;
}
