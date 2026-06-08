export type V20StudyType =
  | "rct"
  | "meta-analysis"
  | "cohort"
  | "pilot"
  | "review"
  | "observational";

export type V20StudySource = {
  name: string;
  url: string;
  agency: string;
};

export type V20StudyDisplay = {
  id: string;
  slug: string;
  titleCs: string;
  subtitleCs: string;
  summaryCs: string;
  methodologyCs: string;
  resultsCs: string;
  conclusionCs: string;
  clinicalImpactCs: string;
  keyPointsCs: string[];
  source: V20StudySource;
  doi: string | null;
  pubmedId: string | null;
  publishedDate: string;
  publishedDateLabel: string;
  studyType: V20StudyType;
  studyTypeLabel: string;
  specialtyCs: string;
  relevance: "vysoká" | "střední" | "kontextová";
  imageUrl: string;
  locale: "cs";
  uiVersion: "v20.2";
};
