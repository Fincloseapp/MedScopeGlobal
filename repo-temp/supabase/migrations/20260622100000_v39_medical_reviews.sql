-- MedScope v39 — AI medical review engine

CREATE TABLE IF NOT EXISTS public.medical_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('article', 'video', 'course', 'lesson')),
  entity_id UUID NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical')),
  review JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'corrected', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_reviews_entity ON public.medical_reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_medical_reviews_severity ON public.medical_reviews(severity);
CREATE UNIQUE INDEX IF NOT EXISTS idx_medical_reviews_unique_entity
  ON public.medical_reviews(entity_type, entity_id);

DROP TRIGGER IF EXISTS trg_medical_reviews_updated_at ON public.medical_reviews;
CREATE TRIGGER trg_medical_reviews_updated_at
  BEFORE UPDATE ON public.medical_reviews
  FOR EACH ROW EXECUTE FUNCTION public.academy_set_updated_at();

ALTER TABLE public.medical_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medical_reviews_admin ON public.medical_reviews;
CREATE POLICY medical_reviews_admin ON public.medical_reviews
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.medical_reviews IS 'MedScope v39 — AI medical review with guideline compliance';
