-- Veřejnost — denní zdravotní videa s avatary (osvěta)
-- Topics, videos, mini-quizzes, leaderboard view; reuses xp_events for gamification

CREATE TABLE IF NOT EXISTS public.public_health_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'prevence'
    CHECK (category IN ('prevence', 'nemoc', 'dlouhovekost', 'zivotni-styl')),
  popularity_score INT NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_health_topics_category
  ON public.public_health_topics (category, popularity_score DESC);

CREATE TABLE IF NOT EXISTS public.public_health_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.public_health_topics(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  script TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  avatar_type TEXT NOT NULL DEFAULT 'friendly_doctor',
  duration_seconds INT NOT NULL DEFAULT 75,
  thumbnail_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'processing', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_health_videos_published
  ON public.public_health_videos (status, published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_public_health_videos_topic
  ON public.public_health_videos (topic_id);

CREATE TABLE IF NOT EXISTS public.public_health_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL UNIQUE REFERENCES public.public_health_videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Mini kvíz',
  passing_score INT NOT NULL DEFAULT 67,
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_health_quizzes_video
  ON public.public_health_quizzes (video_id);

-- Leaderboard view: XP from public osvěta events only
CREATE OR REPLACE VIEW public.public_health_leaderboard AS
SELECT
  e.user_id,
  SUM(e.points)::INT AS total_xp,
  COUNT(*)::INT AS event_count,
  MAX(e.created_at) AS last_activity
FROM public.xp_events e
WHERE e.event_type IN ('public_osveta_watch', 'public_osveta_quiz')
GROUP BY e.user_id
ORDER BY total_xp DESC;

GRANT SELECT ON public.public_health_leaderboard TO anon, authenticated;

COMMENT ON VIEW public.public_health_leaderboard IS
  'Veřejnost XP žebříček — pouze události public_osveta_watch a public_osveta_quiz';

-- RLS
ALTER TABLE public.public_health_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_health_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_health_quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_health_topics_public_read ON public.public_health_topics;
CREATE POLICY public_health_topics_public_read ON public.public_health_topics
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS public_health_topics_admin ON public.public_health_topics;
CREATE POLICY public_health_topics_admin ON public.public_health_topics
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS public_health_videos_public_read ON public.public_health_videos;
CREATE POLICY public_health_videos_public_read ON public.public_health_videos
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS public_health_videos_admin ON public.public_health_videos;
CREATE POLICY public_health_videos_admin ON public.public_health_videos
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS public_health_quizzes_public_read ON public.public_health_quizzes;
CREATE POLICY public_health_quizzes_public_read ON public.public_health_quizzes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS public_health_quizzes_admin ON public.public_health_quizzes;
CREATE POLICY public_health_quizzes_admin ON public.public_health_quizzes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── Seed: 7 topics + videos (one per day backfill) ─────────────────────────

INSERT INTO public.public_health_topics (slug, title, description, category, popularity_score)
SELECT v.slug, v.title, v.description, v.category, v.popularity_score
FROM (VALUES
  ('prevence-infarktu', 'Prevence infarktu', 'Jak snížit riziko srdečních příhod jednoduchými kroky.', 'prevence', 95),
  ('cukrovka-typ-2', 'Cukrovka typ 2', 'Co je diabetes 2. typu a jak mu předcházet.', 'nemoc', 92),
  ('spanek-a-zdravi', 'Spánek a zdraví', 'Proč kvalitní spánek chrání srdce, mozek i imunitu.', 'zivotni-styl', 88),
  ('ockovani', 'Očkování', 'Jak očkování chrání vás i okolí — srozumitelně a bez paniky.', 'prevence', 85),
  ('dlouhovekost', 'Dlouhověkost', 'Návyky modrých zón: pohyb, strava, smysl života.', 'dlouhovekost', 80),
  ('stres', 'Stres a zdraví', 'Jak poznat chronický stres a co s ním dělat.', 'zivotni-styl', 78),
  ('zdrava-strava', 'Zdravá strava', 'Středomořská strava a jednoduché tipy pro každodenní talíř.', 'zivotni-styl', 90)
) AS v(slug, title, description, category, popularity_score)
WHERE NOT EXISTS (SELECT 1 FROM public.public_health_topics LIMIT 1);

INSERT INTO public.public_health_videos (
  topic_id, slug, title, script, video_url, avatar_type, duration_seconds,
  thumbnail_url, metadata, published_at, status
)
SELECT
  t.id,
  v.slug,
  v.title,
  v.script,
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  v.avatar_type,
  v.duration_seconds,
  v.thumbnail_url,
  jsonb_build_object('render_provider', 'placeholder', 'lesson_format', 'video', 'seed', true),
  v.published_at,
  'published'
FROM (VALUES
  (
    'prevence-infarktu',
    'Prevence infarktu: 5 tipů pro zdravé srdce',
    'Ahoj! Jsem doktor Martin a dnes vám v minutě a půl řeknu, jak chránit srdce. Infarkt nečeká na věk — prevence začíná dnes. Tip jedna: každý den alespoň 30 minut chůze. Tip dva: méně soli — max šest gramů denně. Tip tři: nekouřte, opravdu to stojí za to. Tip čtyři: kontrolujte tlak a cholesterol u praktika. Tip pět: stres zvládejte pohybem, spánkem a rozhovorem s blízkými. Malé kroky = velký rozdíl. Pečujte o srdce — ono o vás pečuje každou sekundu!',
    'friendly_doctor',
    80,
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=640&q=80',
    (now() - interval '6 days')::date + time '08:00'
  ),
  (
    'cukrovka-typ-2',
    'Cukrovka typ 2: co je to a jak jí předcházet',
    'Zdravím vás! Jsem sestra Klára. Cukrovka typ 2 znamená, že tělo špatně využívá inzulín — cukr v krvi stoupá. Často nemáte žádné příznaky, proto je prevence klíčová. Rizikové faktory? Nadváha, málo pohybu, rodinná anamnéza. Co pomáhá? Pravidelná chůze, celozrnné potraviny, méně sladkostí a slazených nápojů. Ideální je kontrola glykémie po čtyřicítce u praktika. Cukrovka není rozsudek — dá se zvládnout životním stylem. Začněte jedním malým krokem ještě dnes!',
    'nurse',
    85,
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=640&q=80',
    (now() - interval '5 days')::date + time '08:00'
  ),
  (
    'spanek-a-zdravi',
    'Spánek: proč je klíčový pro vaše zdraví',
    'Dobrý den! Jsem wellness kouč Petra. Spánek není luxus — je to medicína zdarma. Dospělý potřebuje sedm až devět hodin. Špatný spánek zvyšuje riziko obezity, cukrovky i deprese. Jak na to? Pravidelná doba usínání, tmu v ložnici, žádné obrazovky hodinu před spaním. Kofein po druhé odpoledne? Raději ne. A pohyb ano — ale ne těsně před spaním. Zkuste dnes večer jednu věc jinak — třeba knihu místo telefonu. Vaše tělo vám poděkuje!',
    'wellness_coach',
    75,
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=640&q=80',
    (now() - interval '4 days')::date + time '08:00'
  ),
  (
    'ockovani',
    'Očkování: proč má smysl',
    'Ahoj! Doktor Martin zase na scéně. Očkování trénuje imunitu — jako sparing před zápasem. Po očkování tělo ví, jak viru nebo bakterii porazit dřív, než ona porazí vás. Nejen chráníte sebe, ale i babičku, děti nebo kolegy, kteří očkování nemohou. Vedlejší účinky? Obvykle jen bolavost v místě vpichu nebo únava na den. Vážné komplikace jsou extrémně vzácné. Mluvte s praktikem o kalendáři očkování — ten je sestaven podle věku a rizik. Věda za očkováním je jedna z největších výher medicíny!',
    'friendly_doctor',
    78,
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&q=80',
    (now() - interval '3 days')::date + time '08:00'
  ),
  (
    'dlouhovekost',
    'Dlouhověkost: návyky, které fungují',
    'Zdravím! Petra, váš wellness průvodce. Lidé v modrých zónách světa žijí déle — ne díky pilulce, ale návykům. Pohyb každý den, hlavně chůze. Strava bohatá na zeleninu, luštěniny, ořechy a olivový olej. Silné vztahy — rodina, přátelé, komunita. Smysl života: práce, koníček, dobrovolnictví. A mírnost — trocha vína ano, litry ne. Geny hrají roli, ale styl života rozhoduje víc, než si myslíte. Vyberte si jeden návyk tento týden a držte ho. Dlouhověkost je maraton, ne sprint!',
    'wellness_coach',
    82,
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=640&q=80',
    (now() - interval '2 days')::date + time '08:00'
  ),
  (
    'stres',
    'Stres: když tělo volá stop',
    'Ahoj, tady sestra Klára. Stres je normální — problém je chronický stres. Poznáte ho? Špatný spánek, bolesti hlavy, podrážděnost, zažívací potíže. Dlouhodobě zvyšuje riziko infarktu i cukrovky. Co funguje? Pravidelný pohyb — i deset minut. Dechová cvičení: nádech čtyři sekundy, výdech šest. Říct si o pomoc není slabost. A omezte zprávy, které vás vyčerpávají. Malá pauza během dne — sklenice vody, pět deep breaths — může změnit celý den. Pečujte o hlavu stejně jako o srdce!',
    'nurse',
    76,
    'https://images.unsplash.com/photo-1499203537840-48a0a8e1f4a5?w=640&q=80',
    (now() - interval '1 day')::date + time '08:00'
  ),
  (
    'zdrava-strava',
    'Zdravá strava bez extrémů',
    'Dobrý den! Doktor Martin s dnešním tipem. Zdravá strava není dieta na týden — je to styl na roky. Polovina talíře zelenina a ovoce. Celozrnné obiloviny místo bílé mouky. Ryby dvakrát týdně, libové maso střídmě. Voda místo slazených drinků. A nezapomeňte — i zdravé jídlo může být chutné! Středomořský styl: olivový olej, bylinky, rajčata, fazole. Nemusíte být dokonalí — stačí o deset procent lépe než minulý týden. Vařte doma, čtěte etikety a užívejte si jídlo s blízkými. To je recept, který funguje!',
    'friendly_doctor',
    84,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&q=80',
    now()::date + time '08:00'
  )
) AS v(slug, title, script, avatar_type, duration_seconds, thumbnail_url, published_at)
JOIN public.public_health_topics t ON t.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM public.public_health_videos LIMIT 1);

-- Mini-quizzes (3 questions each)
INSERT INTO public.public_health_quizzes (video_id, title, passing_score, questions)
SELECT
  pv.id,
  'Mini kvíz: ' || pv.title,
  67,
  q.questions
FROM public.public_health_videos pv
JOIN (VALUES
  ('prevence-infarktu', '[
    {"question_text":"Kolik minut chůze denně doporučujeme pro zdravé srdce?","options":["10 minut","30 minut","2 hodiny"],"correct_answer":"30 minut","explanation":"Pravidelná chůze alespoň 30 minut denně výrazně snižuje kardiovaskulární riziko."},
    {"question_text":"Co patří mezi rizikové faktory infarktu?","options":["Pravidelný spánek","Kouření","Dostatek vody"],"correct_answer":"Kouření","explanation":"Kouření poškozuje cévy a je jedním z hlavních modifikovatelných rizik."},
    {"question_text":"Proč kontrolovat krevní tlak?","options":["Jen pro starší","Vysoký tlak často nemá příznaky","Kvůli barvě krve"],"correct_answer":"Vysoký tlak často nemá příznaky","explanation":"Hypertenze bývá tichá — proto pravidelná kontrola u praktika."}
  ]'::jsonb),
  ('cukrovka-typ-2', '[
    {"question_text":"Co je hlavní problém u cukrovky typ 2?","options":["Málo inzulínu vždy","Špatné využití inzulínu","Příliš mnoho vody"],"correct_answer":"Špatné využití inzulínu","explanation":"U typu 2 tělo často produkuje inzulín, ale buňky na něj špatně reagují."},
    {"question_text":"Co pomáhá prevenci?","options":["Slazené nápoje","Pravidelná chůze","Méně spánku"],"correct_answer":"Pravidelná chůze","explanation":"Pohyb zlepšuje citlivost na inzulín."},
    {"question_text":"Kdy kontrolovat glykémii?","options":["Nikdy","Po 40 letech u praktika","Jen při horečce"],"correct_answer":"Po 40 letech u praktika","explanation":"Screening glykémie je součástí preventivních prohlídek."}
  ]'::jsonb),
  ('spanek-a-zdravi', '[
    {"question_text":"Kolik hodin spánku potřebuje dospělý?","options":["4–5","7–9","12+"],"correct_answer":"7–9","explanation":"Dospělí potřebují zhruba 7–9 hodin kvalitního spánku."},
    {"question_text":"Co zhoršuje spánek?","options":["Tma v ložnici","Obrazovky před spaním","Pravidelný režim"],"correct_answer":"Obrazovky před spaním","explanation":"Modré světlo ruší produkci melatoninu."},
    {"question_text":"Kdy omezit kofein?","options":["Po 14. hodině","V noci jen","Nikdy"],"correct_answer":"Po 14. hodině","explanation":"Kofein má dlouhý poločas — odpolední káva může rušit spánek."}
  ]'::jsonb),
  ('ockovani', '[
    {"question_text":"Jak očkování funguje?","options":["Nahradí imunitu","Trénuje imunitní systém","Oslabí tělo"],"correct_answer":"Trénuje imunitní systém","explanation":"Vakcína učí imunitu rozpoznat patogen bez nemoci."},
    {"question_text":"Proč očkovat i kvůli ostatním?","options":["Není důvod","Ochrana zranitelných skupin","Jen kvůli pasu"],"correct_answer":"Ochrana zranitelných skupin","explanation":"Herd immunity chrání ty, kdo se očkovat nemohou."},
    {"question_text":"Co jsou běžné reakce?","options":["Bolest v místě vpichu","Okamžitá alergie vždy","Ztráta paměti"],"correct_answer":"Bolest v místě vpichu","explanation":"Lokální bolest a mírná únava jsou běžné a krátkodobé."}
  ]'::jsonb),
  ('dlouhovekost', '[
    {"question_text":"Co spojuje modré zóny?","options":["Jen geny","Návyky: pohyb, strava, vztahy","Extrémní diety"],"correct_answer":"Návyky: pohyb, strava, vztahy","explanation":"Dlouhověkost je kombinace stylu života a komunity."},
    {"question_text":"Jaká strava se opakuje?","options":["Jen maso","Zelenina, luštěniny, ořechy","Jen fast food"],"correct_answer":"Zelenina, luštěniny, ořechy","explanation":"Rostlinná strava dominuje v dlouhověkých populacích."},
    {"question_text":"Co dává smysl života?","options":["Jen práce","Práce, koníčky, komunita","Izolace"],"correct_answer":"Práce, koníčky, komunita","explanation":"Purpose a sociální vazby prodlužují život."}
  ]'::jsonb),
  ('stres', '[
    {"question_text":"Co signalizuje chronický stres?","options":["Jen radost","Špatný spánek, bolesti hlavy","Více energie"],"correct_answer":"Špatný spánek, bolesti hlavy","explanation":"Tělesné příznaky jsou varování — neignorujte je."},
    {"question_text":"Co pomáhá rychle?","options":["Dechová cvičení","Další káva","Ignorovat"],"correct_answer":"Dechová cvičení","explanation":"Pomalý výdech aktivuje parasympatikus a uklidňuje."},
    {"question_text":"Je žádost o pomoc slabost?","options":["Ano","Ne, je to síla","Jen pro děti"],"correct_answer":"Ne, je to síla","explanation":"Psychická podpora je součást zdravé péče o sebe."}
  ]'::jsonb),
  ('zdrava-strava', '[
    {"question_text":"Kolik talíře by měla zabírat zelenina?","options":["Desetina","Půlka","Celý talíř vždy"],"correct_answer":"Půlka","explanation":"Polovina talíře zelenina a ovoce je jednoduché pravidlo."},
    {"question_text":"Co preferovat místo bílé mouky?","options":["Celozrnné obiloviny","Jen cukr","Nic"],"correct_answer":"Celozrnné obiloviny","explanation":"Celozrnné produkty mají více vlákniny a pomaleji zvedají glykémii."},
    {"question_text":"Jaký styl stravy zmiňujeme?","options":["Středomořský","Jen proteinová","Jen sladký"],"correct_answer":"Středomořský","explanation":"Středomořská strava je dobře prozkoumaná a udržitelná."}
  ]'::jsonb)
) AS q(slug, questions) ON q.slug = pv.slug
WHERE NOT EXISTS (SELECT 1 FROM public.public_health_quizzes LIMIT 1);
