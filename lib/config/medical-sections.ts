import {
  CONTENT_TYPE_SPECS,
  rubricSlugsForSection,
  type ContentTypeSlug,
} from "@/lib/config/content-types";
import type { AccessLevelId } from "@/lib/config/access-levels";

export type MedicalSectionSlug =
  | "clinical-medicine"
  | "medical-science-research"
  | "diagnostics-algorithms"
  | "medical-education"
  | "public-health-prevention"
  | "healthcare-technology"
  | "pharma-therapeutics"
  | "enhanced-medical-content";

export interface MedicalSectionSpec {
  slug: MedicalSectionSlug;
  nameKey: string;
  descriptionKey: string;
  /** Formáty obsahu v této sekci (rubric_slug v DB) */
  contentTypeSlugs: ContentTypeSlug[];
}

export const MEDICAL_SECTIONS: MedicalSectionSpec[] = [
  {
    slug: "clinical-medicine",
    nameKey: "sections.clinicalMedicine",
    descriptionKey: "sections.clinicalMedicineDesc",
    contentTypeSlugs: [
      "ai-case-study",
      "ai-treatment-plan",
      "ai-differential",
    ],
  },
  {
    slug: "medical-science-research",
    nameKey: "sections.medicalScience",
    descriptionKey: "sections.medicalScienceDesc",
    contentTypeSlugs: ["ai-study-summary"],
  },
  {
    slug: "diagnostics-algorithms",
    nameKey: "sections.diagnostics",
    descriptionKey: "sections.diagnosticsDesc",
    contentTypeSlugs: ["ai-diagnostic-algorithm", "ai-step-by-step"],
  },
  {
    slug: "medical-education",
    nameKey: "sections.medicalEducation",
    descriptionKey: "sections.medicalEducationDesc",
    contentTypeSlugs: [
      "ai-textbook-summary",
      "ai-quiz",
      "ai-mini-quiz",
      "ai-checklist",
    ],
  },
  {
    slug: "public-health-prevention",
    nameKey: "sections.publicHealth",
    descriptionKey: "sections.publicHealthDesc",
    contentTypeSlugs: ["ai-lay-summary", "ai-patient-education"],
  },
  {
    slug: "healthcare-technology",
    nameKey: "sections.healthcareTech",
    descriptionKey: "sections.healthcareTechDesc",
    contentTypeSlugs: [],
  },
  {
    slug: "pharma-therapeutics",
    nameKey: "sections.pharma",
    descriptionKey: "sections.pharmaDesc",
    contentTypeSlugs: ["ai-treatment-recommendation"],
  },
  {
    slug: "enhanced-medical-content",
    nameKey: "sections.enhancedContent",
    descriptionKey: "sections.enhancedContentDesc",
    contentTypeSlugs: ["ai-guideline-summary"],
  },
];

export function getSection(slug: string) {
  return MEDICAL_SECTIONS.find((s) => s.slug === slug);
}

export function rubricSlugsForSectionQuery(sectionSlug: MedicalSectionSlug): string[] {
  const fromSection = rubricSlugsForSection(sectionSlug);
  if (fromSection.length > 0) return fromSection;
  if (sectionSlug === "healthcare-technology") return [];
  return [];
}

export function contentTypesForAccessLevel(level: AccessLevelId) {
  const rank = { public: 1, student: 2, physician: 3 }[level];
  return CONTENT_TYPE_SPECS.filter(
    (c) => rank >= { public: 1, student: 2, physician: 3 }[c.minAccessLevel]
  );
}
