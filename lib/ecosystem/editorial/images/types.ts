/** Editorial image pipeline — shared types */

import type { EditorialTopic } from "../desks";

export type ImageSourceType = "curated" | "unsplash" | "storage" | "placeholder";

export type ArticleImageCandidate = {
  url: string;
  sourceType: ImageSourceType;
  topic: EditorialTopic;
  score: number;
  altTextCs: string;
  altTextEn: string;
  keywords: string[];
};

export type ImageComplianceResult = {
  passed: boolean;
  issues: string[];
  suggestions: string[];
};

export type ArticleImageSuggestionRecord = {
  articleId: string;
  articleSlug: string;
  suggestedUrl: string;
  altTextCs: string;
  altTextEn: string;
  topic: EditorialTopic;
  sourceType: ImageSourceType;
  compliancePassed: boolean;
  complianceNotes: string[];
  appliedAt?: string | null;
};

export type ArticleForImageMatch = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image_url?: string | null;
  locale?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ImagePipelineBatchResult = {
  processed: number;
  suggested: number;
  applied: number;
  skipped: number;
  failures: string[];
};
