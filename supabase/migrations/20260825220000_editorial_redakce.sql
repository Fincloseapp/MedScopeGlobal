-- Autonomous editorial ("redakce") + article tringelt (tip) monetization
-- Extends v27_orders with kind='article_tip'; adds syndication tracking

-- ---------------------------------------------------------------------------
-- Article syndication — cross-locale adoption (not blind duplication)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.article_syndications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_article_id UUID NOT NULL,
  source_slug TEXT NOT NULL,
  source_locale TEXT NOT NULL,
  target_article_id UUID,
  target_slug TEXT,
  target_locale TEXT NOT NULL,
  syndication_mode TEXT NOT NULL DEFAULT 'adapted_translation',
  status TEXT NOT NULL DEFAULT 'pending',
  source_author_unit TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  UNIQUE (source_article_id, target_locale)
);

CREATE INDEX IF NOT EXISTS idx_article_syndications_source
  ON public.article_syndications (source_article_id, source_locale);

CREATE INDEX IF NOT EXISTS idx_article_syndications_target
  ON public.article_syndications (target_locale, status);

-- ---------------------------------------------------------------------------
-- Editorial queue — scaffold for autonomous cron pipeline
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.editorial_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desk_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  journalist_persona_id TEXT,
  editor_persona_id TEXT,
  compliance_passed BOOLEAN DEFAULT false,
  article_id UUID,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editorial_queue_status
  ON public.editorial_queue (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_editorial_queue_desk
  ON public.editorial_queue (desk_id, locale);

-- ---------------------------------------------------------------------------
-- Article tips — v27_orders kind='article_tip' (no schema change)
-- Index for tip lookups by article slug in metadata
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_v27_orders_article_tip
  ON public.v27_orders (kind, (metadata->>'article_slug'), created_at DESC)
  WHERE kind = 'article_tip';

-- ---------------------------------------------------------------------------
-- RLS — service role only (editorial pipeline runs server-side)
-- ---------------------------------------------------------------------------

ALTER TABLE public.article_syndications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS article_syndications_service ON public.article_syndications;
CREATE POLICY article_syndications_service ON public.article_syndications
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS editorial_queue_service ON public.editorial_queue;
CREATE POLICY editorial_queue_service ON public.editorial_queue
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE public.article_syndications IS 'Cross-locale article syndication — adapted translations, not duplicates';
COMMENT ON TABLE public.editorial_queue IS 'Autonomous editorial pipeline queue — cron scaffold';
COMMENT ON INDEX public.idx_v27_orders_article_tip IS 'Article tringelt tips by slug — v27_orders kind=article_tip';
