DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('DOCTOR', 'STUDENT', 'SCIENTIST', 'PARTNER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EventFormat" AS ENUM ('ONLINE', 'HYBRID', 'IN_PERSON');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Article" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "region" TEXT,
  "specialization" TEXT,
  "publishedAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "format" "EventFormat" NOT NULL,
  "specialization" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Prague',
  "organizer" TEXT NOT NULL,
  "venue" TEXT,
  "registrationUrl" TEXT,
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "role" "UserRole" NOT NULL,
  "preferences" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ContactSubmission" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "organization" TEXT,
  "role" "UserRole",
  "topic" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "targetEmail" TEXT NOT NULL,
  "leadSource" TEXT,
  "leadQuality" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "EventSubmission" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "format" "EventFormat" NOT NULL,
  "specialization" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "organizer" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "role" "UserRole",
  "segment" TEXT,
  "source" TEXT,
  "value" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Article_publishedAt_idx" ON "Article"("publishedAt");
CREATE INDEX IF NOT EXISTS "Article_specialization_idx" ON "Article"("specialization");
CREATE INDEX IF NOT EXISTS "Event_startsAt_idx" ON "Event"("startsAt");
CREATE INDEX IF NOT EXISTS "Event_region_idx" ON "Event"("region");
CREATE INDEX IF NOT EXISTS "Event_format_idx" ON "Event"("format");
CREATE INDEX IF NOT EXISTS "Event_specialization_idx" ON "Event"("specialization");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_name_idx" ON "AnalyticsEvent"("name");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_role_idx" ON "AnalyticsEvent"("role");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
