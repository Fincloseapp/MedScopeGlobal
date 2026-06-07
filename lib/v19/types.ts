/** MedScope Content Engine v19 — article types */

export type V19Specialty =
  | "rheumatology"
  | "internal-medicine"
  | "cardiology"
  | "endocrinology"
  | "neurology"
  | "oncology"
  | "infectious-disease"
  | "pulmonology"
  | "gastroenterology"
  | "dermatology"
  | "emergency-medicine";

export type V19SourceTier = "cz" | "eu" | "world";

export type V19ArticlePayload = {
  title: string;
  date: string;
  specialty: V19Specialty;
  specialtyLabel: string;
  summary: string;
  keyPoints: string[];
  clinicalImpact: string;
  sourceUrl: string;
  sourceName: string;
  sourceTier: V19SourceTier;
  topic: string;
  locale: string;
  angle?: string;
};

export type V19GeneratedArticle = V19ArticlePayload & {
  id?: string;
  slug?: string;
  contentHtml: string;
  hashDedup: string;
  model?: string;
  cached?: boolean;
};

export type V19JobStatus = "pending" | "processing" | "completed" | "failed";

export type V19GenerateResult = {
  articles: V19GeneratedArticle[];
  locale: string;
  generated: number;
  skippedDuplicates: number;
  jobId?: string;
  cached?: boolean;
};
