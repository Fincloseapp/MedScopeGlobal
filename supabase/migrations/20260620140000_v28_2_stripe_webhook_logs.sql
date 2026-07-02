-- MedScope v28.2 — Stripe webhook event logs

CREATE TABLE IF NOT EXISTS public.stripe_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_id TEXT,
  event_type TEXT NOT NULL,
  livemode BOOLEAN NOT NULL DEFAULT false,
  api_version TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'ignored', 'failed')),
  object_id TEXT,
  customer_id TEXT,
  error TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_received_at ON public.stripe_webhook_logs(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_event_type ON public.stripe_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_event_id ON public.stripe_webhook_logs(event_id);

ALTER TABLE public.stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'stripe_webhook_logs' AND policyname = 'stripe_webhook_logs_service_role'
  ) THEN
    CREATE POLICY stripe_webhook_logs_service_role ON public.stripe_webhook_logs
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- email_logs policy idempotent fix
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'email_logs' AND policyname = 'email_logs_service_role'
  ) THEN
    CREATE POLICY email_logs_service_role ON public.email_logs
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
