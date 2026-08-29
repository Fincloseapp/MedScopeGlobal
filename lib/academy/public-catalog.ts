/**
 * Public visibility of the Academy course catalog.
 *
 * When false (current default): homepage / main nav do not hard-push /academy/courses,
 * and /academy/courses shows a calm “připravujeme” soft landing instead of the weak grid.
 * Direct URLs and academy-internal links still resolve (200).
 *
 * --- Re-enable when course quality is ready ---
 * 1. Set ACADEMY_COURSES_CATALOG_PROMO to true below.
 * 2. Ship / deploy. No other feature flag file is required.
 * Optional: restore nav labels “Kurzy” / “Příprava na přijímačky” that were removed from
 * main-navigation.ts while this was false (search for ACADEMY_COURSES_CATALOG_PROMO comments).
 */
export const ACADEMY_COURSES_CATALOG_PROMO = false;

export function isAcademyCoursesCatalogPromoEnabled(): boolean {
  return ACADEMY_COURSES_CATALOG_PROMO;
}
