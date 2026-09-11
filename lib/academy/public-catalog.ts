/**
 * Public visibility of the Academy course catalog.
 *
 * When false (current default): public catalog stays hidden.
 * /academy and /academy/courses redirect to /studenti. Homepage and main nav
 * do not mention Academy. CME for rheumatologists stays at /academy/lekari.
 *
 * --- Re-enable when course quality is ready ---
 * 1. Set ACADEMY_COURSES_CATALOG_PROMO to true below.
 * 2. Restore homepage/nav links (search ACADEMY_COURSES_CATALOG_PROMO comments).
 */
export const ACADEMY_COURSES_CATALOG_PROMO = false;

export function isAcademyCoursesCatalogPromoEnabled(): boolean {
  return ACADEMY_COURSES_CATALOG_PROMO;
}
