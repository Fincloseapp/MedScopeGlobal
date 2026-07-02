-- MedScope Academy v35 — extended seed: 2 more video courses + video_assets (idempotent)

-- ─── Course: Farmakologie ────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'uvod-do-farmakologie',
  'Úvod do farmakologie',
  'Základy farmakodynamiky a farmakokinetiky pro studenty medicíny.',
  'Léčivé látky, dávkování a bezpečnost — videokurz s AI lektorem.',
  'published',
  'beginner',
  'farmakologie',
  60,
  120,
  true,
  '{"has_video": true, "ai_lecturer": true}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.courses WHERE slug = 'uvod-do-farmakologie'
);

-- ─── Course: Kardiologie ─────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'zaklady-kardiologie',
  'Základy kardiologie',
  'Přehled srdeční anatomie, EKG a nejčastějších kardiologických stavů.',
  'Klinicky orientovaný videokurz pro studenty 3.–5. ročníku LF.',
  'published',
  'intermediate',
  'kardiologie',
  75,
  150,
  true,
  '{"has_video": true, "ai_lecturer": true}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.courses WHERE slug = 'zaklady-kardiologie'
);

-- ─── Update anatomie course metadata for video badge ─────────────────────────
UPDATE public.courses
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"has_video": true, "ai_lecturer": true}'::jsonb
WHERE slug = 'uvod-do-anatomie';

-- ─── Video assets (demo placeholders — replace with HeyGen/Synthesia in prod) ─
INSERT INTO public.video_assets (id, title, storage_path, duration_seconds, status, metadata)
SELECT
  'a1000001-0000-4000-8000-000000000001'::uuid,
  'Kosterní systém — AI lekce',
  'academy/videos/demo/kosterni-system.mp4',
  480,
  'ready',
  jsonb_build_object(
    'public_url', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'thumbnail_url', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&q=80',
    'generated', true,
    'avatar_type', 'european_medical_lecturer',
    'voice_type', 'cs_female_professional',
    'script', 'Vítejte u lekce o kosterním systému. Kostra tvoří opěrnou konstrukci těla...',
    'storyboard', jsonb_build_array(
      jsonb_build_object('scene', 1, 'visual', 'Anatomický model kostry', 'narration', 'Úvod do kosterního systému'),
      jsonb_build_object('scene', 2, 'visual', 'Páteř a žeberní koš', 'narration', 'Struktura páteře a žeber')
    )
  )
WHERE NOT EXISTS (SELECT 1 FROM public.video_assets WHERE id = 'a1000001-0000-4000-8000-000000000001'::uuid);

INSERT INTO public.video_assets (id, title, storage_path, duration_seconds, status, metadata)
SELECT
  'a1000002-0000-4000-8000-000000000002'::uuid,
  'Farmakokinetika — AI lekce',
  'academy/videos/demo/farmakokinetika.mp4',
  540,
  'ready',
  jsonb_build_object(
    'public_url', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'thumbnail_url', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=640&q=80',
    'generated', true,
    'avatar_type', 'european_medical_lecturer',
    'voice_type', 'cs_male_professional',
    'script', 'Farmakokinetika popisuje, jak organismus zpracovává léčivé látky...',
    'storyboard', jsonb_build_array(
      jsonb_build_object('scene', 1, 'visual', 'Schéma absorpce léčiva', 'narration', 'Absorpce a distribuce'),
      jsonb_build_object('scene', 2, 'visual', 'Játra a metabolismus', 'narration', 'Metabolismus a eliminace')
    )
  )
WHERE NOT EXISTS (SELECT 1 FROM public.video_assets WHERE id = 'a1000002-0000-4000-8000-000000000002'::uuid);

INSERT INTO public.video_assets (id, title, storage_path, duration_seconds, status, metadata)
SELECT
  'a1000003-0000-4000-8000-000000000003'::uuid,
  'EKG základy — AI lekce',
  'academy/videos/demo/ekg-zaklady.mp4',
  600,
  'ready',
  jsonb_build_object(
    'public_url', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'thumbnail_url', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=640&q=80',
    'generated', true,
    'avatar_type', 'european_medical_lecturer',
    'voice_type', 'cs_female_professional',
    'script', 'Elektrokardiogram je základní diagnostický nástroj v kardiologii...',
    'storyboard', jsonb_build_array(
      jsonb_build_object('scene', 1, 'visual', 'EKG křivka P-QRS-T', 'narration', 'Základní vlny EKG'),
      jsonb_build_object('scene', 2, 'visual', 'Normální vs patologické EKG', 'narration', 'Interpretace nálezů')
    )
  )
WHERE NOT EXISTS (SELECT 1 FROM public.video_assets WHERE id = 'a1000003-0000-4000-8000-000000000003'::uuid);

-- ─── Link anatomie lesson to video ───────────────────────────────────────────
UPDATE public.lessons l
SET video_asset_id = 'a1000001-0000-4000-8000-000000000001'::uuid
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'uvod-do-anatomie'
  AND l.slug = 'kosterni-system'
  AND l.video_asset_id IS NULL;

-- ─── Farmakologie lessons ────────────────────────────────────────────────────
INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status, video_asset_id)
SELECT
  c.id,
  'farmakokinetika',
  'Farmakokinetika',
  E'## Farmakokinetika\n\nFarmakokinetika popisuje **cestu léčiva organismem**: absorpce, distribuce, metabolismus a eliminace (ADME).\n\n### Klíčové pojmy\n- **Poloviční doba** — čas poklesu koncentrace na polovinu\n- **Biodostupnost** — podíl vstřebané dávky\n- **Clearance** — rychlost odstranění z organismu',
  1,
  25,
  'published',
  'a1000002-0000-4000-8000-000000000002'::uuid
FROM public.courses c
WHERE c.slug = 'uvod-do-farmakologie'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'farmakokinetika'
  );

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT
  c.id,
  'farmakodynamika',
  'Farmakodynamika',
  E'## Farmakodynamika\n\nFarmakodynamika studuje **účinek léčiva na organismus** — vazbu na receptory, dávkovou odezvu a terapeutické okno.',
  2,
  20,
  'published'
FROM public.courses c
WHERE c.slug = 'uvod-do-farmakologie'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'farmakodynamika'
  );

-- ─── Kardiologie lessons ─────────────────────────────────────────────────────
INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status, video_asset_id)
SELECT
  c.id,
  'ekg-zaklady',
  'EKG — základy interpretace',
  E'## EKG základy\n\nElektrokardiogram zaznamenává elektrickou aktivitu srdce. Základní vlny: **P, QRS, T**.\n\n### Normální rytmus\n- Srdeční frekvence 60–100/min\n- Pravidelný RR interval',
  1,
  30,
  'published',
  'a1000003-0000-4000-8000-000000000003'::uuid
FROM public.courses c
WHERE c.slug = 'zaklady-kardiologie'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'ekg-zaklady'
  );

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT
  c.id,
  'srdecni-selhani',
  'Srdeční selhání',
  E'## Srdeční selhání\n\nChronické srdeční selhání (CHS) je stav, kdy srdce nezvládá pokrýt metabolické nároky organismu.\n\n### Symptomy\n- Dušnost, otoky dolních končetin, únava',
  2,
  25,
  'published'
FROM public.courses c
WHERE c.slug = 'zaklady-kardiologie'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'srdecni-selhani'
  );

-- ─── Quizzes for new courses ─────────────────────────────────────────────────
INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Farmakokinetika', 70, 'published'
FROM public.courses c
WHERE c.slug = 'uvod-do-farmakologie'
  AND NOT EXISTS (
    SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Farmakokinetika'
  );

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT
  q.id,
  'Co znamená zkratka ADME ve farmakokinetice?',
  'multiple_choice',
  '[{"label":"Absorpce, distribuce, metabolismus, eliminace","value":"adme"},{"label":"Analýza, diagnostika, monitoring, evaluace","value":"wrong"}]'::jsonb,
  '{"value":"adme"}'::jsonb,
  1,
  'ADME = Absorpce, Distribuce, Metabolismus, Eliminace.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'uvod-do-farmakologie' AND q.title = 'Kvíz: Farmakokinetika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id);

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: EKG základy', 70, 'published'
FROM public.courses c
WHERE c.slug = 'zaklady-kardiologie'
  AND NOT EXISTS (
    SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: EKG základy'
  );

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT
  q.id,
  'Která vlna EKG odpovídá depolarizaci komor?',
  'multiple_choice',
  '[{"label":"P vlna","value":"p"},{"label":"QRS komplex","value":"qrs"},{"label":"T vlna","value":"t"}]'::jsonb,
  '{"value":"qrs"}'::jsonb,
  1,
  'QRS komplex reprezentuje depolarizaci komor.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'zaklady-kardiologie' AND q.title = 'Kvíz: EKG základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id);

COMMENT ON TABLE public.video_assets IS 'MedScope Academy v35 — includes AI-generated demo video metadata';
