-- MedScope v37 — AI content quality reviews

CREATE TABLE IF NOT EXISTS public.content_quality_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('article', 'video', 'course', 'lesson')),
  entity_id UUID NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  issues JSONB NOT NULL DEFAULT '[]',
  suggestions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'auto_fixed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_quality_entity ON public.content_quality_reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_content_quality_status ON public.content_quality_reviews(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_quality_unique_entity
  ON public.content_quality_reviews(entity_type, entity_id);

DROP TRIGGER IF EXISTS trg_content_quality_reviews_updated_at ON public.content_quality_reviews;
CREATE TRIGGER trg_content_quality_reviews_updated_at
  BEFORE UPDATE ON public.content_quality_reviews
  FOR EACH ROW EXECUTE FUNCTION public.academy_set_updated_at();

ALTER TABLE public.content_quality_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS content_quality_admin ON public.content_quality_reviews;
CREATE POLICY content_quality_admin ON public.content_quality_reviews
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.content_quality_reviews IS 'MedScope v37 — AI content quality engine reviews';
