-- MedScope B2B Exchange — contact-only healthcare marketplace
-- Apply after merge via Supabase SQL Editor or `pnpm db:migrate`.
-- Source of truth for production. Prisma schema mirrors this contract.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE public.exchange_availability_region AS ENUM ('EU', 'USA', 'Asia', 'Global');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.exchange_listing_kind AS ENUM ('product', 'service', 'demand');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.exchange_listing_status AS ENUM (
    'draft', 'pending_review', 'approved', 'rejected', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.exchange_org_kind AS ENUM (
    'company', 'clinic', 'hospital', 'laboratory', 'university', 'research', 'telemedicine'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.exchange_member_role AS ENUM (
    'owner', 'admin', 'company_admin', 'institution_admin', 'standard_user'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.exchange_plan AS ENUM ('basic', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.exchange_ad_format AS ENUM ('banner', 'sponsored_article', 'newsletter');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.exchange_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  legal_name text NOT NULL,
  trade_name text NOT NULL,
  kind public.exchange_org_kind NOT NULL,
  registration_id text NOT NULL,
  vat_id text,
  country_code text NOT NULL,
  website text,
  contact_email text NOT NULL,
  contact_phone text,
  contact_person text NOT NULL,
  availability_regions public.exchange_availability_region[] NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  plan public.exchange_plan NOT NULL DEFAULT 'basic',
  source_locale text NOT NULL DEFAULT 'en',
  description text NOT NULL,
  logo_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT exchange_org_regions_required CHECK (cardinality(availability_regions) >= 1)
);

CREATE TABLE IF NOT EXISTS public.exchange_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.exchange_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.exchange_member_role NOT NULL DEFAULT 'standard_user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.exchange_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind public.exchange_listing_kind NOT NULL,
  status public.exchange_listing_status NOT NULL DEFAULT 'pending_review',
  organization_id uuid NOT NULL REFERENCES public.exchange_organizations(id) ON DELETE CASCADE,
  category text NOT NULL,
  source_locale text NOT NULL DEFAULT 'en',
  title text NOT NULL,
  summary text NOT NULL,
  description text NOT NULL,
  availability_region public.exchange_availability_region NOT NULL,
  availability_regions public.exchange_availability_region[] NOT NULL,
  certifications text[] NOT NULL DEFAULT '{}',
  certification_notes text,
  certification_not_applicable boolean NOT NULL DEFAULT false,
  price_hint text,
  currency text,
  image_url text,
  documentation_url text,
  featured boolean NOT NULL DEFAULT false,
  featured_until timestamptz,
  review_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT exchange_listing_regions_required CHECK (cardinality(availability_regions) >= 1),
  CONSTRAINT exchange_listing_primary_in_set CHECK (availability_region = ANY (availability_regions))
);

CREATE INDEX IF NOT EXISTS exchange_listings_status_idx
  ON public.exchange_listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS exchange_listings_kind_idx
  ON public.exchange_listings (kind, status);
CREATE INDEX IF NOT EXISTS exchange_listings_region_idx
  ON public.exchange_listings USING GIN (availability_regions);
CREATE INDEX IF NOT EXISTS exchange_listings_category_idx
  ON public.exchange_listings (category);

CREATE TABLE IF NOT EXISTS public.exchange_listing_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.exchange_listings(id) ON DELETE CASCADE,
  locale text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  description text NOT NULL,
  provider text,
  manual_override boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, locale)
);

CREATE TABLE IF NOT EXISTS public.exchange_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.exchange_listings(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('image', 'pdf')),
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exchange_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.exchange_listings(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.exchange_organizations(id) ON DELETE SET NULL,
  buyer_organization text NOT NULL,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  message text NOT NULL,
  locale text,
  region public.exchange_availability_region,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exchange_contacts_listing_idx
  ON public.exchange_contacts (listing_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.exchange_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  organization_id uuid REFERENCES public.exchange_organizations(id) ON DELETE SET NULL,
  format public.exchange_ad_format NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  target_url text NOT NULL,
  image_url text,
  availability_regions public.exchange_availability_region[] NOT NULL,
  active boolean NOT NULL DEFAULT false,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  starts_at date,
  ends_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exchange_ads_regions_required CHECK (cardinality(availability_regions) >= 1)
);

CREATE TABLE IF NOT EXISTS public.exchange_ad_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.exchange_ads(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('impression', 'click')),
  region public.exchange_availability_region,
  locale text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exchange_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.exchange_organizations(id) ON DELETE CASCADE,
  plan public.exchange_plan NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled')),
  success_fee_percent numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exchange_legal_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  organization_id uuid REFERENCES public.exchange_organizations(id) ON DELETE CASCADE,
  document text NOT NULL,
  locale text NOT NULL,
  version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exchange_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('article', 'legislation', 'clinical_analysis')),
  title text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  subscription_required boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exchange_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_listing_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_ad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_legal_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS exchange_orgs_public_read ON public.exchange_organizations;
CREATE POLICY exchange_orgs_public_read ON public.exchange_organizations
  FOR SELECT USING (verified = true);

DROP POLICY IF EXISTS exchange_listings_public_read ON public.exchange_listings;
CREATE POLICY exchange_listings_public_read ON public.exchange_listings
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS exchange_translations_public_read ON public.exchange_listing_translations;
CREATE POLICY exchange_translations_public_read ON public.exchange_listing_translations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exchange_listings l
      WHERE l.id = listing_id AND l.status = 'approved'
    )
  );

DROP POLICY IF EXISTS exchange_ads_public_read ON public.exchange_ads;
CREATE POLICY exchange_ads_public_read ON public.exchange_ads
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS exchange_content_public_read ON public.exchange_content;
CREATE POLICY exchange_content_public_read ON public.exchange_content
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS exchange_admin_all_orgs ON public.exchange_organizations;
CREATE POLICY exchange_admin_all_orgs ON public.exchange_organizations
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS exchange_admin_all_listings ON public.exchange_listings;
CREATE POLICY exchange_admin_all_listings ON public.exchange_listings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS exchange_admin_all_contacts ON public.exchange_contacts;
CREATE POLICY exchange_admin_all_contacts ON public.exchange_contacts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMENT ON TABLE public.exchange_listings IS
  'B2B Exchange listings. Contact-only: no payments, contracts, delivery or invoicing via MedScopeGlobal.';
COMMENT ON COLUMN public.exchange_listings.availability_region IS
  'Required primary regional availability: EU | USA | Asia | Global.';
