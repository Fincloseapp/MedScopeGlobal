-- MedScope v40 — AI video jobs + audit reports

CREATE TABLE IF NOT EXISTS public.v40_video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'ready', 'failed')),
  video_asset_id UUID REFERENCES public.video_assets(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v40_video_jobs_status ON public.v40_video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_v40_video_jobs_created ON public.v40_video_jobs(created_at DESC);

DROP TRIGGER IF EXISTS trg_v40_video_jobs_updated_at ON public.v40_video_jobs;
CREATE TRIGGER trg_v40_video_jobs_updated_at
  BEFORE UPDATE ON public.v40_video_jobs
  FOR EACH ROW EXECUTE FUNCTION public.academy_set_updated_at();

ALTER TABLE public.v40_video_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS v40_video_jobs_admin ON public.v40_video_jobs;
CREATE POLICY v40_video_jobs_admin ON public.v40_video_jobs
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.v40_audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'healthy',
  report JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v40_audit_reports_created ON public.v40_audit_reports(created_at DESC);

ALTER TABLE public.v40_audit_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS v40_audit_reports_admin ON public.v40_audit_reports;
CREATE POLICY v40_audit_reports_admin ON public.v40_audit_reports
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.v40_video_jobs IS 'MedScope v40 — AI video generation job queue';
COMMENT ON TABLE public.v40_audit_reports IS 'MedScope v40 — weekly audit report snapshots';
