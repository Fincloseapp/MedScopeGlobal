-- Fix prijimacky lesson slugs: ASCII-only URLs (Next.js/Vercel routing breaks on diacritics)
UPDATE public.lessons l
SET slug = 'bunkove-deleni', updated_at = now()
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'biologie-prijimacky-bunka-genetika'
  AND l.slug = 'bunkove-delení';

UPDATE public.lessons l
SET slug = 'homologicke-rady', updated_at = now()
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'chemie-prijimacky-organicka'
  AND l.slug = 'homologické-rady';

UPDATE public.lessons l
SET slug = 'orientace-v-tele', updated_at = now()
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'anatomie-zaklady-uchazece'
  AND l.slug = 'orientace-v-těle';

UPDATE public.lessons l
SET slug = 'latinske-koreny', updated_at = now()
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'latinska-terminologie-medicina'
  AND l.slug = 'latinske-kořeny';
