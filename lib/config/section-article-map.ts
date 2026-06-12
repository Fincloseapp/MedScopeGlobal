import { rubricSlugsForSection } from "@/lib/config/content-types";
import type { MedicalSectionSlug } from "@/lib/config/medical-sections";
import { V19_RUBRIC_SLUG } from "@/lib/v19/dedup";
import type { ArticleWithRelations } from "@/types/database";

export const V24_RUBRIC_SLUG = "v24-ultra";

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
  "odborne-clanky": "clinical-medicine",
  "pacientska-edukace": "public-health-prevention",
};

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

export function resolveV19Section(article: ArticleWithRelations): MedicalSectionSlug | null {
  const meta = v19Meta(article);
  const articleType = meta.articleType as string | undefined;
  const nzip = meta.nzipCategory as string | undefined;

  if (nzip && NZIP_TO_SECTION[nzip]) return NZIP_TO_SECTION[nzip]!;

  const slug = article.slug.toLowerCase();
  if (slug.includes("prevence") || slug.includes("prevenci")) {
    return "public-health-prevention";
  }
  if (slug.includes("diagnostik")) return "diagnostics-algorithms";
  if (slug.includes("edukac") || slug.includes("vzdelav")) {
    return "medical-education";
  }

  if (articleType && V19_TYPE_TO_SECTION[articleType]) {
    return V19_TYPE_TO_SECTION[articleType]!;
  }

  if (articleType === "brief" || !articleType) return "clinical-medicine";
  return null;
}

export function articleMatchesSection(
  article: ArticleWithRelations,
  sectionSlug: MedicalSectionSlug,
  contentTypeSlug?: string | null
): boolean {
  if (contentTypeSlug && article.rubric_slug === contentTypeSlug) return true;

  const rubrics = rubricSlugsForSection(sectionSlug);
  if (article.rubric_slug && rubrics.includes(article.rubric_slug as (typeof rubrics)[number])) {
    return true;
  }

  if (article.rubric_slug === V19_RUBRIC_SLUG) {
    return resolveV19Section(article) === sectionSlug;
  }

  if (article.rubric_slug === V24_RUBRIC_SLUG) {
    const meta = v19Meta(article);
    if (meta.section === sectionSlug) return true;
    if (sectionSlug === "healthcare-technology") return true;
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
