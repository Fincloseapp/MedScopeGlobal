-- MedScope v34 — video watch events + metadata fields on video_assets

CREATE TABLE IF NOT EXISTS public.video_watch_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_asset_id UUID NOT NULL REFERENCES public.video_assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL DEFAULT '',
  event TEXT NOT NULL DEFAULT 'heartbeat'
    CHECK (event IN ('play', 'pause', 'seek', 'ended', 'heartbeat', 'error')),
  position_sec NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_watch_events_asset ON public.video_watch_events(video_asset_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_events_user ON public.video_watch_events(user_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_events_created ON public.video_watch_events(created_at DESC);

ALTER TABLE public.video_watch_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS video_watch_events_insert ON public.video_watch_events;
CREATE POLICY video_watch_events_insert ON public.video_watch_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS video_watch_events_admin_read ON public.video_watch_events;
CREATE POLICY video_watch_events_admin_read ON public.video_watch_events
  FOR SELECT TO authenticated
  USING (public.is_admin());

COMMENT ON TABLE public.video_watch_events IS 'MedScope v34 — video engagement telemetry';
