export type V24SectionId =
  | "medicine"
  | "drugs"
  | "legislation"
  | "digital-health"
  | "news"
  | "study"
  | "pre-med"
  | "specialties"
  | "articles"
  | "quizzes";

export type V24SpecialtyId =
  | "revmatologie"
  | "neurologie"
  | "endokrinologie"
  | "kardiologie"
  | "interna"
  | "vseobecne-lekarstvi"
  | "dermatologie"
  | "alergologie"
  | "zobrazovaci-metody";

export type V24StudyYear = 1 | 2 | 3 | 4 | 5 | 6;

export type V24ContentType =
  | "article"
  | "differential-diagnosis"
  | "treatment-plan"
  | "case-study"
  | "quiz"
  | "study-guide";

export type V24QuizType =
  | "multiple-choice"
  | "clinical-scenario"
  | "anatomy"
  | "pharmacology"
  | "image-quiz";

export type V24ContentDraft = {
  section: V24SectionId;
  specialty?: V24SpecialtyId;
  studyYear?: V24StudyYear;
  contentType: V24ContentType;
  title: string;
  summary: string;
  bodyHtml: string;
  keywords: string[];
  differentialDiagnosis?: string[];
  treatmentPlan?: string[];
  casePresentation?: string;
  sourceUrl?: string;
  sourceName?: string;
  topicHash: string;
  locale: string;
};

export type V24QaReport = {
  passed: boolean;
  score: number;
  issues: string[];
  checks: Record<string, boolean>;
};

export type V24SeoMeta = {
  title: string;
  description: string;
  keywords: string[];
  schema: Record<string, unknown>;
  internalLinks: string[];
  externalLinks: string[];
};

export type V24LegalReport = {
  passed: boolean;
  disclaimer: string;
  issues: string[];
};

export type V24ImageArtifact = {
  path: string;
  alt: string;
  safe: boolean;
};

export type V24PipelineResult = {
  ok: boolean;
  section: V24SectionId;
  topicHash: string;
  title: string;
  regenerated: number;
  qa: V24QaReport;
  seo: V24SeoMeta;
  legal: V24LegalReport;
  image?: V24ImageArtifact;
  published: boolean;
  artifactPath?: string;
  errors: string[];
};
