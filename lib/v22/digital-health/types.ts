import type { DhSource } from "@/lib/v22/digital-health/sources";

export type V22DigitalHealthArticle = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  summaryCs: string;
  whatIsCs: string;
  trendsCs: string;
  risksCs: string;
  legislationCs: string;
  clinicalImpactCs: string;
  examplesCs: string;
  keyPointsCs: string[];
  sources: Pick<DhSource, "name" | "url" | "tier">[];
  publishedDate: string;
  publishedDateLabel: string;
  imageUrl: string;
};
