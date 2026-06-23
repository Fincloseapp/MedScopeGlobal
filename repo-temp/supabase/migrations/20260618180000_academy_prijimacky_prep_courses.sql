-- MedScope Academy — přípravné kurzy pro přijímačky LF (12 kurzů)
-- Idempotent seed: courses, lessons, quizzes, quiz_questions
-- Tag: {"audience": "prijimacky", "prep_course": true}

-- Extend level check for prep courses
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_level_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_level_check
  CHECK (level IN ('beginner', 'intermediate', 'advanced', 'priprava'));


-- ─── Biologie pro přijímačky — buňka a genetika ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'biologie-prijimacky-bunka-genetika',
  'Biologie pro přijímačky — buňka a genetika',
  'Komplexní příprava na biologickou část přijímacích zkoušek LF: stavba buňky, dělení, genetika a Mendelovy zákony v kontextu Cermat sylabů.',
  'Buňka, membrány, organely, DNA, RNA a dědičnost — základ pro úspěch u přijímaček.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1532094349884-54311bbfaa67?w=640&q=80',
  90,
  120,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'biologie-prijimacky-bunka-genetika');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'bunka-struktura', 'Stavba prokaryotické a eukaryotické buňky', E'## A) Prokaryotická buňka
Prokaryoti (bakterie, archea) nemají jádro. DNA je v nukleoidu, ribozomy 70S, stěna z peptidoglykanu.

## B) Eukaryotická buňka
Eukaryoti mají jádro obalené jadernou obalou, mitochondrie (ATP), ER, Golgi, lyzozomy (u živočichů).

## C) Membrána a transport
Fosfolipidová dvojvrstva, difúze, osmóza, aktivní transport, endocytóza/exocytóza.

## D) Typické úlohy u přijímaček
Rozlišení organel podle funkce, směr toku bílkovin ER→Golgi, vliv koncentrace na osmózu.', 1, 25, 'published'
FROM public.courses c
WHERE c.slug = 'biologie-prijimacky-bunka-genetika'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'bunka-struktura');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'bunkove-deleni', 'Buněčné dělení — mitóza a meióza', E'## A) Mitóza
Zachovává počet chromozomů (2n→2n). Fáze: profáze, metafáze, anafáze, telofáze. Výsledek: dvě identické dcery.

## B) Meióza
Snižuje počet chromozomů (2n→n). Meióza I (křížení) a II. Vytváří 4 haploidní gamety.

## C) Srovnání
Mitóza = růst, oprava; meióza = pohlavní rozmnožování, variabilita.

## D) Cermat tip
Znalost pořadí fází a změn počtu chromozomů v jednotlivých fázích.', 2, 30, 'published'
FROM public.courses c
WHERE c.slug = 'biologie-prijimacky-bunka-genetika'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug IN ('bunkove-deleni', 'bunkove-delení'));

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'genetika-mendel', 'Genetika — Mendelovy zákony a křížení', E'## A) Základní pojmy
Gen, alela, genotyp, fenotyp, homozygota, heterozygota, dominantní/recesivní alela.

## B) První Mendelův zákon
Uniformita potomstva F1 při křížení homozygot.

## C) Druhý Mendelův zákon
Nezávislé dědičnostní dělení — Punnettův čtverec pro dvojnásobné křížení.

## D) Praktická cvičení
Křížení Aa × Aa → poměr 3:1. Krevní skupiny AB0 jako příklad kodominance.', 3, 35, 'published'
FROM public.courses c
WHERE c.slug = 'biologie-prijimacky-bunka-genetika'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'genetika-mendel');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Biologie — buňka a genetika', 70, 'published'
FROM public.courses c
WHERE c.slug = 'biologie-prijimacky-bunka-genetika'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Biologie — buňka a genetika');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Která organela je hlavním místem produkce ATP v eukaryotické buňce?', 'multiple_choice', '[{"label":"Lyzozom","value":"a"},{"label":"Mitochondrie","value":"b"},{"label":"Ribozom","value":"c"},{"label":"Centriola","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Mitochondrie jsou centra buněčného dýchání a produkce ATP.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'biologie-prijimacky-bunka-genetika' AND q.title = 'Kvíz: Biologie — buňka a genetika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Kolik haploidních buněk vznikne jednou meiózou u člověka?', 'multiple_choice', '[{"label":"2","value":"a"},{"label":"3","value":"b"},{"label":"4","value":"c"},{"label":"8","value":"d"}]'::jsonb, '{"value":"c"}'::jsonb, 2, 'Meióza I a II dávají čtyři haploidní gamety.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'biologie-prijimacky-bunka-genetika' AND q.title = 'Kvíz: Biologie — buňka a genetika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Jaký genotyp má homozygotní recesivní jedinec pro alelu A/a?', 'multiple_choice', '[{"label":"AA","value":"a"},{"label":"Aa","value":"b"},{"label":"aa","value":"c"},{"label":"AB","value":"d"}]'::jsonb, '{"value":"c"}'::jsonb, 3, 'Homozygota recesivní = obě alely stejné recesivní.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'biologie-prijimacky-bunka-genetika' AND q.title = 'Kvíz: Biologie — buňka a genetika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Přes kterou strukturu prochází selektivní transport iontů?', 'multiple_choice', '[{"label":"Stěna","value":"a"},{"label":"Plazmatická membrána","value":"b"},{"label":"Nukleoid","value":"c"},{"label":"Vakuola","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 4, 'Membrána reguluje vstup a výstup látek.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'biologie-prijimacky-bunka-genetika' AND q.title = 'Kvíz: Biologie — buňka a genetika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'V jaké fázi mitózy dochází k rozdělení sesterských chromatid?', 'multiple_choice', '[{"label":"Profáze","value":"a"},{"label":"Metafáze","value":"b"},{"label":"Anafáze","value":"c"},{"label":"Interfáze","value":"d"}]'::jsonb, '{"value":"c"}'::jsonb, 5, 'Anafáze = tažení chromatid k pólym.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'biologie-prijimacky-bunka-genetika' AND q.title = 'Kvíz: Biologie — buňka a genetika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Chemie pro přijímačky — organická chemie základy ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'chemie-prijimacky-organicka',
  'Chemie pro přijímačky — organická chemie základy',
  'Uhlíkaté sloučeniny, vazby, homologické řady a reakce požadované u přijímaček na LF — s důrazem na Cermat styl.',
  'Alkany, alkeny, alkoholy, kyseliny — nomenklatura a reakce.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1532187863486-abf9db1a16a1?w=640&q=80',
  85,
  115,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'chemie-prijimacky-organicka');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'uhlikove-vazby', 'Vazby uhlíku a hybridizace', E'## A) Hybridizace
sp³ (tetrický), sp² (trojúhelníkový), sp (lineární).

## B) Typy vazeb
Jednoduchá, dvojná, trojná. Sigma a pi vazby.

## C) Strukturní vzorce
Zkrácené vzorce, izomérie sestavy a polohy.

## D) Přijímačkový tip
Rozpoznat sp² u alkenů a aromatických sloučenin.', 1, 28, 'published'
FROM public.courses c
WHERE c.slug = 'chemie-prijimacky-organicka'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'uhlikove-vazby');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'homologické-rady', 'Homologické řady — alkany a alkeny', E'## A) Alkany CₙH₂ₙ₊₂
Nasycené uhlovodíky, substituční reakce (halogenace).

## B) Alkeny CₙH₂ₙ
Nenasycené, dvojná vazba, adice (H₂, Br₂, H₂O/H⁺).

## C) Nomenklatura
IUPAC: nejdelší řetězec, číslování, substituenty.

## D) Markovnikovo pravidlo
Adice HX k asymetrickému alkenu.', 2, 30, 'published'
FROM public.courses c
WHERE c.slug = 'chemie-prijimacky-organicka'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'homologické-rady');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'alkoholy-kyseliny', 'Alkoholy, aldehydy a karboxylové kyseliny', E'## A) Alkoholy R–OH
Primární, sekundární, terciární. Oxidace na aldehyd/keton/kyselinu.

## B) Aldehydy a ketony
Karbonyl C=O. Tollensův/test Fehlingova roztoku u aldehydů.

## C) Karboxylové kyseliny
Kyselost, esterifikace s alkoholem.

## D) Praktické úlohy
Určení produktů oxidace ethanolu.', 3, 27, 'published'
FROM public.courses c
WHERE c.slug = 'chemie-prijimacky-organicka'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'alkoholy-kyseliny');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Organická chemie', 70, 'published'
FROM public.courses c
WHERE c.slug = 'chemie-prijimacky-organicka'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Organická chemie');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Jaký vzorec má obecný alkane?', 'multiple_choice', '[{"label":"CₙH₂ₙ","value":"a"},{"label":"CₙH₂ₙ₊₂","value":"b"},{"label":"CₙH₂ₙ₋₂","value":"c"},{"label":"CₙHₙ","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Alkany jsou nasycené: CₙH₂ₙ₊₂.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'chemie-prijimacky-organicka' AND q.title = 'Kvíz: Organická chemie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Jaký typ reakce typicky probíhá u alkenů?', 'multiple_choice', '[{"label":"Adice","value":"a"},{"label":"Eliminace","value":"b"},{"label":"Substituce","value":"c"},{"label":"Polymerace pouze","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 2, 'Nenasycená vazba se otevírá adicí.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'chemie-prijimacky-organicka' AND q.title = 'Kvíz: Organická chemie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Hybridizace uhlíku v etenu (C₂H₄)?', 'multiple_choice', '[{"label":"sp³","value":"a"},{"label":"sp²","value":"b"},{"label":"sp","value":"c"},{"label":"dsp²","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 3, 'Dvojná vazba = sp² u obou uhlíků.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'chemie-prijimacky-organicka' AND q.title = 'Kvíz: Organická chemie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Produkt úplné oxidace primárního alkoholu?', 'multiple_choice', '[{"label":"Keton","value":"a"},{"label":"Aldehyd","value":"b"},{"label":"Karboxylová kyselina","value":"c"},{"label":"Ether","value":"d"}]'::jsonb, '{"value":"c"}'::jsonb, 4, 'Primární alkohol → aldehyd → kyselina.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'chemie-prijimacky-organicka' AND q.title = 'Kvíz: Organická chemie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Co identifikuje aldehydy?', 'multiple_choice', '[{"label":"Biuretův test","value":"a"},{"label":"Tollensův test","value":"b"},{"label":"Iodoformový test","value":"c"},{"label":"Xanthoproteinový test","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 5, 'Tollens = stříbrné zrcadlo u aldehydů.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'chemie-prijimacky-organicka' AND q.title = 'Kvíz: Organická chemie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Fyzika pro přijímačky — mechanika a elektřina ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'fyzika-prijimacky-mechanika-elektrina',
  'Fyzika pro přijímačky — mechanika a elektřina',
  'Kinematika, dynamika, práce, energie a základy elektřiny pro přijímačky na medicínu.',
  'Newtonovy zákony, energie, obvod s R, C — Cermat úroveň.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&q=80',
  95,
  125,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'fyzika-prijimacky-mechanika-elektrina');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'kinematika', 'Kinematika rovnoměrného a rovnoměrně zrychleného pohybu', E'## A) Rovnoměrný pohyb
s = v·t, graf s–t je přímka.

## B) Rovnoměrně zrychlený pohyb
v = v₀ + at, s = v₀t + ½at², v² = v₀² + 2as.

## C) Volný pád
a ≈ g = 9,81 m·s⁻² (bez odporu vzduchu).

## D) Úlohy
Výpočet dráhy, času, rychlosti z grafů.', 1, 32, 'published'
FROM public.courses c
WHERE c.slug = 'fyzika-prijimacky-mechanika-elektrina'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'kinematika');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'dynamika', 'Dynamika — síly a Newtonovy zákony', E'## A) 1. Newtonův zákon
Setrvačnost — těleso setrvává v klidu/RV pohybu.

## B) 2. Newtonův zákon
F = m·a, výslednice sil určuje zrychlení.

## C) 3. Newtonův zákon
Akce = reakce, opačný směr.

## D) Tření, gravitace
F_g = m·g, třecí síla F_t = μ·F_N.', 2, 30, 'published'
FROM public.courses c
WHERE c.slug = 'fyzika-prijimacky-mechanika-elektrina'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'dynamika');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'elektrina-zaklady', 'Elektřina — proud, odpor, Ohmův zákon', E'## A) Základní veličiny
I (A), U (V), R (Ω), Q (C).

## B) Ohmův zákon
U = R·I pro lineární obvod.

## C) Sériové a paralelní zapojení
R_s = R₁+R₂; 1/R_p = 1/R₁+1/R₂.

## D) Výkon
P = U·I = I²R = U²/R.', 3, 33, 'published'
FROM public.courses c
WHERE c.slug = 'fyzika-prijimacky-mechanika-elektrina'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'elektrina-zaklady');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Fyzika — mechanika a elektřina', 70, 'published'
FROM public.courses c
WHERE c.slug = 'fyzika-prijimacky-mechanika-elektrina'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Fyzika — mechanika a elektřina');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Jednotka síly v SI?', 'multiple_choice', '[{"label":"Joule","value":"a"},{"label":"Newton","value":"b"},{"label":"Watt","value":"c"},{"label":"Pascal","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, '1 N = 1 kg·m·s⁻².'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyzika-prijimacky-mechanika-elektrina' AND q.title = 'Kvíz: Fyzika — mechanika a elektřina'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Těleso padá volným pádem 2 s. Kolik urazí (g=10 m/s²)?', 'multiple_choice', '[{"label":"10 m","value":"a"},{"label":"20 m","value":"b"},{"label":"40 m","value":"c"},{"label":"5 m","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 2, 's = ½gt² = ½·10·4 = 20 m.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyzika-prijimacky-mechanika-elektrina' AND q.title = 'Kvíz: Fyzika — mechanika a elektřina'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Ohmův zákon?', 'multiple_choice', '[{"label":"U = R/I","value":"a"},{"label":"I = U/R","value":"b"},{"label":"R = U·I","value":"c"},{"label":"P = U/R","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 3, 'U = R·I → I = U/R.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyzika-prijimacky-mechanika-elektrina' AND q.title = 'Kvíz: Fyzika — mechanika a elektřina'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Součet odporů v sérii 2 Ω a 3 Ω?', 'multiple_choice', '[{"label":"1,2 Ω","value":"a"},{"label":"5 Ω","value":"b"},{"label":"6 Ω","value":"c"},{"label":"1 Ω","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 4, 'Série: R = R₁ + R₂.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyzika-prijimacky-mechanika-elektrina' AND q.title = 'Kvíz: Fyzika — mechanika a elektřina'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, '2. Newtonův zákon?', 'multiple_choice', '[{"label":"F = m/a","value":"a"},{"label":"F = m·a","value":"b"},{"label":"F = m·g","value":"c"},{"label":"F = 0","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 5, 'Zrychlení úměrné výsledné síle.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyzika-prijimacky-mechanika-elektrina' AND q.title = 'Kvíz: Fyzika — mechanika a elektřina'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Anatomie základy pro uchazeče ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'anatomie-zaklady-uchazece',
  'Anatomie základy pro uchazeče',
  'Orientace v lidském těle, systémy orgánů a základní latinská nomenklatura pro budoucí mediky.',
  'Systémy těla, orientace, kostra a svaly — první krok k LF.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&q=80',
  75,
  100,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'anatomie-zaklady-uchazece');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'orientace-v-těle', 'Anatomické polohy a roviny', E'## A) Polohové termíny
Superior/inferior, anterior/posterior, medial/lateral, proximal/distal.

## B) Roviny
Sagitální, frontální (koronální), transverzální (horizontální).

## C) Anatomická poloha
Stoj vzpřímeně, dlaně dopředu.

## D) Příklady
Distální = dále od trupu u končetiny.', 1, 22, 'published'
FROM public.courses c
WHERE c.slug = 'anatomie-zaklady-uchazece'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'orientace-v-těle');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'kostra-prehled', 'Kostra — přehled pro uchazeče', E'## A) Axialní kostra
Lebka, páteř (7 C, 12 Th, 5 L, sakrum, koccys), hrudní koš.

## B) Appendikulární
Pánevní pletenec, končetiny — huměrus, tibia, femur.

## C) Typy kostí
Dlouhé, krátké, ploché, nepravidelné.

## D) Klouby
Synoviální, chrupavkové spoje, fúze.', 2, 28, 'published'
FROM public.courses c
WHERE c.slug = 'anatomie-zaklady-uchazece'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'kostra-prehled');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'svaly-organy', 'Svalstvo a hlavní orgánové systémy', E'## A) Svaly
Příčně pruhované (kosterní), hladké, srdeční.

## B) Orgánové systémy
Oběhový, dýchací, trávicí, vylučovací, nervový, endokrinní.

## C) Homeostáza
Udržování vnitřní rovnováhy.

## D) Propojení
Každý systém spolupracuje — např. kyslík: dýchání → krev → tkáně.', 3, 25, 'published'
FROM public.courses c
WHERE c.slug = 'anatomie-zaklady-uchazece'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'svaly-organy');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Anatomie základy', 70, 'published'
FROM public.courses c
WHERE c.slug = 'anatomie-zaklady-uchazece'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Anatomie základy');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Co znamená termín ''distální''?', 'multiple_choice', '[{"label":"Blíže k hlavě","value":"a"},{"label":"Dále od úseku připojení ke trupu","value":"b"},{"label":"Směrem k břiše","value":"c"},{"label":"Uprostřed","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Distální = vzdálenější od proximalis.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'anatomie-zaklady-uchazece' AND q.title = 'Kvíz: Anatomie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Kolik párů žeber má dospělý?', 'multiple_choice', '[{"label":"10","value":"a"},{"label":"11","value":"b"},{"label":"12","value":"c"},{"label":"14","value":"d"}]'::jsonb, '{"value":"c"}'::jsonb, 2, 'Typicky 12 párů žeber.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'anatomie-zaklady-uchazece' AND q.title = 'Kvíz: Anatomie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Který sval pumpuje krev?', 'multiple_choice', '[{"label":"Diafragma","value":"a"},{"label":"Srdeční sval","value":"b"},{"label":"Biceps","value":"c"},{"label":"Quadriceps","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 3, 'Myocardium = srdeční sval.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'anatomie-zaklady-uchazece' AND q.title = 'Kvíz: Anatomie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Frontální rovina dělí tělo na?', 'multiple_choice', '[{"label":"Levá/pravá","value":"a"},{"label":"Horní/dolní","value":"b"},{"label":"Přední/zadní","value":"c"},{"label":"Vnitřní/vnější","value":"d"}]'::jsonb, '{"value":"c"}'::jsonb, 4, 'Frontální = koronální rovina.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'anatomie-zaklady-uchazece' AND q.title = 'Kvíz: Anatomie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Která kost je nejdelší v těle?', 'multiple_choice', '[{"label":"Humerus","value":"a"},{"label":"Tibia","value":"b"},{"label":"Femur","value":"c"},{"label":"Radius","value":"d"}]'::jsonb, '{"value":"c"}'::jsonb, 5, 'Stehenní kost (femur) je nejdelší.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'anatomie-zaklady-uchazece' AND q.title = 'Kvíz: Anatomie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Fyziologie základy pro uchazeče ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'fyziologie-zaklady-uchazece',
  'Fyziologie základy pro uchazeče',
  'Jak orgány fungují — krevní oběh, dýchání, nervová soustava — pro uchazeče o studium medicíny.',
  'Funkce systémů těla na úrovni přijímačkové biologie+.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1559757175-5700cde872bc?w=640&q=80',
  80,
  110,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'fyziologie-zaklady-uchazece');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'krevni-obeh', 'Krevní oběh a srdeční cyklus', E'## A) Malý a velký oběh
Plicní vs systemický okruh.

## B) Srdeční cyklus
Systola/diastola, objemové věty.

## C) Tlak krve
Systolický/diastolický, regulace.

## D) Transport
O₂, CO₂, živiny, hormony.', 1, 28, 'published'
FROM public.courses c
WHERE c.slug = 'fyziologie-zaklady-uchazece'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'krevni-obeh');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'dychani', 'Dýchání a výměna plynů', E'## A) Mechanika dýchání
Inspirace: bránice dolů, objem hrudníku ↑.

## B) Alveolární difúze
O₂ do krve, CO₂ ven — podle parciálních tlaků.

## C) Hemoglobin
Vazba O₂, křivka disociace.

## D) Regulace
Chemoreceptory, CO₂/H⁺.', 2, 26, 'published'
FROM public.courses c
WHERE c.slug = 'fyziologie-zaklady-uchazece'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'dychani');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'nervova-soustava', 'Nervová soustava — základy', E'## A) Neuron
Dendrit, axon, synapse, neurotransmiter.

## B) CNS a PNS
Mozek, mích, somatický vs autonomní.

## C) Reflex
Reflexní oblouk — senzor, interneuron, efektor.

## D) Homeostáza
Hypothalamus, zpětnovazební smyčky.', 3, 26, 'published'
FROM public.courses c
WHERE c.slug = 'fyziologie-zaklady-uchazece'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'nervova-soustava');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Fyziologie základy', 70, 'published'
FROM public.courses c
WHERE c.slug = 'fyziologie-zaklady-uchazece'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Fyziologie základy');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Kde probíhá výměna O₂/CO₂?', 'multiple_choice', '[{"label":"Bronch","value":"a"},{"label":"Alveoly","value":"b"},{"label":"Hrtan","value":"c"},{"label":"Průdušnice","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Alveoly = místo difúze plynů.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyziologie-zaklady-uchazece' AND q.title = 'Kvíz: Fyziologie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Která komora srdeční pumpuje krev do těla?', 'multiple_choice', '[{"label":"Pravá síň","value":"a"},{"label":"Levá komora","value":"b"},{"label":"Pravá komora","value":"c"},{"label":"Levá síň","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 2, 'Levá komora → aorta → systém.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyziologie-zaklady-uchazece' AND q.title = 'Kvíz: Fyziologie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Co přenáší neurotransmiter?', 'multiple_choice', '[{"label":"Signál přes synapsi","value":"a"},{"label":"O₂ v krvi","value":"b"},{"label":"Glukózu","value":"c"},{"label":"Protony","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 3, 'Synaptický přenos signálu.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyziologie-zaklady-uchazece' AND q.title = 'Kvíz: Fyziologie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Inspirace primárně zvyšuje objem hrudníku díky?', 'multiple_choice', '[{"label":"Bránici","value":"a"},{"label":"Srdci","value":"b"},{"label":"Jaterům","value":"c"},{"label":"Slezině","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 4, 'Bránice = hlavní inspirační sval.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyziologie-zaklady-uchazece' AND q.title = 'Kvíz: Fyziologie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Malý krevní oběh spojuje?', 'multiple_choice', '[{"label":"Srdce–plíce","value":"a"},{"label":"Srdce–ledviny","value":"b"},{"label":"Srdce–sval","value":"c"},{"label":"Játra–střevo","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 5, 'Plicní cirkulace.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fyziologie-zaklady-uchazece' AND q.title = 'Kvíz: Fyziologie základy'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Testové strategie a time management ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'testove-strategie-time-management',
  'Testové strategie a time management',
  'Jak efektivně řešit test u přijímaček LF: eliminace, čas, stres a opakování chyb.',
  'Praktické techniky pro Cermat testy a multioborové přijímačky.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=640&q=80',
  60,
  80,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'testove-strategie-time-management');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'cermat-format', 'Formát Cermat testů a typy otázek', E'## A) Struktura testu
Počet otázek, čas, kategorie (bio/chem/fyz).

## B) Typy
Výběr A–D, více správných, doplňování.

## C) Bodování
Správná odpověď vs chyba — strategie tipování.

## D) Příprava
Modelové testy v reálném čase.', 1, 20, 'published'
FROM public.courses c
WHERE c.slug = 'testove-strategie-time-management'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'cermat-format');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'time-management', 'Time management během testu', E'## A) Rozdělení času
Průměr min/otázka, rezerva na kontrolu.

## B) Pořadí řešení
Nejdřív jisté, pak těžké.

## C) Značení
Neztrácet čas u jedné otázky.

## D) Kontrola
Přečíst zadání podruhé u váhavých.', 2, 20, 'published'
FROM public.courses c
WHERE c.slug = 'testove-strategie-time-management'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'time-management');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'psychologie-stresu', 'Psychologie stresu a soustředění', E'## A) Pre-test rituál
Spánek, strava, příchod včas.

## B) Dechové techniky
4-7-8, krátká pauza.

## C) Growth mindset
Chyba = data pro učení.

## D) Po testu
Analýza špatných odpovědí.', 3, 20, 'published'
FROM public.courses c
WHERE c.slug = 'testove-strategie-time-management'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'psychologie-stresu');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Testové strategie', 70, 'published'
FROM public.courses c
WHERE c.slug = 'testove-strategie-time-management'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Testové strategie');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Co dělat jako první u těžké otázky?', 'multiple_choice', '[{"label":"Okamžitě tipovat","value":"a"},{"label":"Přeskočit a vrátit se","value":"b"},{"label":"Opustit test","value":"c"},{"label":"Smaž odpověď","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Neztrácet čas — řešit jisté nejdřív.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'testove-strategie-time-management' AND q.title = 'Kvíz: Testové strategie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Proč dělat modelové testy v časovém limitu?', 'multiple_choice', '[{"label":"Zvyknout na tempo","value":"a"},{"label":"Ušetřit peníze","value":"b"},{"label":"Vyhnout se učení","value":"c"},{"label":"Kvůli videu","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 2, 'Simulace reálných podmínek.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'testove-strategie-time-management' AND q.title = 'Kvíz: Testové strategie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Eliminační metoda znamená?', 'multiple_choice', '[{"label":"Vyloučit nesprávné možnosti","value":"a"},{"label":"Hádat náhodně","value":"b"},{"label":"Psát esej","value":"c"},{"label":"Kreslit","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 3, 'Zúžit výběr A–D.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'testove-strategie-time-management' AND q.title = 'Kvíz: Testové strategie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Kolik minut rezervy na kontrolu u 100min testu?', 'multiple_choice', '[{"label":"0","value":"a"},{"label":"5–10","value":"b"},{"label":"50","value":"c"},{"label":"100","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 4, 'Krátká kontrola na konci.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'testove-strategie-time-management' AND q.title = 'Kvíz: Testové strategie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Growth mindset u chyb znamená?', 'multiple_choice', '[{"label":"Ignorovat chyby","value":"a"},{"label":"Učit se z analýzy","value":"b"},{"label":"Přestat cvičit","value":"c"},{"label":"Obviňovat test","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 5, 'Chyby = zpětná vazba.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'testove-strategie-time-management' AND q.title = 'Kvíz: Testové strategie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Ústní pohovor na LF — příprava ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'ustni-pohovor-lf-priprava',
  'Ústní pohovor na LF — příprava',
  'Jak projít ústním kolem u fakult s komplexním přijímacím řízením — motivace, etika, aktuální témata.',
  'Struktura pohovoru, odpovědi, neverbální komunikace.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=640&q=80',
  55,
  75,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'ustni-pohovor-lf-priprava');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'struktura-pohovoru', 'Struktura ústního pohovoru na LF', E'## A) Typické části
Představení, motivace, odborné miniotázky, etika.

## B) Komise
Respekt, upřímnost, stručnost.

## C) Délka
Obvykle 10–20 min — připrav si klíčové body.

## D) Dokumenty
Maturita, CV, doporučení dle fakulty.', 1, 18, 'published'
FROM public.courses c
WHERE c.slug = 'ustni-pohovor-lf-priprava'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'struktura-pohovoru');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'motivace-odpovedi', 'Motivace a typické otázky', E'## A) Proč medicína?
Osobní příběh + realita oboru.

## B) Proč tato LF?
Znalost fakulty, programu, města.

## C) Etické dilema
Postup: situace, hodnoty, rozhodnutí, reflexe.

## D) Aktuální témata
Zdravotnictví v ČR, prevence, digitalizace.', 2, 20, 'published'
FROM public.courses c
WHERE c.slug = 'ustni-pohovor-lf-priprava'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'motivace-odpovedi');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'neverbalni-komunikace', 'Neverbální komunikace a stres', E'## A) Oční kontakt, postoj
Otevřená poloha, klidný hlas.

## B) Aktivní naslouchání
Parafráze otázky před odpovědí.

## C) Pauza
Krátké zamyšlení je v pořádku.

## D) Po pohovoru
Poděkování, sebereflexe.', 3, 17, 'published'
FROM public.courses c
WHERE c.slug = 'ustni-pohovor-lf-priprava'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'neverbalni-komunikace');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Ústní pohovor', 70, 'published'
FROM public.courses c
WHERE c.slug = 'ustni-pohovor-lf-priprava'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Ústní pohovor');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Co zdůraznit u otázky ''Proč medicína''?', 'multiple_choice', '[{"label":"Jen plat","value":"a"},{"label":"Autentickou motivaci a znalost reality","value":"b"},{"label":"Nic neříkat","value":"c"},{"label":"Pomluvu konkurence","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Upřímnost a příprava.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ustni-pohovor-lf-priprava' AND q.title = 'Kvíz: Ústní pohovor'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Etické dilema — správný postup?', 'multiple_choice', '[{"label":"Okamžitá odpověď bez úvahy","value":"a"},{"label":"Strukturovaná analýza","value":"b"},{"label":"Odmítnout odpovědět","value":"c"},{"label":"Vtip","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 2, 'Situace → hodnoty → rozhodnutí.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ustni-pohovor-lf-priprava' AND q.title = 'Kvíz: Ústní pohovor'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Proč znát specifika vybrané LF?', 'multiple_choice', '[{"label":"Ukázat zájem","value":"a"},{"label":"Není potřeba","value":"b"},{"label":"Kvůli sportu","value":"c"},{"label":"Jen kvůli jídlu","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 3, 'Komise hodnotí přípravu.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ustni-pohovor-lf-priprava' AND q.title = 'Kvíz: Ústní pohovor'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Krátká pauza před odpovědí?', 'multiple_choice', '[{"label":"Neprofesionální","value":"a"},{"label":"Přijatelné pro rozmyšlení","value":"b"},{"label":"Zákaz","value":"c"},{"label":"Vždy špatné","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 4, 'Lepší než unáhlená chyba.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ustni-pohovor-lf-priprava' AND q.title = 'Kvíz: Ústní pohovor'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Neverbálně důležité?', 'multiple_choice', '[{"label":"Křížené ruce a úkryt","value":"a"},{"label":"Otevřený postoj a kontakt","value":"b"},{"label":"Křik","value":"c"},{"label":"Telefon","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 5, 'Respekt a sebejistota.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ustni-pohovor-lf-priprava' AND q.title = 'Kvíz: Ústní pohovor'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Matematika pro přijímačky medicína ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'matematika-prijimacky-medicina',
  'Matematika pro přijímačky medicína',
  'Procenta, rovnice, funkce a logika často požadované u přijímaček — zejména u fakult s rozšířeným testem.',
  'Algebra, procenta, grafy — praktické úlohy pro LF.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1509228468518-180dd4866904?w=640&q=80',
  70,
  95,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'matematika-prijimacky-medicina');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'procenta-pomer', 'Procenta, poměr a rule of three', E'## A) Procenta
Základ = 100 %, výpočet části a celku.

## B) Poměr
a:b, zjednodušení, přímá úměra.

## C) Trojčlenka
Přímá/ne přímá úměrnost.

## D) Aplikace
Koncentrace roztoků, statistiky.', 1, 24, 'published'
FROM public.courses c
WHERE c.slug = 'matematika-prijimacky-medicina'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'procenta-pomer');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'rovnice-funkce', 'Lineární rovnice a funkce', E'## A) Lineární rovnice
ax + b = 0, úpravy obou stran.

## B) Funkce y = kx + q
Směrnice, průsečík s osami.

## C) Graf
Interpretace sklonu a posunu.

## D) Textové úlohy
Převod slov na rovnici.', 2, 23, 'published'
FROM public.courses c
WHERE c.slug = 'matematika-prijimacky-medicina'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'rovnice-funkce');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'mocniny-odhady', 'Mocniny, odmocniny a odhady', E'## A) Mocniny
Pravidla násobení stejného základu.

## B) Odmocniny
√ a numerické odhady.

## C) Vědecká notace
a × 10ⁿ pro velmi malá/velká čísla.

## D) Logika
Vyloučení nesmyslných odpovědí v testu.', 3, 23, 'published'
FROM public.courses c
WHERE c.slug = 'matematika-prijimacky-medicina'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'mocniny-odhady');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Matematika', 70, 'published'
FROM public.courses c
WHERE c.slug = 'matematika-prijimacky-medicina'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Matematika');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Kolik je 15 % ze 200?', 'multiple_choice', '[{"label":"15","value":"a"},{"label":"30","value":"b"},{"label":"45","value":"c"},{"label":"20","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, '0,15 × 200 = 30.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'matematika-prijimacky-medicina' AND q.title = 'Kvíz: Matematika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Řešení: 2x + 6 = 14', 'multiple_choice', '[{"label":"x=2","value":"a"},{"label":"x=4","value":"b"},{"label":"x=10","value":"c"},{"label":"x=7","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 2, '2x=8 → x=4.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'matematika-prijimacky-medicina' AND q.title = 'Kvíz: Matematika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Směrnice přímky y = 3x − 2?', 'multiple_choice', '[{"label":"−2","value":"a"},{"label":"3","value":"b"},{"label":"2","value":"c"},{"label":"−3","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 3, 'k = 3 v y = kx + q.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'matematika-prijimacky-medicina' AND q.title = 'Kvíz: Matematika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, '√81 = ?', 'multiple_choice', '[{"label":"8","value":"a"},{"label":"9","value":"b"},{"label":"81","value":"c"},{"label":"18","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 4, '9² = 81.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'matematika-prijimacky-medicina' AND q.title = 'Kvíz: Matematika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Přímá úměra — když x dvojnásobně, y?', 'multiple_choice', '[{"label":"Poloviční","value":"a"},{"label":"Dvojnásobné","value":"b"},{"label":"Beze změny","value":"c"},{"label":"Nulové","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 5, 'y = kx.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'matematika-prijimacky-medicina' AND q.title = 'Kvíz: Matematika'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Latinská terminologie v medicíně ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'latinska-terminologie-medicina',
  'Latinská terminologie v medicíně',
  'Základy latiny pro mediky — anatomické názvy, zkratky receptur a orientace v učebnicích.',
  'Předpony, přípony, anatomické termíny, latinské názvy.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1456513087680-859a078765a7?w=640&q=80',
  65,
  85,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'latinska-terminologie-medicina');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'latinske-kořeny', 'Latinské kořeny, prefixy a sufixy', E'## A) Prefixy
hyper-, hypo-, intra-, extra-, sub-, supra-.

## B) Sufixy
-itis (zánět), -oma (nouze), -ectomy (odstranění).

## C) Skládání
Kardio + logy = kardiologie.

## D) Výslovnost
Přibližná latinská výslovnost stačí na začátku.', 1, 22, 'published'
FROM public.courses c
WHERE c.slug = 'latinska-terminologie-medicina'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'latinske-kořeny');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'anatomicke-nazvy', 'Anatomické názvy v latině', E'## A) Bones
Femur, tibia, humerus, scapula.

## B) Směr
Dexter/sinister, cranialis/caudalis.

## C) Orgány
Cor (srdce), pulmo (plíce), hepar ( játra).

## D) Praxe
Překlad CZ ↔ LAT na kartičkách.', 2, 22, 'published'
FROM public.courses c
WHERE c.slug = 'latinska-terminologie-medicina'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'anatomicke-nazvy');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'receptura-zkratky', 'Zkratky v receptuře a dokumentaci', E'## A) Frequenza
b.i.d., t.i.d., q.d. — 2×, 3×, 1× denně.

## B) Cesta podání
p.o., i.v., s.c.

## C) Signa
Sig.: — návod pro pacienta.

## D) Bezpečnost
Neplést podobné zkratky.', 3, 21, 'published'
FROM public.courses c
WHERE c.slug = 'latinska-terminologie-medicina'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'receptura-zkratky');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Latinská terminologie', 70, 'published'
FROM public.courses c
WHERE c.slug = 'latinska-terminologie-medicina'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Latinská terminologie');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Co znamená suffix -itis?', 'multiple_choice', '[{"label":"Nádor","value":"a"},{"label":"Zánět","value":"b"},{"label":"Odstranění","value":"c"},{"label":"Svorky","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Artritis = zánět kloubu.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'latinska-terminologie-medicina' AND q.title = 'Kvíz: Latinská terminologie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Latinsky ''srdce''?', 'multiple_choice', '[{"label":"Pulmo","value":"a"},{"label":"Cor","value":"b"},{"label":"Ren","value":"c"},{"label":"Hepar","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 2, 'Cor = srdce.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'latinska-terminologie-medicina' AND q.title = 'Kvíz: Latinská terminologie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Hyper- znamená?', 'multiple_choice', '[{"label":"Pod","value":"a"},{"label":"Nad/nadbytkem","value":"b"},{"label":"Vnitř","value":"c"},{"label":"Proti","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 3, 'Hypertenze = vysoký tlak.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'latinska-terminologie-medicina' AND q.title = 'Kvíz: Latinská terminologie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'p.o. podání?', 'multiple_choice', '[{"label":"Intravenózní","value":"a"},{"label":"Perorální","value":"b"},{"label":"Subkutánní","value":"c"},{"label":"Inhalace","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 4, 'Per os = ústy.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'latinska-terminologie-medicina' AND q.title = 'Kvíz: Latinská terminologie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Femur je?', 'multiple_choice', '[{"label":"Lopatka","value":"a"},{"label":"Stehenní kost","value":"b"},{"label":"Loketní","value":"c"},{"label":"Páteř","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 5, 'Nejdelší kost těla.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'latinska-terminologie-medicina' AND q.title = 'Kvíz: Latinská terminologie'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Etika a motivační dopis ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'etika-motivacni-dopis',
  'Etika a motivační dopis',
  'Etické principy v medicíně a jak napsat motivační dopis / osobní prohlášení pro přihlášku na LF.',
  'Autonomie, beneficence, non-maleficence, justice + struktura dopisu.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=640&q=80',
  50,
  70,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'etika-motivacni-dopis');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'eticke-principy', 'Základní etické principy medicíny', E'## A) Autonomie
Respekt k rozhodnutí pacienta, informovaný souhlas.

## B) Beneficence
Konat ve prospěch pacienta.

## C) Non-maleficence
Primum non nocere — neublížit.

## D) Spravedlnost
Rovný přístup ke zdravotní péči.', 1, 18, 'published'
FROM public.courses c
WHERE c.slug = 'etika-motivacni-dopis'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'eticke-principy');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'motivacni-dopis', 'Struktura motivačního dopisu', E'## A) Úvod
Proč medicína, proč nyní.

## B) Tělo
Zkušenosti (DN, dobrovolnictví), dovednosti.

## C) Vazba na LF
Konkrétní program, hodnoty fakulty.

## D) Závěr
Vize, poděkování, stručnost (1–2 strany).', 2, 17, 'published'
FROM public.courses c
WHERE c.slug = 'etika-motivacni-dopis'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'motivacni-dopis');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'priklady-dilemat', 'Příklady etických dilemat pro uchazeče', E'## A) Důvěrnost vs bezpečí
Kdy porušit mlčenlivost?

## B) Alokace
Omezené zdroje — kdo první?

## C) Konflikt zájmů
Sponzorství, farmaceutický tlak.

## D) Reflexe
Ne jedna správná odpověď — proces.', 3, 15, 'published'
FROM public.courses c
WHERE c.slug = 'etika-motivacni-dopis'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'priklady-dilemat');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Etika a motivace', 70, 'published'
FROM public.courses c
WHERE c.slug = 'etika-motivacni-dopis'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Etika a motivace');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Primum non nocere znamená?', 'multiple_choice', '[{"label":"Léčit za každou cenu","value":"a"},{"label":"Nejdřív neublížit","value":"b"},{"label":"Ignorovat pacienta","value":"c"},{"label":"Prodat lék","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Non-maleficence.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'etika-motivacni-dopis' AND q.title = 'Kvíz: Etika a motivace'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Informovaný souhlas souvisí s?', 'multiple_choice', '[{"label":"Autonomií","value":"a"},{"label":"Chirurgií","value":"b"},{"label":"Marketingem","value":"c"},{"label":"Sportem","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 2, 'Pacient rozhoduje na základě informací.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'etika-motivacni-dopis' AND q.title = 'Kvíz: Etika a motivace'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Motivační dopis má být?', 'multiple_choice', '[{"label":"Deset stran bez struktury","value":"a"},{"label":"Stručný a autentický","value":"b"},{"label":"Opsaný z internetu","value":"c"},{"label":"Bez vazby na LF","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 3, '1–2 strany, konkrétní motivace.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'etika-motivacni-dopis' AND q.title = 'Kvíz: Etika a motivace'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Beneficence = ?', 'multiple_choice', '[{"label":"Konat ve prospěch pacienta","value":"a"},{"label":"Škodit","value":"b"},{"label":"Mlčet","value":"c"},{"label":"Útěk","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 4, 'Prospěch pacienta.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'etika-motivacni-dopis' AND q.title = 'Kvíz: Etika a motivace'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Etické dilema v pohovoru?', 'multiple_choice', '[{"label":"Hledat perfektní odpověď","value":"a"},{"label":"Ukázat uvažování","value":"b"},{"label":"Mlčet","value":"c"},{"label":"Vtipkovat","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 5, 'Proces je důležitější než dogma.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'etika-motivacni-dopis' AND q.title = 'Kvíz: Etika a motivace'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Rozhodovací strom: která LF? ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'ktera-lf-rozhodovaci-strom',
  'Rozhodovací strom: která LF?',
  'Bonus kurz — jak vybrat mezi 8 českými LF podle města, formátu přijímaček, kapacity a osobních preferencí.',
  'Praktický rozhodovací rámec pro výběr fakulty.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=640&q=80',
  45,
  60,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'ktera-lf-rozhodovaci-strom');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'kriteria-vyberu', 'Kritéria výběru fakulty', E'## A) Město a náklady
Ubytování, doprava, rodina.

## B) Formát přijímaček
Cermat vs vlastní test vs komplexní.

## C) Kapacity a úspěšnost
Statistiky dle MSMT/SÚRA.

## D) Program
Anglická parallel, interdisciplinarita.', 1, 15, 'published'
FROM public.courses c
WHERE c.slug = 'ktera-lf-rozhodovaci-strom'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'kriteria-vyberu');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'porovnani-lf', 'Porovnání českých LF — přehled', E'## A) Praha
1. LF UK, 2. LF UK, 3. LF UK — různé tradice.

## B) Brno
LF MU — silná věda.

## C) Ostatní
Plzeň, Hradec, Olomouc, Ostrava.

## D) Ověření
Vždy aktuální web fakulty.', 2, 15, 'published'
FROM public.courses c
WHERE c.slug = 'ktera-lf-rozhodovaci-strom'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'porovnani-lf');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'rozhodovaci-matice', 'Rozhodovací matice a plán B', E'## A) Váhy kritérií
Seřadit priority (0–5).

## B) Matice
Skóre fakult × kritéria.

## C) Plán B
Alternativní obory, příprava na další rok.

## D) Termíny
Kalendář přihlášek.', 3, 15, 'published'
FROM public.courses c
WHERE c.slug = 'ktera-lf-rozhodovaci-strom'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'rozhodovaci-matice');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Výběr LF', 70, 'published'
FROM public.courses c
WHERE c.slug = 'ktera-lf-rozhodovaci-strom'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Výběr LF');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Co vždy ověřit jako první?', 'multiple_choice', '[{"label":"Instagram influencer","value":"a"},{"label":"Oficiální web LF","value":"b"},{"label":"Fórum bez zdroje","value":"c"},{"label":"Starý blog","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Termíny a podmínky se mění.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ktera-lf-rozhodovaci-strom' AND q.title = 'Kvíz: Výběr LF'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Rozhodovací matice pomáhá?', 'multiple_choice', '[{"label":"Strukturovat preference","value":"a"},{"label":"Vyhrát loterii","value":"b"},{"label":"Nahradit maturitu","value":"c"},{"label":"Vyhnout se učení","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 2, 'Objektivizace výběru.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ktera-lf-rozhodovaci-strom' AND q.title = 'Kvíz: Výběr LF'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Plán B znamená?', 'multiple_choice', '[{"label":"Alternativu při neúspěchu","value":"a"},{"label":"Ignorovat přípravu","value":"b"},{"label":"Podvod","value":"c"},{"label":"Nic","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 3, 'Realistická záloha.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ktera-lf-rozhodovaci-strom' AND q.title = 'Kvíz: Výběr LF'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Kapacita fakulty ovlivňuje?', 'multiple_choice', '[{"label":"Počet přijatých","value":"a"},{"label":"Barvu uniforem","value":"b"},{"label":"Počasí","value":"c"},{"label":"Jazyk planet","value":"d"}]'::jsonb, '{"value":"a"}'::jsonb, 4, 'Statistika přijetí.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ktera-lf-rozhodovaci-strom' AND q.title = 'Kvíz: Výběr LF'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Kolik LF medicíny v ČR (tradiční)?', 'multiple_choice', '[{"label":"5","value":"a"},{"label":"8","value":"b"},{"label":"12","value":"c"},{"label":"3","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 5, 'Osm lékařských fakult.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'ktera-lf-rozhodovaci-strom' AND q.title = 'Kvíz: Výběr LF'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);


-- ─── Opakování — mixed test přijímačky ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  'opakovani-mixed-test-prijimacky',
  'Opakování — mixed test přijímačky',
  'Bonus kurz — komplexní opakování biologie, chemie, fyziky a logiky v mixed formátu jako u reálných přijímaček.',
  'Mixed test simulace — finální příprava před zkouškou.',
  'published',
  'priprava',
  'prijimacky',
  'https://images.unsplash.com/photo-1606761568499-6d2451b23be8?w=640&q=80',
  100,
  130,
  true,
  '{"audience":"prijimacky","prep_course":true,"is_free":true,"level_label":"příprava"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'opakovani-mixed-test-prijimacky');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'bio-chem-mix', 'Mixed blok: biologie + chemie', E'## A) Buňka + organika
Organela ↔ funkce, alkany/alkeny.

## B) Genetika + reakce
Křížení + oxidace alkoholů.

## C) Fyziologie + kyseliny
Krev + karboxylové skupiny.

## D) Čas
45 min blok — simulace.', 1, 35, 'published'
FROM public.courses c
WHERE c.slug = 'opakovani-mixed-test-prijimacky'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'bio-chem-mix');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'fyzika-matematika-mix', 'Mixed blok: fyzika + matematika', E'## A) Mechanika
Pohyb, síly, energie.

## B) Elektřina
Ohm, sériové zapojení.

## C) Matematika
Procenta, rovnice, grafy.

## D) Propojení
Koncentrace % v chemii + výpočty.', 2, 35, 'published'
FROM public.courses c
WHERE c.slug = 'opakovani-mixed-test-prijimacky'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'fyzika-matematika-mix');

INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, 'finalni-simulace', 'Finální simulace a checklist', E'## A) Full test
100 min dle vzoru fakulty.

## B) Checklist
Doklady, propustka, pero, voda.

## C) Po testu
Analýza chyb podle témat.

## D) Den D
Spánek, snídaně, klid.', 3, 30, 'published'
FROM public.courses c
WHERE c.slug = 'opakovani-mixed-test-prijimacky'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = 'finalni-simulace');

INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, 'Kvíz: Mixed test', 70, 'published'
FROM public.courses c
WHERE c.slug = 'opakovani-mixed-test-prijimacky'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = 'Kvíz: Mixed test');

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Mitochondrie — hlavní funkce?', 'multiple_choice', '[{"label":"Fotosyntéza","value":"a"},{"label":"ATP","value":"b"},{"label":"Trávení","value":"c"},{"label":"Exkrece","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 1, 'Buněčné dýchání.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'opakovani-mixed-test-prijimacky' AND q.title = 'Kvíz: Mixed test'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 1);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Obecný vzorec alkanu?', 'multiple_choice', '[{"label":"CₙH₂ₙ","value":"a"},{"label":"CₙH₂ₙ₊₂","value":"b"},{"label":"CₙH₂ₙO","value":"c"},{"label":"CₙH₂ₙ₋₂","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 2, 'Nasycený uhlíkovodík.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'opakovani-mixed-test-prijimacky' AND q.title = 'Kvíz: Mixed test'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 2);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'F = m·a — který zákon?', 'multiple_choice', '[{"label":"1.","value":"a"},{"label":"2.","value":"b"},{"label":"3.","value":"c"},{"label":"0.","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 3, 'Newtonův druhý.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'opakovani-mixed-test-prijimacky' AND q.title = 'Kvíz: Mixed test'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 3);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, '20 % z 150?', 'multiple_choice', '[{"label":"20","value":"a"},{"label":"30","value":"b"},{"label":"25","value":"c"},{"label":"35","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 4, '0,2 × 150 = 30.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'opakovani-mixed-test-prijimacky' AND q.title = 'Kvíz: Mixed test'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 4);

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, 'Před testem nejdůležitější?', 'multiple_choice', '[{"label":"Vypít litr kávy v noci","value":"a"},{"label":"Spánek a klid","value":"b"},{"label":"Učit se celou noc","value":"c"},{"label":"Ignorovat zadání","value":"d"}]'::jsonb, '{"value":"b"}'::jsonb, 5, 'Regenerace a soustředění.'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'opakovani-mixed-test-prijimacky' AND q.title = 'Kvíz: Mixed test'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = 5);

COMMENT ON TABLE public.courses IS 'MedScope Academy — includes prijimacky prep courses (12)';

