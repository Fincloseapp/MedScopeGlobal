import { resolvePublicImageUrl, resolvePublicImageUrlSync } from "@/lib/v25/images/resolve-public";

/** v25 image section for study games and medicina/hry quizzes. */
export const STUDY_GAME_IMAGE_SECTION = "quizzes";

/** Static fallback when v25 render or remote image fails. */
export const STUDY_GAME_IMAGE_FALLBACK = "/assets/logo/Logo_Transparent.webp";

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
