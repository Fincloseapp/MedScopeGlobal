import type { ArticleStatus, PortalRole, VerificationStatus, PortalArticle, PortalUser, ArticleSection, Citation } from "./types";

type DbPortalRole = "READER" | "EXPERT" | "ADMIN";
type DbVerificationStatus = "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
type DbArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const roleToDb: Record<PortalRole, DbPortalRole> = { reader: "READER", expert: "EXPERT", admin: "ADMIN" };
const roleFromDb: Record<DbPortalRole, PortalRole> = { READER: "reader", EXPERT: "expert", ADMIN: "admin" };

const verificationToDb: Record<VerificationStatus, DbVerificationStatus> = {
  not_required: "NOT_REQUIRED",
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED"
};
const verificationFromDb: Record<DbVerificationStatus, VerificationStatus> = {
  NOT_REQUIRED: "not_required",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

const statusToDb: Record<ArticleStatus, DbArticleStatus> = { draft: "DRAFT", published: "PUBLISHED", archived: "ARCHIVED" };
const statusFromDb: Record<DbArticleStatus, ArticleStatus> = { DRAFT: "draft", PUBLISHED: "published", ARCHIVED: "archived" };

export function mapUserFromDb(user: {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: DbPortalRole;
  verificationStatus: DbVerificationStatus;
  institution: string | null;
  createdAt: Date;
  updatedAt: Date;
}): PortalUser {
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    role: roleFromDb[user.role],
    verificationStatus: verificationFromDb[user.verificationStatus],
    institution: user.institution ?? undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export function mapUserToDb(user: PortalUser) {
  return {
    id: user.id,
    email: user.email.toLowerCase(),
    passwordHash: user.passwordHash,
    name: user.name,
    role: roleToDb[user.role],
    verificationStatus: verificationToDb[user.verificationStatus],
    institution: user.institution ?? null,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  };
}

export function mapArticleFromDb(article: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  sections: unknown;
  clinicalSignificance: string;
  practiceRecommendations: string;
  citations: unknown;
  tags: string[];
  icdCodes: string[];
  specialization: string;
  status: DbArticleStatus;
  authorId: string;
  authorName: string;
  publishedAt: Date | null;
  validatedById: string | null;
  validatedAt: Date | null;
  readingTime: number;
  ratingSum: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}): PortalArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    sections: article.sections as ArticleSection[],
    clinicalSignificance: article.clinicalSignificance,
    practiceRecommendations: article.practiceRecommendations,
    citations: article.citations as Citation[],
    tags: article.tags,
    icdCodes: article.icdCodes,
    specialization: article.specialization,
    status: statusFromDb[article.status],
    authorId: article.authorId,
    authorName: article.authorName,
    publishedAt: article.publishedAt?.toISOString(),
    validatedById: article.validatedById ?? undefined,
    validatedAt: article.validatedAt?.toISOString(),
    readingTime: article.readingTime,
    ratingSum: article.ratingSum,
    ratingCount: article.ratingCount,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString()
  };
}

export function mapArticleToDb(article: PortalArticle) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    sections: article.sections,
    clinicalSignificance: article.clinicalSignificance,
    practiceRecommendations: article.practiceRecommendations,
    citations: article.citations,
    tags: article.tags,
    icdCodes: article.icdCodes,
    specialization: article.specialization,
    status: statusToDb[article.status],
    authorId: article.authorId,
    authorName: article.authorName,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
    validatedById: article.validatedById ?? null,
    validatedAt: article.validatedAt ? new Date(article.validatedAt) : null,
    readingTime: article.readingTime,
    ratingSum: article.ratingSum,
    ratingCount: article.ratingCount,
    createdAt: new Date(article.createdAt),
    updatedAt: new Date(article.updatedAt)
  };
}
