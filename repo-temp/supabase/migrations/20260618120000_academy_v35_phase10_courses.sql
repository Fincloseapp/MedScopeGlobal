-- MedScope Academy v35 Phase 10 — 2 additional courses + quizzes (idempotent)

-- ─── Course: Farmakologie II ─────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'farmakologie-ii',
  'Farmakologie II',
  'Pokročilé téma interakcí léčiv, nežádoucích účinků a klinického dávkování.',
  'Videokurz pro studenty 4.–6. ročníku LF.',
  'published',
  'intermediate',
  'farmakologie',
  90,
  180,
  true,
  '{"has_video": true, "ai_lecturer": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'farmakologie-ii');

-- ─── Course: Neurologie základy ──────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'neurologie-zaklady',
  'Neurologie — základy',
  'Úvod do neurologického vyšetření, reflexů a nejčastějších neurologických syndromů.',
  'Videokurz s AI lektorem pro klinické ročníky.',
  'published',
  'intermediate',
  'neurologie',
  80,
  160,
  true,
  '{"has_video": true, "ai_lecturer": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'neurologie-zaklady');

-- ─── Video assets ────────────────────────────────────────────────────────────
INSERT INTO public.video_assets (id, title, storage_path, duration_seconds, status, metadata)
SELECT
  'a1000004-0000-4000-8000-000000000004'::uuid,
  'Interakce léčiv — AI lekce',
  'academy/videos/demo/interakce-leciv.mp4',
  520,
  'ready',
  jsonb_build_object(
    'public_url', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'thumbnail_url', 'https://images.unsplash.com/photo-1587854692152-cbf240db531b?w=640&q=80',
    'generated', true,
    'render_status', 'ready',
    'generation_provider', 'placeholder'
  )
WHERE NOT EXISTS (SELECT 1 FROM public.video_assets WHERE id = 'a1000004-0000-4000-8000-000000000004'::uuid);

INSERT INTO public.video_assets (id, title, storage_path, duration_seconds, status, metadata)
SELECT
  'a1000005-0000-4000-8000-000000000005'::uuid,
  'Neurologické vyšetření — AI lekce',
  'academy/videos/demo/neurologicke-vysetreni.mp4',
  560,
  'ready',
  jsonb_build_object(
    'public_url', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'thumbnail_url', 'https://images.unsplash.com/photo-1559757175-5700cde872bc?w=640&q=80',
    'generated', true,
    'render_status', 'ready',
    'generation_provider', 'placeholder'
  )
WHERE NOT EXISTS (SELECT 1 FROM public.video_assets WHERE id = 'a1000005-0000-4000-8000-000000000005'::uuid);

-- ─── Lessons ─────────────────────────────────────────────────────────────────
INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status, video_asset_id)
SELECT c.id, 'interakce-leciv', 'Interakce léčiv',
  E'## Interakce léčiv\n\nFarmakologické interakce mohou **zvyšovat nebo snižovat účinek** současně podávaných léků.',
  1, 28, 'published', 'a1000004-0000-4000-8000-000000000004'::uuid
FROM public.courses c
WHERE c.slug = 'farmakologie-ii'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'interakce-leciv');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status, video_asset_id)
SELECT c.id, 'neurologicke-vysetreni', 'Neurologické vyšetření',
  E'## Neurologické vyšetření\n\nZákladní součástí je **anamnéza, stav vědomí, motorika, reflexy a citlivost**.',
  1, 30, 'published', 'a1000005-0000-4000-8000-000000000005'::uuid
FROM public.courses c
WHERE c.slug = 'neurologie-zaklady'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'neurologicke-vysetreni');

-- ─── Quizzes ─────────────────────────────────────────────────────────────────
INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Interakce léčiv', 70, 'published'
FROM public.courses c WHERE c.slug = 'farmakologie-ii'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Interakce léčiv');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Co je indukce cytochromu P450?', 'multiple_choice',
  '[{"label":"Zvýšení metabolismu některých léků","value":"indukce"},{"label":"Snížení absorpce","value":"absorpce"}]'::jsonb,
  '{"value":"indukce"}'::jsonb, 1, 'Indukce P450 zvyšuje metabolickou clearance.'
FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'farmakologie-ii' AND q.title = 'Kvíz: Interakce léčiv'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id);

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Neurologické vyšetření', 70, 'published'
FROM public.courses c WHERE c.slug = 'neurologie-zaklady'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Neurologické vyšetření');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Který reflex se testuje klepnutím na šlachu nad patelou?', 'multiple_choice',
  '[{"label":"Bicepsový","value":"biceps"},{"label":"Patelární","value":"patelarni"}]'::jsonb,
  '{"value":"patelarni"}'::jsonb, 1, 'Patelární reflex (L4) se vyvolává úderem na lig. patellae.'
FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'neurologie-zaklady' AND q.title = 'Kvíz: Neurologické vyšetření'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id);

-- Ensure anatomie has quiz if missing
INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Kosterní systém', 70, 'published'
FROM public.courses c WHERE c.slug = 'uvod-do-anatomie'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id);
