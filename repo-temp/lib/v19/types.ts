/** MedScope Content Engine v19.9 — article types */

export type NzipEducationalLink = {
  label: string;
  url: string;
  type: string;
};

export type NzipCategory =
  | "nemoci"
  | "prevence"
  | "diagnostika"
  | "lecba"
  | "zivotni-styl"
  | "vyziva"
  | "zdravotnicke-profese"
  | "zdravotnicke-systemy"
  | "pacientska-edukace"
  | "odborne-clanky"
  | "publikace"
  | "doporuceni"
  | "zdravotnicke-pojmy"
  | "slovnik-pojmu"
  | "tematicke-okruhy"
  | "vedecke-aktuality";

export type V19SourceTopic = {
  id: string;
  specialty: V19Specialty;
  tier: V19SourceTier;
  sourceName: string;
  sourceUrl: string;
  topic: string;
  briefingHint: string;
  keywords?: string[];
  scientificTerms?: string[];
  /** v19.7 NZIP tematická kategorie */
  nzipCategory?: NzipCategory;
  isNzip?: boolean;
  /** v19.7 reference publikace (science tier dedup) */
  publicationRef?: string;
};

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

/** Geographic / publication tier — CZ first, then EU, world, science */
export type V19SourceTier = "cz" | "eu" | "world" | "science";

export type V19ContentMode = "doctor" | "patient" | "scientist";

export type V19ArticleType =
  | "brief"
  | "education"
  | "science-note"
  | "prevention"
  | "clinical-context";

export type V19Relevance = "high" | "medium" | "contextual";

export type V19ModeLayer = {
  summary: string;
  keyPoints: string[];
  clinicalImpact?: string;
  scientificContext?: string;
  patientEducation?: string;
};

export type V19ModeLayers = Partial<Record<V19ContentMode, V19ModeLayer>>;

export type V19ArticlePayload = {
  title: string;
  date: string;
  specialty: V19Specialty;
  specialtyLabel: string;
  summary: string;
  keyPoints: string[];
  clinicalImpact: string;
  /** v19.6 — vědecký kontext */
  scientificContext: string;
  /** v19.6 — edukační část pro laiky */
  patientEducation: string;
  /** v19.7 — NZIP kontext (pokud relevantní) */
  nzipContext?: string;
  nzipCategory?: NzipCategory;
  /** v19.8 — NZIP registry & tagy */
  nzipRegistryId?: string;
  nzipTopicTags?: string[];
  nzipCategoryTags?: string[];
  /** v19.9 — NZIP glossary & edukační odkazy */
  nzipGlossaryTerms?: string[];
  nzipEducationalLinks?: NzipEducationalLink[];
  nzipRegistryRefs?: string[];
  sourceUrl: string;
  sourceName: string;
  sourceTier: V19SourceTier;
  topic: string;
  locale: string;
  angle?: string;
  /** v19.6 metadata */
  keywords: string[];
  articleType: V19ArticleType;
  relevance: V19Relevance;
  modeLayers?: V19ModeLayers;
  engineVersion?: string;
};

export type V19GeneratedArticle = V19ArticlePayload & {
  id?: string;
  slug?: string;
  contentHtml: string;
  hashDedup: string;
  model?: string;
  cached?: boolean;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
  };
};

export type V19JobStatus = "pending" | "processing" | "completed" | "failed";

export type V19GenerateResult = {
  articles: V19GeneratedArticle[];
  locale: string;
  mode: V19ContentMode;
  generated: number;
  skippedDuplicates: number;
  jobId?: string;
  cached?: boolean;
  engineVersion: string;
};
