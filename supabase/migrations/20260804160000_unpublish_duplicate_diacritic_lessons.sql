-- Unpublish diacritic duplicate lessons when ASCII twin exists (URL/routing safety).
UPDATE public.lessons d
SET status = 'draft', updated_at = now()
FROM public.lessons a
WHERE d.course_id = a.course_id
  AND d.status = 'published'
  AND a.status = 'published'
  AND d.id <> a.id
  AND (
    (d.slug = 'orientace-v-těle' AND a.slug = 'orientace-v-tele')
    OR (d.slug = 'homologické-rady' AND a.slug = 'homologicke-rady')
    OR (d.slug = 'latinske-kořeny' AND a.slug = 'latinske-koreny')
    OR (d.slug = 'bunkove-delení' AND a.slug = 'bunkove-deleni')
  );