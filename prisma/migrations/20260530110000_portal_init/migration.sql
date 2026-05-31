-- CreateEnum
CREATE TYPE "PortalRole" AS ENUM ('READER', 'EXPERT', 'ADMIN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "PortalUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "PortalRole" NOT NULL DEFAULT 'READER',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "institution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "clinicalSignificance" TEXT NOT NULL,
    "practiceRecommendations" TEXT NOT NULL,
    "citations" JSONB NOT NULL,
    "tags" TEXT[],
    "icdCodes" TEXT[],
    "specialization" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "validatedById" TEXT,
    "validatedAt" TIMESTAMP(3),
    "readingTime" INTEGER NOT NULL DEFAULT 5,
    "ratingSum" INTEGER NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleRating" (
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleRating_pkey" PRIMARY KEY ("userId","articleId")
);

-- CreateTable
CREATE TABLE "SavedArticle" (
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedArticle_pkey" PRIMARY KEY ("userId","articleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_email_key" ON "PortalUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PortalArticle_slug_key" ON "PortalArticle"("slug");

-- CreateIndex
CREATE INDEX "PortalArticle_status_idx" ON "PortalArticle"("status");

-- CreateIndex
CREATE INDEX "PortalArticle_specialization_idx" ON "PortalArticle"("specialization");

-- CreateIndex
CREATE INDEX "PortalArticle_publishedAt_idx" ON "PortalArticle"("publishedAt");

-- CreateIndex
CREATE INDEX "PortalArticle_authorId_idx" ON "PortalArticle"("authorId");

-- AddForeignKey
ALTER TABLE "PortalArticle" ADD CONSTRAINT "PortalArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "PortalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleRating" ADD CONSTRAINT "ArticleRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleRating" ADD CONSTRAINT "ArticleRating_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "PortalArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedArticle" ADD CONSTRAINT "SavedArticle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedArticle" ADD CONSTRAINT "SavedArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "PortalArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
