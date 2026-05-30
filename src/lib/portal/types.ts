export type PortalRole = "reader" | "expert" | "admin";

export type VerificationStatus = "not_required" | "pending" | "approved" | "rejected";

export type ArticleStatus = "draft" | "published" | "archived";

export interface Citation {
  id: string;
  title: string;
  authors?: string;
  sourceName: string;
  sourceUrl?: string;
  doi?: string;
  year?: number;
}

export interface ArticleSection {
  id: string;
  heading: string;
  content: string;
  highlights?: string[];
}

export interface PortalUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: PortalRole;
  verificationStatus: VerificationStatus;
  institution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  sections: ArticleSection[];
  clinicalSignificance: string;
  practiceRecommendations: string;
  citations: Citation[];
  tags: string[];
  icdCodes: string[];
  specialization: string;
  status: ArticleStatus;
  authorId: string;
  authorName: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readingTime: number;
  ratingSum: number;
  ratingCount: number;
  validatedById?: string;
  validatedAt?: string;
}

export interface SavedArticle {
  userId: string;
  articleId: string;
  savedAt: string;
}

export interface ArticleRating {
  userId: string;
  articleId: string;
  score: number;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: PortalRole;
  verificationStatus: VerificationStatus;
  institution?: string;
}

export interface ArticleFilters {
  query?: string;
  specialization?: string;
  status?: ArticleStatus;
  tag?: string;
  authorId?: string;
  sort?: "newest" | "oldest" | "relevance" | "rating";
  from?: string;
  to?: string;
}

export interface GenerateArticleInput {
  topic: string;
  keywords?: string[];
  specialization: string;
}
