-- MediFlow wellness tracker + ecosystem donation logging
-- Extends existing MedScopeGlobal Supabase schema

-- ---------------------------------------------------------------------------
-- MediFlow: personal wellness data (GDPR — user-owned, RLS)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.mediflow_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mediflow_notes_user ON public.mediflow_notes (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.mediflow_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  severity SMALLINT NOT NULL DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mediflow_symptoms_user ON public.mediflow_symptoms (user_id, logged_at DESC);

CREATE TABLE IF NOT EXISTS public.mediflow_supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL DEFAULT '',
  taken_today BOOLEAN NOT NULL DEFAULT false,
  protocol_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mediflow_supplements_user ON public.mediflow_supplements (user_id);

CREATE TABLE IF NOT EXISTS public.mediflow_saved_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  article_title TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_slug)
);

CREATE INDEX IF NOT EXISTS idx_mediflow_saved_user ON public.mediflow_saved_articles (user_id, saved_at DESC);

-- ---------------------------------------------------------------------------
-- RLS — users see/write only their rows; admins read all
-- ---------------------------------------------------------------------------

ALTER TABLE public.mediflow_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediflow_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediflow_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediflow_saved_articles ENABLE ROW LEVEL SECURITY;

-- Notes
DROP POLICY IF EXISTS mediflow_notes_select ON public.mediflow_notes;
CREATE POLICY mediflow_notes_select ON public.mediflow_notes
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS mediflow_notes_insert ON public.mediflow_notes;
CREATE POLICY mediflow_notes_insert ON public.mediflow_notes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS mediflow_notes_update ON public.mediflow_notes;
CREATE POLICY mediflow_notes_update ON public.mediflow_notes
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS mediflow_notes_delete ON public.mediflow_notes;
CREATE POLICY mediflow_notes_delete ON public.mediflow_notes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Symptoms
DROP POLICY IF EXISTS mediflow_symptoms_select ON public.mediflow_symptoms;
CREATE POLICY mediflow_symptoms_select ON public.mediflow_symptoms
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS mediflow_symptoms_insert ON public.mediflow_symptoms;
CREATE POLICY mediflow_symptoms_insert ON public.mediflow_symptoms
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS mediflow_symptoms_delete ON public.mediflow_symptoms;
CREATE POLICY mediflow_symptoms_delete ON public.mediflow_symptoms
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Supplements
DROP POLICY IF EXISTS mediflow_supplements_select ON public.mediflow_supplements;
CREATE POLICY mediflow_supplements_select ON public.mediflow_supplements
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS mediflow_supplements_insert ON public.mediflow_supplements;
CREATE POLICY mediflow_supplements_insert ON public.mediflow_supplements
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS mediflow_supplements_update ON public.mediflow_supplements;
CREATE POLICY mediflow_supplements_update ON public.mediflow_supplements
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS mediflow_supplements_delete ON public.mediflow_supplements;
CREATE POLICY mediflow_supplements_delete ON public.mediflow_supplements
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Saved articles
DROP POLICY IF EXISTS mediflow_saved_select ON public.mediflow_saved_articles;
CREATE POLICY mediflow_saved_select ON public.mediflow_saved_articles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS mediflow_saved_insert ON public.mediflow_saved_articles;
CREATE POLICY mediflow_saved_insert ON public.mediflow_saved_articles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS mediflow_saved_delete ON public.mediflow_saved_articles;
CREATE POLICY mediflow_saved_delete ON public.mediflow_saved_articles
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Donations — reuse v27_orders with kind='donation' (no schema change needed)
-- Add index for donation lookups
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_v27_orders_kind ON public.v27_orders (kind, created_at DESC);

COMMENT ON TABLE public.mediflow_notes IS 'MediFlow wellness notes — user-owned, not medical records';
COMMENT ON TABLE public.mediflow_symptoms IS 'MediFlow symptom log — tracking only, not diagnosis';
COMMENT ON TABLE public.mediflow_supplements IS 'MediFlow supplement tracker with optional VIP protocol link';
COMMENT ON TABLE public.mediflow_saved_articles IS 'MediFlow saved magazine articles by slug';
