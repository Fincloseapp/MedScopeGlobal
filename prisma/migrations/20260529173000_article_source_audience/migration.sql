ALTER TABLE "Article"
  ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "audience" TEXT NOT NULL DEFAULT 'laik-student';

CREATE INDEX IF NOT EXISTS "Article_audience_idx" ON "Article"("audience");
