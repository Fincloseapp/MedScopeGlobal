-- Fix prijimacky lesson slugs: ASCII-only URLs (Next.js/Vercel routing breaks on diacritics)
-- Idempotent: skip when ASCII slug already exists; remove stale diacritic duplicate.

-- bunkove-delení -> bunkove-deleni
DELETE FROM public.lessons l
USING public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'biologie-prijimacky-bunka-genetika'
  AND l.slug = 'bunkove-delení'
  AND EXISTS (
    SELECT 1 FROM public.lessons l2
    WHERE l2.course_id = l.course_id
      AND l2.slug = 'bunkove-deleni'
      AND l2.id <> l.id
  );

UPDATE public.lessons l
SET slug = 'bunkove-deleni', updated_at = now()
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'biologie-prijimacky-bunka-genetika'
  AND l.slug = 'bunkove-delení'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l2
    WHERE l2.course_id = l.course_id
      AND l2.slug = 'bunkove-deleni'
      AND l2.id <> l.id
  );

-- homologické-rady -> homologicke-rady
DELETE FROM public.lessons l
USING public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'chemie-prijimacky-organicka'
  AND l.slug = 'homologické-rady'
  AND EXISTS (
    SELECT 1 FROM public.lessons l2
    WHERE l2.course_id = l.course_id
      AND l2.slug = 'homologicke-rady'
      AND l2.id <> l.id
  );

UPDATE public.lessons l
SET slug = 'homologicke-rady', updated_at = now()
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'chemie-prijimacky-organicka'
  AND l.slug = 'homologické-rady'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l2
    WHERE l2.course_id = l.course_id
      AND l2.slug = 'homologicke-rady'
      AND l2.id <> l.id
  );

-- orientace-v-těle -> orientace-v-tele
DELETE FROM public.lessons l
USING public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'anatomie-zaklady-uchazece'
  AND l.slug = 'orientace-v-těle'
  AND EXISTS (
    SELECT 1 FROM public.lessons l2
    WHERE l2.course_id = l.course_id
      AND l2.slug = 'orientace-v-tele'
      AND l2.id <> l.id
  );

UPDATE public.lessons l
SET slug = 'orientace-v-tele', updated_at = now()
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'anatomie-zaklady-uchazece'
  AND l.slug = 'orientace-v-těle'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l2
    WHERE l2.course_id = l.course_id
      AND l2.slug = 'orientace-v-tele'
      AND l2.id <> l.id
  );

-- latinske-kořeny -> latinske-koreny
DELETE FROM public.lessons l
USING public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'latinska-terminologie-medicina'
  AND l.slug = 'latinske-kořeny'
  AND EXISTS (
    SELECT 1 FROM public.lessons l2
    WHERE l2.course_id = l.course_id
      AND l2.slug = 'latinske-koreny'
      AND l2.id <> l.id
  );

UPDATE public.lessons l
SET slug = 'latinske-koreny', updated_at = now()
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'latinska-terminologie-medicina'
  AND l.slug = 'latinske-kořeny'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l2
    WHERE l2.course_id = l.course_id
      AND l2.slug = 'latinske-koreny'
      AND l2.id <> l.id
  );
