import { MEDSCOPE_LOGO } from "@/lib/brand/logo";
import { resolvePublicImageUrl, resolvePublicImageUrlSync } from "@/lib/v25/images/resolve-public";

/** v25 image section for study games and medicina/hry quizzes. */
export const STUDY_GAME_IMAGE_SECTION = "quizzes";

/** Static fallback — JPG in public/assets/logo (committed, no next/image optimizer required). */
export const STUDY_GAME_IMAGE_FALLBACK = MEDSCOPE_LOGO.transparent;

export function studyGameRenderUrl(slug: string): string {
  return resolvePublicImageUrlSync({
    section: STUDY_GAME_IMAGE_SECTION,
    slug,
  });
}

export async function resolveStudyGameImageUrl(
  slug: string,
  legacyUrl?: string | null
): Promise<string> {
  return resolvePublicImageUrl({
    section: STUDY_GAME_IMAGE_SECTION,
    slug,
    dbUrl: legacyUrl,
  });
}

export function resolveStudyGameImageUrlSync(
  slug: string,
  legacyUrl?: string | null
): string {
  return resolvePublicImageUrlSync({
    section: STUDY_GAME_IMAGE_SECTION,
    slug,
    dbUrl: legacyUrl,
  });
}
