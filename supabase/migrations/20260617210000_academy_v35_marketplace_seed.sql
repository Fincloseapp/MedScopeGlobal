-- MedScope Academy v35 Phase 9b — marketplace E2E seed (idempotent)
-- Listed premium course for Stripe checkout smoke / manual E2E testing.

INSERT INTO public.marketplace_courses (
  id,
  course_id,
  price_czk,
  status,
  listing_metadata
)
SELECT
  'e2e00001-0000-4000-8000-000000000001'::uuid,
  c.id,
  299,
  'listed',
  '{"badge":"E2E test","highlight":"Premium demo listing for checkout testing"}'::jsonb
FROM public.courses c
WHERE c.slug = 'uvod-do-anatomie'
  AND NOT EXISTS (
    SELECT 1 FROM public.marketplace_courses mc
    WHERE mc.id = 'e2e00001-0000-4000-8000-000000000001'::uuid
       OR (mc.course_id = c.id AND mc.status = 'listed' AND mc.price_czk > 0)
  );

COMMENT ON TABLE public.marketplace_courses IS 'MedScope Academy v35 — includes E2E seed listing e2e00001';
