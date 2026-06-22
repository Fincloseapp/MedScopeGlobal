-- MedScope Academy — video assets for přijímačky prep courses (first lesson per course)
-- Idempotent: links video_asset_id on first published lesson, sets has_video metadata

-- ─── Video assets (prep placeholders) ────────────────────────────────────────
INSERT INTO public.video_assets (id, title, storage_path, duration_seconds, status, metadata)
SELECT * FROM (VALUES
  ('b1000001-0000-4000-8000-000000000001'::uuid, 'Stavba buňky — AI lekce', 'academy/videos/prep/biologie/bunka-struktura.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4','thumbnail_url','https://images.unsplash.com/photo-1532094349884-54311bbfaa67?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000002-0000-4000-8000-000000000002'::uuid, 'Organická chemie — AI lekce', 'academy/videos/prep/chemie/uvod-organicka.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4','thumbnail_url','https://images.unsplash.com/photo-1532187863486-abf9db1a16a1?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000003-0000-4000-8000-000000000003'::uuid, 'Mechanika — AI lekce', 'academy/videos/prep/fyzika/mechanika-zaklady.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4','thumbnail_url','https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000004-0000-4000-8000-000000000004'::uuid, 'Anatomie uchazeče — AI lekce', 'academy/videos/prep/anatomie/uvod-anatomie.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4','thumbnail_url','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000005-0000-4000-8000-000000000005'::uuid, 'Fyziologie uchazeče — AI lekce', 'academy/videos/prep/fyziologie/homeostaza.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4','thumbnail_url','https://images.unsplash.com/photo-1559757175-5700cde872bc?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000006-0000-4000-8000-000000000006'::uuid, 'Testové strategie — AI lekce', 'academy/videos/prep/strategie/time-management.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4','thumbnail_url','https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000007-0000-4000-8000-000000000007'::uuid, 'Ústní pohovor — AI lekce', 'academy/videos/prep/pohovor/uvod.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4','thumbnail_url','https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000008-0000-4000-8000-000000000008'::uuid, 'Matematika přijímačky — AI lekce', 'academy/videos/prep/matematika/procenta.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4','thumbnail_url','https://images.unsplash.com/photo-1509228468518-180dd4866904?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000009-0000-4000-8000-000000000009'::uuid, 'Latina v medicíně — AI lekce', 'academy/videos/prep/latina/uvod-latina.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4','thumbnail_url','https://images.unsplash.com/photo-1456513087680-859a078765a7?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000010-0000-4000-8000-000000000010'::uuid, 'Etika a motivační dopis — AI lekce', 'academy/videos/prep/etika/motivacni-dopis.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4','thumbnail_url','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000011-0000-4000-8000-000000000011'::uuid, 'Výběr LF — AI lekce', 'academy/videos/prep/vyber-lf/rozhodovaci-strom.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4','thumbnail_url','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video')),
  ('b1000012-0000-4000-8000-000000000012'::uuid, 'Mixed test přijímačky — AI lekce', 'academy/videos/prep/mixed/uvod-test.mp4', 480, 'ready',
    jsonb_build_object('public_url','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4','thumbnail_url','https://images.unsplash.com/photo-1606761568499-6d2451b23be8?w=640&q=80','generated',true,'render_status','ready','generation_provider','placeholder','avatar_type','european_medical_lecturer','lesson_format','video'))
) AS v(id, title, storage_path, duration_seconds, status, metadata)
WHERE NOT EXISTS (SELECT 1 FROM public.video_assets va WHERE va.id = v.id);

-- ─── Link first lesson per prep course ───────────────────────────────────────
UPDATE public.lessons l
SET video_asset_id = m.asset_id
FROM public.courses c
JOIN (VALUES
  ('biologie-prijimacky-bunka-genetika', 'b1000001-0000-4000-8000-000000000001'::uuid),
  ('chemie-prijimacky-organicka', 'b1000002-0000-4000-8000-000000000002'::uuid),
  ('fyzika-prijimacky-mechanika-elektrina', 'b1000003-0000-4000-8000-000000000003'::uuid),
  ('anatomie-zaklady-uchazece', 'b1000004-0000-4000-8000-000000000004'::uuid),
  ('fyziologie-zaklady-uchazece', 'b1000005-0000-4000-8000-000000000005'::uuid),
  ('testove-strategie-time-management', 'b1000006-0000-4000-8000-000000000006'::uuid),
  ('ustni-pohovor-lf-priprava', 'b1000007-0000-4000-8000-000000000007'::uuid),
  ('matematika-prijimacky-medicina', 'b1000008-0000-4000-8000-000000000008'::uuid),
  ('latinska-terminologie-medicina', 'b1000009-0000-4000-8000-000000000009'::uuid),
  ('etika-motivacni-dopis', 'b1000010-0000-4000-8000-000000000010'::uuid),
  ('ktera-lf-rozhodovaci-strom', 'b1000011-0000-4000-8000-000000000011'::uuid),
  ('opakovani-mixed-test-prijimacky', 'b1000012-0000-4000-8000-000000000012'::uuid)
) AS m(course_slug, asset_id) ON c.slug = m.course_slug
WHERE l.course_id = c.id
  AND l.status = 'published'
  AND l.sort_order = 1
  AND l.video_asset_id IS NULL;

-- ─── Mark prep courses as videokurz ──────────────────────────────────────────
UPDATE public.courses
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"has_video": true, "ai_lecturer": true}'::jsonb
WHERE metadata->>'prep_course' = 'true'
  AND status = 'published';

-- ─── Repair any ready video_assets missing public_url ────────────────────────
UPDATE public.video_assets
SET metadata = metadata || jsonb_build_object(
  'public_url', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'render_status', 'ready',
  'generation_provider', 'placeholder'
)
WHERE status = 'ready'
  AND (metadata->>'public_url' IS NULL OR metadata->>'public_url' = '')
  AND (metadata->>'tts_audio_url' IS NULL OR metadata->>'tts_audio_url' = '');

COMMENT ON TABLE public.video_assets IS 'MedScope Academy — includes prep + professional videokurz assets';
