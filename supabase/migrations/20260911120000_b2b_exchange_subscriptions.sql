-- MedScope B2B Exchange — subscription-only revenue (no deal commission).
-- Additive. Apply after 20260910120000_b2b_exchange.sql.

ALTER TABLE public.exchange_organizations
  ADD COLUMN IF NOT EXISTS microsite_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS api_import_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ad_credits integer NOT NULL DEFAULT 0;

ALTER TABLE public.exchange_subscriptions
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS ad_credits integer NOT NULL DEFAULT 0;

ALTER TABLE public.exchange_contacts
  ADD COLUMN IF NOT EXISTS premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz;

CREATE TABLE IF NOT EXISTS public.exchange_inquiry_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.exchange_contacts(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.exchange_organizations(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exchange_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  organization_id uuid,
  user_id uuid,
  plan text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exchange_audit_created_idx
  ON public.exchange_audit_events (created_at DESC);

ALTER TABLE public.exchange_inquiry_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS exchange_admin_all_replies ON public.exchange_inquiry_replies;
CREATE POLICY exchange_admin_all_replies ON public.exchange_inquiry_replies
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMENT ON TABLE public.exchange_contacts IS
  'Buyer inquiries. Contact PII is returned only to Pro/Enterprise advertisers; Basic sees a redacted teaser.';
COMMENT ON TABLE public.exchange_subscriptions IS
  'Exchange revenue is subscription-only. No deal commission or success fee.';
