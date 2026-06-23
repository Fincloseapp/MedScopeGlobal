/**
 * v25.1 Missing Image Detector — scan sections, queue items without images.
 */
import { selectImageForItem } from "./selector-engine.mjs";
import { isLegacyImageUrl } from "./legacy-images.mjs";

/** Static university faculty catalog (no DB table for images). */
const UNIVERSITY_FACULTIES = [
  { slug: "lf-uk-1", title: "1. lékařská fakulta UK", section: "university-faculty" },
  { slug: "lf-uk-2", title: "2. lékařská fakulta UK", section: "university-faculty" },
  { slug: "lf-uk-3", title: "3. lékařská fakulta UK", section: "university-faculty" },
  { slug: "lf-mu", title: "LF MU Brno", section: "university-faculty" },
  { slug: "lf-up", title: "LF UP Olomouc", section: "university-faculty" },
  { slug: "lf-ou", title: "LF OU Ostrava", section: "university-faculty" },
  { slug: "lf-plzen", title: "LF v Plzni", section: "university-faculty" },
  { slug: "lf-hradec", title: "LF HK", section: "university-faculty" },
];

/**
 * Detect missing images from pre-fetched rows (TS layer loads from Supabase).
 * @param {Array<{ id: string; slug: string; section: string; title: string; excerpt?: string; body?: string; imageUrl?: string | null }>} rows
 */
export function detectMissingImages(rows) {
  const missing = [];
  const hasImage = [];
  const skipped = [];

  for (const row of rows) {
    const sel = selectImageForItem(row);
    if (sel.action === "skip") {
      skipped.push({ ...row, reason: sel.reason });
      hasImage.push(row);
    } else if (sel.action === "use-registry") {
      missing.push({ ...row, ...sel, needsGeneration: false, needsDbUpdate: true });
    } else {
      missing.push({ ...row, ...sel, needsGeneration: true, needsDbUpdate: true });
    }
  }

  return {
    at: new Date().toISOString(),
    total: rows.length,
    withImage: hasImage.length,
    missing: missing.length,
    skipped: skipped.length,
    legacy: rows.filter((r) => r.imageUrl && isLegacyImageUrl(r.imageUrl)).length,
    items: missing,
  };
}

export function buildStaticMissingFaculties(registryImages = []) {
  const regSet = new Set(registryImages.map((i) => `${i.section}:${i.slug}`));
  return UNIVERSITY_FACULTIES.filter((f) => !regSet.has(`university-faculty:${f.slug}`)).map((f) => ({
    id: `faculty-${f.slug}`,
    slug: f.slug,
    section: f.section,
    title: f.title,
    imageUrl: null,
  }));
}

export { UNIVERSITY_FACULTIES };
