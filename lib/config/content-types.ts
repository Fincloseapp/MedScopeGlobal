import type { ContentAccessLevel } from "@/lib/config/access-levels";
import type { MedicalSectionSlug } from "@/lib/config/medical-sections";

/** Internal slug (DB column rubric_slug) — unchanged for ingestion compatibility */
export type ContentTypeSlug =
  | "ai-study-summary"
  | "ai-guideline-summary"
  | "ai-textbook-summary"
  | "ai-lay-summary"
  | "ai-diagnostic-algorithm"
  | "ai-treatment-recommendation"
  | "ai-case-study"
  | "ai-quiz"
  | "ai-mini-quiz"
  | "ai-checklist"
  | "ai-step-by-step"
  | "ai-differential"
  | "ai-treatment-plan"
  | "ai-patient-education";

export interface ContentTypeSpec {
  slug: ContentTypeSlug;
  sectionSlug: MedicalSectionSlug;
  nameKey: string;
  minAccessLevel: ContentAccessLevel;
}

export const CONTENT_TYPE_SPECS: ContentTypeSpec[] = [
  {
    slug: "ai-case-study",
    sectionSlug: "clinical-medicine",
    nameKey: "contentTypes.caseStudy",
    minAccessLevel: "student",
  },
  {
    slug: "ai-treatment-plan",
    sectionSlug: "clinical-medicine",
    nameKey: "contentTypes.treatmentPlan",
    minAccessLevel: "physician",
  },
  {
    slug: "ai-differential",
    sectionSlug: "clinical-medicine",
    nameKey: "contentTypes.differential",
    minAccessLevel: "physician",
  },
  {
    slug: "ai-study-summary",
    sectionSlug: "medical-science-research",
    nameKey: "contentTypes.studySummary",
    minAccessLevel: "physician",
  },
  {
    slug: "ai-guideline-summary",
    sectionSlug: "enhanced-medical-content",
    nameKey: "contentTypes.guidelineSummary",
    minAccessLevel: "physician",
  },
  {
    slug: "ai-diagnostic-algorithm",
    sectionSlug: "diagnostics-algorithms",
    nameKey: "contentTypes.diagnosticAlgorithm",
    minAccessLevel: "physician",
  },
  {
    slug: "ai-step-by-step",
    sectionSlug: "diagnostics-algorithms",
    nameKey: "contentTypes.stepByStep",
    minAccessLevel: "student",
  },
  {
    slug: "ai-textbook-summary",
    sectionSlug: "medical-education",
    nameKey: "contentTypes.textbookSummary",
    minAccessLevel: "student",
  },
  {
    slug: "ai-quiz",
    sectionSlug: "medical-education",
    nameKey: "contentTypes.quiz",
    minAccessLevel: "student",
  },
  {
    slug: "ai-mini-quiz",
    sectionSlug: "medical-education",
    nameKey: "contentTypes.miniQuiz",
    minAccessLevel: "student",
  },
  {
    slug: "ai-checklist",
    sectionSlug: "medical-education",
    nameKey: "contentTypes.checklist",
    minAccessLevel: "student",
  },
  {
    slug: "ai-lay-summary",
    sectionSlug: "public-health-prevention",
    nameKey: "contentTypes.laySummary",
    minAccessLevel: "public",
  },
  {
    slug: "ai-patient-education",
    sectionSlug: "public-health-prevention",
    nameKey: "contentTypes.patientEducation",
    minAccessLevel: "public",
  },
  {
    slug: "ai-treatment-recommendation",
    sectionSlug: "pharma-therapeutics",
    nameKey: "contentTypes.treatment",
    minAccessLevel: "physician",
  },
];

export function contentTypesForSection(sectionSlug: MedicalSectionSlug) {
  return CONTENT_TYPE_SPECS.filter((c) => c.sectionSlug === sectionSlug);
}

export function rubricSlugsForSection(sectionSlug: MedicalSectionSlug): string[] {
  return contentTypesForSection(sectionSlug).map((c) => c.slug);
}

/** @deprecated Use CONTENT_TYPE_SPECS */
export const RUBRIC_SPECS = CONTENT_TYPE_SPECS;
export type RubricSlug = ContentTypeSlug;
