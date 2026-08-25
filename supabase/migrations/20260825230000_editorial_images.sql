-- Autonomous editorial image pipeline — suggestions + compliance tracking

CREATE TABLE IF NOT EXISTS public.article_image_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  suggested_url TEXT NOT NULL,
  alt_text_cs TEXT NOT NULL,
  alt_text_en TEXT NOT NULL,
  topic TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'curated',
  compliance_passed BOOLEAN DEFAULT false,
  compliance_notes JSONB DEFAULT '[]',
  applied_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (article_id, suggested_url)
);

CREATE INDEX IF NOT EXISTS idx_article_image_suggestions_article
  ON public.article_image_suggestions (article_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_article_image_suggestions_pending
  ON public.article_image_suggestions (compliance_passed, applied_at)
  WHERE applied_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_article_image_suggestions_slug
  ON public.article_image_suggestions (article_slug);

-- Extend editorial_queue with optional image task type (scaffold)
ALTER TABLE public.editorial_queue
  ADD COLUMN IF NOT EXISTS task_type TEXT NOT NULL DEFAULT 'article';

CREATE INDEX IF NOT EXISTS idx_editorial_queue_task_type
  ON public.editorial_queue (task_type, status, created_at DESC);

ALTER TABLE public.article_image_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS article_image_suggestions_service ON public.article_image_suggestions;
CREATE POLICY article_image_suggestions_service ON public.article_image_suggestions
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE public.article_image_suggestions IS 'Autonomous editorial image suggestions — curated/Unsplash/placeholder with compliance';
COMMENT ON COLUMN public.editorial_queue.task_type IS 'article | image | syndication — editorial pipeline task kind';
