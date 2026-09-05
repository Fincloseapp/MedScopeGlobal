import { MEDICAL_CATEGORIES } from "@/lib/config/categories-seed";
import { V20_NZIP_CATEGORIES } from "@/lib/v20/categories";

export type TaxonomyKind = "desk" | "specialty";

export type EditorialCategorySeed = {
  slug: string;
  name: string;
  description: string;
  kind: TaxonomyKind;
};

export const EDITORIAL_DESKS: EditorialCategorySeed[] = [
  ...V20_NZIP_CATEGORIES.map((item) => ({
    slug: item.slug,
    name: item.nameCs,
    description: item.descriptionCs,
    kind: "desk" as const,
  })),
  {
    slug: "dlouhovekost",
    name: "Dlouhověkost",
    description: "Prevence, zdravé stárnutí a longevity — hlavní desk ViaLongeVita.",
    kind: "desk",
  },
];

export const SPECIALTY_SEEDS: EditorialCategorySeed[] = MEDICAL_CATEGORIES.map((item) => ({
  slug: item.slug,
  name: item.nameCs,
  description: `${item.nameCs} (${item.name}).`,
  kind: "specialty",
}));

export const EDITORIAL_TAXONOMY: EditorialCategorySeed[] = [
  ...EDITORIAL_DESKS,
  ...SPECIALTY_SEEDS,
];

export const EDITORIAL_SLUGS = new Set(EDITORIAL_TAXONOMY.map((item) => item.slug));
export const DESK_SLUGS = new Set(EDITORIAL_DESKS.map((item) => item.slug));
export const SPECIALTY_SLUGS = new Set(SPECIALTY_SEEDS.map((item) => item.slug));

/** English specialty slug → Czech magazine desk, when both exist. */
export const SPECIALTY_TO_DESK: Record<string, string> = {
  cardiology: "kardiologie",
  rheumatology: "revmatologie",
  neurology: "neurologie",
  ophthalmology: "oftalmologie",
  "internal-medicine": "interni-medicina",
};

export function taxonomySeedBySlug(slug: string): EditorialCategorySeed | undefined {
  return EDITORIAL_TAXONOMY.find((item) => item.slug === slug);
}

export function slugifyCategory(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CategoryHealthKind =
  | "editorial-used"
  | "editorial-empty"
  | "specialty-used"
  | "specialty-empty"
  | "custom-used"
  | "custom-empty"
  | "drafts-only";

export function classifyCategoryRow(input: {
  slug: string;
  published: number;
  drafts: number;
}): CategoryHealthKind {
  const kind = DESK_SLUGS.has(input.slug)
    ? "desk"
    : SPECIALTY_SLUGS.has(input.slug)
      ? "specialty"
      : "custom";
  if (input.published === 0 && input.drafts > 0) return "drafts-only";
  const used = input.published > 0;
  if (kind === "desk") return used ? "editorial-used" : "editorial-empty";
  if (kind === "specialty") return used ? "specialty-used" : "specialty-empty";
  return used ? "custom-used" : "custom-empty";
}

export function categoryKindLabel(slug: string): string {
  if (DESK_SLUGS.has(slug)) return "Redakční desk";
  if (SPECIALTY_SLUGS.has(slug)) return "Lékařský obor";
  return "Vlastní";
}

export function categoryHealthLabel(kind: CategoryHealthKind): string {
  switch (kind) {
    case "editorial-used":
      return "Desk — živý";
    case "editorial-empty":
      return "Desk — prázdný";
    case "specialty-used":
      return "Obor — živý";
    case "specialty-empty":
      return "Obor — prázdný";
    case "custom-used":
      return "Vlastní — živý";
    case "custom-empty":
      return "Vlastní — prázdný";
    case "drafts-only":
      return "Jen koncepty";
  }
}

export function missingEditorialSlugs(existingSlugs: string[]): string[] {
  const have = new Set(existingSlugs);
  return EDITORIAL_TAXONOMY.filter((item) => !have.has(item.slug)).map((item) => item.slug);
}
