-- MedScope Academy v35 — demo seed (idempotent)
-- One published course with lesson + quiz for smoke tests

INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  duration_minutes, xp_reward, is_public
)
SELECT
  'uvod-do-anatomie',
  'Úvod do anatomie',
  'Základní přehled lidské anatomie pro studenty prvního ročníku LF.',
  'Kostra, svaly a orientace v těle — první krok ke studiu medicíny.',
  'published',
  'beginner',
  'anatomie',
  45,
  100,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.courses WHERE slug = 'uvod-do-anatomie'
);

INSERT INTO public.lessons (
  course_id, slug, title, content, sort_order, duration_minutes, status
)
SELECT
  c.id,
  'kosterni-system',
  'Kosterní systém',
  'Kosterní systém tvoří vnitřní opěrnou konstrukci těla. Zahrnuje lebku, páteř, hrudní koš a končetiny.',
  1,
  20,
  'published'
FROM public.courses c
WHERE c.slug = 'uvod-do-anatomie'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.course_id = c.id AND l.slug = 'kosterni-system'
  );

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Kosterní systém', 70, 'published'
FROM public.courses c
WHERE c.slug = 'uvod-do-anatomie'
  AND NOT EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.course_id = c.id AND q.title = 'Kvíz: Kosterní systém'
  );

INSERT INTO public.quiz_questions (
  quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation
)
SELECT
  q.id,
  'Kolik párů žeber má typický dospělý člověk?',
  'multiple_choice',
  '[{"label":"10 párů","value":"10"},{"label":"12 párů","value":"12"},{"label":"14 párů","value":"14"}]'::jsonb,
  '{"value":"12"}'::jsonb,
  1,
  'Dospělý člověk má 12 párů žeber.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'uvod-do-anatomie'
  AND q.title = 'Kvíz: Kosterní systém'
  AND NOT EXISTS (
    SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id
  );

INSERT INTO public.clinical_simulations (title, slug, scenario_json, difficulty, status)
SELECT
  'Akutní břicho — triáž',
  'akutni-bricho-triaz',
  '{"chief_complaint":"Bolest břicha","vitals":{"bp":"130/85","hr":98}}'::jsonb,
  'beginner',
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM public.clinical_simulations WHERE slug = 'akutni-bricho-triaz'
);

INSERT INTO public.textbooks (title, slug, status, metadata)
SELECT
  'Anatomie — základy',
  'anatomie-zaklady',
  'published',
  '{"chapters":3}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.textbooks WHERE slug = 'anatomie-zaklady'
);

INSERT INTO public.ai_scenarios (title, slug, prompt_template, status)
SELECT
  'Pacient s horečkou',
  'pacient-horecka',
  'Simulujte vyšetření pacienta s horečkou a bolestí hlavy.',
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_scenarios WHERE slug = 'pacient-horecka'
);

INSERT INTO public.study_games (title, slug, game_type, status, config)
SELECT
  'Anatomie kvízový závod',
  'anatomie-kviz-zavod',
  'quiz_race',
  'published',
  '{"time_limit_sec":60}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.study_games WHERE slug = 'anatomie-kviz-zavod'
);

COMMENT ON TABLE public.courses IS 'MedScope Academy v35 — includes demo seed uvod-do-anatomie';
