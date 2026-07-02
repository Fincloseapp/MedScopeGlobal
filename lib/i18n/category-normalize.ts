import { MEDICAL_CATEGORIES } from "@/lib/config/categories-seed";
import type { Category } from "@/types/database";

/** Legacy demo categories replaced by medical specialty registry (audit #15). */
const LEGACY_CATEGORY_SLUGS = new Set([
  "technologie",
  "tech",
  "lifestyle",
  "zpravy",
  "news",
]);

const MEDICAL_BY_SLUG = new Map(MEDICAL_CATEGORIES.map((c) => [c.slug, c]));

type CategoryHints = {
  title?: string | null;
  excerpt?: string | null;
  public_topic?: string | null;
  keywords?: string[] | null;
};

/** Infer medical specialty slug from article text when legacy category is wrong. */
export function inferMedicalCategorySlug(hints: CategoryHints): string {
  const blob = [
    hints.title,
    hints.excerpt,
    hints.public_topic,
    ...(hints.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/kardiolog|srdeční|srdec|infarkt|hypertenz|cholesterol/.test(blob)) return "cardiology";
  if (/revmatolog|artrit|lupus|biologik/.test(blob)) return "reumatology";
  if (/psychiatr|duševn|depres|úzkost|senior/.test(blob)) return "psychiatry";
  if (/pediatr|dět|dítě|rodin/.test(blob)) return "pediatrics";
  if (/nutri|strava|výživ|diabet|obezit/.test(blob)) return "endocrinology";
  if (/očkov|chřipk|infek|ebola|covid/.test(blob)) return "infectious-disease";
  if (/onko|nádor|rakovin/.test(blob)) return "oncology";
  if (/neurolog|mozek|mrtvic|epilep/.test(blob)) return "neurology";
  if (/pneumolog|astma|plic/.test(blob)) return "pulmonology";
  if (/rozhovor|prevenc|screening|prohlídk/.test(blob)) return "general-practice";

  switch (hints.public_topic) {
    case "prevence":
    case "rozhovory":
    case "zivotni-styl":
      return "general-practice";
    case "nemoci":
      return "internal-medicine";
    default:
      return "general-practice";
  }
}

/** Replace legacy "Technologie" etc. with inferred medical specialty for display. */
export function normalizeLegacyCategory(
  category: Category | null | undefined,
  hints: CategoryHints
): Category | null | undefined {
  if (!category) return category;
  if (!LEGACY_CATEGORY_SLUGS.has(category.slug)) return category;

  const slug = inferMedicalCategorySlug(hints);
  const seed = MEDICAL_BY_SLUG.get(slug as (typeof MEDICAL_CATEGORIES)[number]["slug"]);
  if (!seed) return category;

  return {
    ...category,
    slug: seed.slug,
    name: seed.nameCs,
  };
}
