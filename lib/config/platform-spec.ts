import type { ContentAccessLevel } from "@/lib/config/access-levels";
import {
  CONTENT_TYPE_SPECS,
  type ContentTypeSlug,
} from "@/lib/config/content-types";

export type { ContentTypeSlug, ContentTypeSpec } from "@/lib/config/content-types";
export { CONTENT_TYPE_SPECS, RUBRIC_SPECS } from "@/lib/config/content-types";
export type { RubricSlug } from "@/lib/config/content-types";
export {
  MEDICAL_SECTIONS,
  getSection,
  rubricSlugsForSectionQuery,
  type MedicalSectionSlug,
  type MedicalSectionSpec,
} from "@/lib/config/medical-sections";

export interface AccessLevelSpec {
  id: ContentAccessLevel;
  titleKey: string;
  labelKey: string;
  descriptionKey: string;
  includesKeys: string[];
  excludesKeys?: string[];
  contentTypeSlugs: ContentTypeSlug[];
}

export const ACCESS_LEVEL_SPECS: AccessLevelSpec[] = [
  {
    id: "public",
    titleKey: "access.level1Title",
    labelKey: "access.public",
    descriptionKey: "access.publicDesc",
    includesKeys: [
      "access.includes.public1",
      "access.includes.public2",
      "access.includes.public3",
      "access.includes.public4",
      "access.includes.public5",
    ],
    excludesKeys: [
      "access.excludes.public1",
      "access.excludes.public2",
      "access.excludes.public3",
    ],
    contentTypeSlugs: ["ai-lay-summary", "ai-patient-education"],
  },
  {
    id: "student",
    titleKey: "access.level2Title",
    labelKey: "access.student",
    descriptionKey: "access.studentDesc",
    includesKeys: [
      "access.includes.student1",
      "access.includes.student2",
      "access.includes.student3",
      "access.includes.student4",
      "access.includes.student5",
      "access.includes.student6",
      "access.includes.student7",
    ],
    contentTypeSlugs: [
      "ai-textbook-summary",
      "ai-case-study",
      "ai-quiz",
      "ai-mini-quiz",
      "ai-checklist",
      "ai-step-by-step",
      "ai-lay-summary",
      "ai-patient-education",
    ],
  },
  {
    id: "physician",
    titleKey: "access.level3Title",
    labelKey: "access.physician",
    descriptionKey: "access.physicianDesc",
    includesKeys: [
      "access.includes.physician1",
      "access.includes.physician2",
      "access.includes.physician3",
      "access.includes.physician4",
      "access.includes.physician5",
      "access.includes.physician6",
      "access.includes.physician7",
      "access.includes.physician8",
    ],
    contentTypeSlugs: CONTENT_TYPE_SPECS.map((c) => c.slug),
  },
];

export const VERIFICATION_STEPS = [
  { titleKey: "verification.step1Title", bodyKey: "verification.step1Body" },
  { titleKey: "verification.step2Title", bodyKey: "verification.step2Body" },
  { titleKey: "verification.step3Title", bodyKey: "verification.step3Body" },
  { titleKey: "verification.step4Title", bodyKey: "verification.step4Body" },
] as const;

export const PROFESSION_KEYS = [
  "general_public",
  "medical_student",
  "resident",
  "physician",
  "specialist",
  "pharmacist",
  "nurse",
  "researcher",
  "industry",
] as const;

export const VERIFICATION_STATUS_KEYS: Record<string, string> = {
  pending: "verification.status.pending",
  ai_review: "verification.status.aiReview",
  approved: "verification.status.approved",
  rejected: "verification.status.rejected",
};
