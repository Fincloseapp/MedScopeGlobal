/** Academy free preview — first ~30% of lessons unlocked without subscription */

export const FREE_PREVIEW_FRACTION = 0.3;

export function getFreePreviewLessonCount(totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  return Math.max(1, Math.ceil(totalLessons * FREE_PREVIEW_FRACTION));
}

export function isLessonFreePreview(lessonIndex: number, totalLessons: number): boolean {
  if (lessonIndex < 0 || totalLessons <= 0) return false;
  return lessonIndex < getFreePreviewLessonCount(totalLessons);
}

export function formatFreePreviewLabel(totalLessons: number): string {
  const free = getFreePreviewLessonCount(totalLessons);
  if (totalLessons <= 0) return "Náhled zdarma";
  const pct = Math.round((free / totalLessons) * 100);
  return `${free} z ${totalLessons} lekcí zdarma (≈${pct} %)`;
}
