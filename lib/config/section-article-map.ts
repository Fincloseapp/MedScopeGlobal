import { rubricSlugsForSection } from "@/lib/config/content-types";
import type { MedicalSectionSlug } from "@/lib/config/medical-sections";
import { MEDICAL_SECTIONS } from "@/lib/config/medical-sections";
import { V19_RUBRIC_SLUG } from "@/lib/v19/dedup";
import type { ArticleWithRelations } from "@/types/database";

export { V19_RUBRIC_SLUG };
export const V24_RUBRIC_SLUG = "v24-ultra";

/** v24 engine section id → platform medical section */
export const V24_SECTION_TO_MEDICAL: Record<string, MedicalSectionSlug> = {
  medicine: "clinical-medicine",
  drugs: "pharma-therapeutics",
  legislation: "enhanced-medical-content",
  "digital-health": "healthcare-technology",
  news: "clinical-medicine",
  study: "medical-education",
  "pre-med": "medical-education",
  specialties: "clinical-medicine",
  articles: "clinical-medicine",
  quizzes: "medical-education",
};

const V19_TYPE_TO_SECTION: Record<string, MedicalSectionSlug> = {
  brief: "clinical-medicine",
  "clinical-context": "clinical-medicine",
  "science-note": "medical-science-research",
  education: "medical-education",
  prevention: "public-health-prevention",
};

const NZIP_TO_SECTION: Partial<Record<string, MedicalSectionSlug>> = {
  diagnostika: "diagnostics-algorithms",
  doporuceni: "enhanced-medical-content",
  prevence: "public-health-prevention",
  publikace: "medical-science-research",
  "vedecke-aktuality": "medical-science-research",
  "odborne-clanky": "clinical-medicine",
  "pacientska-edukace": "public-health-prevention",
};

/** Sections that show all v19/v24 professional briefs when no tighter mapping matches */
const V19_V24_POOL_SECTIONS: MedicalSectionSlug[] = [
  "medical-science-research",
  "enhanced-medical-content",
];

export function rubricSlugsForSectionFetch(sectionSlug: MedicalSectionSlug): string[] {
  const slugs = new Set([
    ...rubricSlugsForSection(sectionSlug),
    V19_RUBRIC_SLUG,
    V24_RUBRIC_SLUG,
  ]);
  return [...slugs];
}

function v19Meta(article: ArticleWithRelations): Record<string, unknown> {
  return (article.quiz_json ?? {}) as Record<string, unknown>;
}

export function resolveV24Section(article: ArticleWithRelations): MedicalSectionSlug | null {
  if (article.rubric_slug !== V24_RUBRIC_SLUG) return null;
  const meta = v19Meta(article);
  const v24Section = meta.section as string | undefined;
  if (v24Section && V24_SECTION_TO_MEDICAL[v24Section]) {
    return V24_SECTION_TO_MEDICAL[v24Section]!;
  }
  return sectionSlugFromSlug(article.slug);
}

function sectionSlugFromSlug(slug: string): MedicalSectionSlug | null {
  const match = slug.match(/^v24-([a-z-]+)-/);
  if (!match) return null;
  const v24Id = match[1];
  return V24_SECTION_TO_MEDICAL[v24Id] ?? null;
}

export function resolveV19Section(article: ArticleWithRelations): MedicalSectionSlug | null {
  if (article.rubric_slug !== V19_RUBRIC_SLUG) return null;

  const meta = v19Meta(article);
  const articleType = meta.articleType as string | undefined;
  const nzip = meta.nzipCategory as string | undefined;
  const sourceTier = meta.sourceTier as string | undefined;

  if (nzip && NZIP_TO_SECTION[nzip]) return NZIP_TO_SECTION[nzip]!;

  const slug = article.slug.toLowerCase();
  if (slug.includes("prevence") || slug.includes("prevenci")) {
    return "public-health-prevention";
  }
  if (slug.includes("diagnostik")) return "diagnostics-algorithms";
  if (slug.includes("edukac") || slug.includes("vzdelav")) {
    return "medical-education";
  }
  if (
    slug.includes("vyzkum") ||
    slug.includes("studie") ||
    slug.includes("publikac") ||
    slug.includes("vedeck")
  ) {
    return "medical-science-research";
  }
  if (
    slug.includes("smernic") ||
    slug.includes("legislativ") ||
    slug.includes("doporucen") ||
    slug.includes("guideline")
  ) {
    return "enhanced-medical-content";
  }

  if (articleType === "science-note" || sourceTier === "science") {
    return "medical-science-research";
  }

  if (articleType === "clinical-context") {
    return "enhanced-medical-content";
  }

  if (articleType && V19_TYPE_TO_SECTION[articleType]) {
    return V19_TYPE_TO_SECTION[articleType]!;
  }

  if (articleType === "brief" || !articleType) return "clinical-medicine";
  return null;
}

export function resolveArticleMedicalSections(
  article: ArticleWithRelations
): MedicalSectionSlug[] {
  const sections = new Set<MedicalSectionSlug>();

  const v19 = resolveV19Section(article);
  if (v19) sections.add(v19);

  const v24 =
    resolveV24Section(article) ??
    (article.rubric_slug === V24_RUBRIC_SLUG ? sectionSlugFromSlug(article.slug) : null);
  if (v24) sections.add(v24);

  if (article.rubric_slug) {
    for (const section of MEDICAL_SECTIONS) {
      const typeRubrics = rubricSlugsForSection(section.slug);
      if (typeRubrics.includes(article.rubric_slug as (typeof typeRubrics)[number])) {
        sections.add(section.slug);
      }
    }
  }

  return [...sections];
}

export function articleMatchesSection(
  article: ArticleWithRelations,
  sectionSlug: MedicalSectionSlug,
  contentTypeSlug?: string | null
): boolean {
  if (contentTypeSlug && article.rubric_slug === contentTypeSlug) return true;

  const mapped = resolveArticleMedicalSections(article);
  if (mapped.includes(sectionSlug)) return true;

  if (
    V19_V24_POOL_SECTIONS.includes(sectionSlug) &&
    (article.rubric_slug === V19_RUBRIC_SLUG || article.rubric_slug === V24_RUBRIC_SLUG) &&
    !isLayAudienceArticle(article)
  ) {
    return true;
  }

  return false;
}

export function isLayAudienceArticle(article: ArticleWithRelations): boolean {
  if (article.audience === "public") return true;
  if (article.rubric_slug === "verejnost") return true;
  const rubric = article.rubric_slug ?? "";
  return rubric === "ai-lay-summary" || rubric === "ai-patient-education";
}

export function sectionShowsLayContent(sectionSlug: MedicalSectionSlug): boolean {
  return sectionSlug === "public-health-prevention";
}

export type SectionHubLink = { label: string; href: string };

export function sectionHubLinks(sectionSlug: MedicalSectionSlug): SectionHubLink[] {
  const common: SectionHubLink[] = [
    { label: "Odborné briefy", href: "/odborne/briefy" },
    { label: "Všechny články", href: "/articles" },
  ];

  switch (sectionSlug) {
    case "clinical-medicine":
      return [{ label: "Odborná sekce (ČLK)", href: "/odborna" }, ...common];
    case "medical-science-research":
      return [{ label: "Vědecké zdroje", href: "/odborne/zdroje" }, ...common];
    case "diagnostics-algorithms":
      return [{ label: "AI medicína", href: "/ai-medical" }, ...common];
    case "medical-education":
      return [
        { label: "Medicína — studium", href: "/medicina/studium" },
        { label: "Příprava na LF", href: "/medicina/priprava" },
        ...common,
      ];
    case "public-health-prevention":
      return [{ label: "Veřejnost", href: "/verejnost" }, ...common];
    case "healthcare-technology":
      return [{ label: "Digitální zdravotnictví", href: "/digital-health" }, ...common];
    case "pharma-therapeutics":
      return [{ label: "Léky a SÚKL", href: "/leky/schvalene" }, ...common];
    case "enhanced-medical-content":
      return [{ label: "Legislativa", href: "/legislativa" }, ...common];
    default:
      return common;
  }
}
