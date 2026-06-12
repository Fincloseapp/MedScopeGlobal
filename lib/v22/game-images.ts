import { MEDSCOPE_LOGO } from "@/lib/brand/logo";

/** v25 image section for study games and medicina/hry quizzes. */
export const STUDY_GAME_IMAGE_SECTION = "quizzes";

/** Static fallback — JPG in public/assets/logo (committed, no next/image optimizer required). */
export const STUDY_GAME_IMAGE_FALLBACK = MEDSCOPE_LOGO.transparent;

function quizRenderPath(slug: string): string {
  const safeSlug = slug.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  return `/api/v25/images/render?section=${encodeURIComponent(STUDY_GAME_IMAGE_SECTION)}&slug=${encodeURIComponent(safeSlug)}`;
}

/** Always v25 render API — never DB/registry or legacy Unsplash URLs. */
export function studyGameRenderUrl(slug: string): string {
  return quizRenderPath(slug);
}

export async function resolveStudyGameImageUrl(slug: string): Promise<string> {
  return studyGameRenderUrl(slug);
}

export function resolveStudyGameImageUrlSync(slug: string): string {
  return studyGameRenderUrl(slug);
}
