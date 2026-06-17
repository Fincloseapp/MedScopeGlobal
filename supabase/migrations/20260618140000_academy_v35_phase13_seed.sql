-- MedScope Academy v35 Phase 13 — simulations seed, textbook chapters, ai_scenarios

-- ─── Clinical simulation: chest pain triage ─────────────────────────────────
INSERT INTO public.clinical_simulations (title, slug, scenario_json, difficulty, status)
SELECT
  'Bolest na hrudi — urgentní triáž',
  'bolest-hrudi-triaz',
  jsonb_build_object(
    'introduction', 'Muž 58 let, náhlá bolest na hrudi vyzařující do levé paže. EKG: ST elevace V2–V4.',
    'start_id', 'start',
    'max_score', 100,
    'nodes', jsonb_build_object(
      'start', jsonb_build_object(
        'id', 'start',
        'context', 'Urgentní příjem',
        'prompt', 'Jaký je váš první krok?',
        'choices', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Okamžitě aktivovat kardiologický kód / STEMI protokol', 'next', 'stemi', 'score', 40, 'feedback', 'Správně — čas do reperfuze je kritický.'),
          jsonb_build_object('id', 'b', 'label', 'Podat analgetikum a čekat na další EKG za hodinu', 'next', 'wait', 'score', 0, 'feedback', 'Zpoždění reperfuze zvyšuje mortalitu.')
        )
      ),
      'stemi', jsonb_build_object(
        'id', 'stemi',
        'prompt', 'Pacient je stabilní. Co dál?',
        'choices', jsonb_build_array(
          jsonb_build_object('id', 'c', 'label', 'Dvojitá antiagregace + urgentní koronární angiografie', 'terminal', true, 'score', 60, 'feedback', 'Optimální postup dle guidelines.'),
          jsonb_build_object('id', 'd', 'label', 'Pouze heparin a propuštění domů', 'terminal', true, 'score', 10, 'feedback', 'Nevhodné u STEMI.')
        )
      ),
      'wait', jsonb_build_object(
        'id', 'wait',
        'prompt', 'Po hodině čekání pacient kolabuje. Jak hodnotíte své rozhodnutí?',
        'choices', jsonb_build_array(
          jsonb_build_object('id', 'e', 'label', 'Uznám chybu v triáži', 'terminal', true, 'score', 20, 'feedback', 'Reflexe je důležitá — v praxi by šlo o kritickou chybu.')
        )
      )
    )
  ),
  'intermediate',
  'published'
WHERE NOT EXISTS (SELECT 1 FROM public.clinical_simulations WHERE slug = 'bolest-hrudi-triaz');

-- ─── Clinical simulation: pediatric fever ───────────────────────────────────
INSERT INTO public.clinical_simulations (title, slug, scenario_json, difficulty, status)
SELECT
  'Dítě s horečkou — pediatrická triáž',
  'dite-horecka-triaz',
  jsonb_build_object(
    'introduction', 'Dívka 3 roky, horečka 39,5 °C, petechie na trupu, letargie.',
    'start_id', 'start',
    'max_score', 100,
    'nodes', jsonb_build_object(
      'start', jsonb_build_object(
        'id', 'start',
        'context', 'Dětská ambulance',
        'prompt', 'Jak postupujete?',
        'choices', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Okamžité vyšetření a zvážení meningokokové sepse', 'next', 'sepsa', 'score', 45, 'feedback', 'Petechie + horečka = red flag.'),
          jsonb_build_object('id', 'b', 'label', 'Paracetamol a domů s kontrolou za 3 dny', 'terminal', true, 'score', 0, 'feedback', 'Riziko fulminantní sepse.')
        )
      ),
      'sepsa', jsonb_build_object(
        'id', 'sepsa',
        'prompt', 'Krevní kultury odebrány, hemodynamika nestabilní.',
        'choices', jsonb_build_array(
          jsonb_build_object('id', 'c', 'label', 'Empirická ATB + tekutiny + hospitalizace na JIP', 'terminal', true, 'score', 55, 'feedback', 'Správný urgentní postup.'),
          jsonb_build_object('id', 'd', 'label', 'Čekat na výsledky kultivací bez ATB', 'terminal', true, 'score', 5, 'feedback', 'U suspektní sepse nelze čekat.')
        )
      )
    )
  ),
  'beginner',
  'published'
WHERE NOT EXISTS (SELECT 1 FROM public.clinical_simulations WHERE slug = 'dite-horecka-triaz');

-- ─── Update existing triage simulation with decision tree ───────────────────
UPDATE public.clinical_simulations
SET scenario_json = jsonb_build_object(
  'introduction', 'Žena 34 let, kolikovitá bolest v pravém podbřišku, nauzea, teplota 37,8 °C.',
  'start_id', 'start',
  'max_score', 100,
  'nodes', jsonb_build_object(
    'start', jsonb_build_object(
      'id', 'start',
      'context', 'Akutní břicho',
      'prompt', 'První krok vyšetření?',
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Anamnéza, palpační vyšetření, CRP, USG břicha', 'next', 'usg', 'score', 35, 'feedback', 'Základní triáž akutního břicha.'),
        jsonb_build_object('id', 'b', 'label', 'Pouze analgetikum bez vyšetření', 'terminal', true, 'score', 0, 'feedback', 'Bez vyšetření hrozí přehlédnutí apendicitidy.')
      )
    ),
    'usg', jsonb_build_object(
      'id', 'usg',
      'prompt', 'USG: ztluštěná slepá střeva, McBurney +. Diagnóza?',
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'c', 'label', 'Akutní apendicitida — chirurgická konzultace', 'terminal', true, 'score', 65, 'feedback', 'Správná diagnóza a další krok.'),
        jsonb_build_object('id', 'd', 'label', 'Gastroenteritida — propuštění', 'terminal', true, 'score', 10, 'feedback', 'Riziko perforace.')
      )
    )
  )
)
WHERE slug = 'akutni-bricho-triaz';

-- ─── AI scenario seeds ──────────────────────────────────────────────────────
INSERT INTO public.ai_scenarios (title, slug, prompt_template, status, metadata)
SELECT
  'Hypertenzní krize',
  'hypertenzni-krize',
  'Simulujte postup u pacienta s hypertenzní krizí a poruchou vědomí.',
  'published',
  '{"category":"kardiologie","difficulty":"advanced"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.ai_scenarios WHERE slug = 'hypertenzni-krize');

INSERT INTO public.ai_scenarios (title, slug, prompt_template, status, metadata)
SELECT
  'Diabetická ketoacidóza',
  'dka-scenario',
  'Vyšetřete a navrhněte léčbu u mladého pacienta s DKA.',
  'published',
  '{"category":"endokrinologie","difficulty":"intermediate"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.ai_scenarios WHERE slug = 'dka-scenario');

-- ─── Textbook chapters with European medical imagery ────────────────────────
UPDATE public.textbooks
SET metadata = jsonb_build_object(
  'chapters', jsonb_build_array(
    jsonb_build_object(
      'slug', 'uvod',
      'title', 'Úvod do anatomie',
      'image_url', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=960&q=80',
      'content_json', jsonb_build_object(
        'type', 'doc',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'heading', 'attrs', jsonb_build_object('level', 2), 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Proč studovat anatomii?'))),
          jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Anatomie je základ klinické medicíny. Porozumění struktuře těla umožňuje správnou interpretaci vyšetření a bezpečné výkony.'))),
          jsonb_build_object('type', 'bulletList', 'content', jsonb_build_array(
            jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Orientace v topografii'))))),
            jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Korelace s radiologickými nálezy')))))
          ))
        )
      )
    ),
    jsonb_build_object(
      'slug', 'kostra',
      'title', 'Kosterní systém',
      'image_url', 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=960&q=80',
      'content_json', jsonb_build_object(
        'type', 'doc',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'heading', 'attrs', jsonb_build_object('level', 2), 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Kostra'))),
          jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Dospělý člověk má 206 kostí. Páteř chrání míchu a umožňuje pohyb.'))),
          jsonb_build_object('type', 'blockquote', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Klinický tip: Palpační bolest v bederní krajině může indikovat frakturu obratle.')))))
        )
      )
    ),
    jsonb_build_object(
      'slug', 'svaly',
      'title', 'Svalový systém',
      'image_url', 'https://images.unsplash.com/photo-1559757175-5700cde872bc?w=960&q=80',
      'content_json', jsonb_build_object(
        'type', 'doc',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'heading', 'attrs', jsonb_build_object('level', 2), 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Svaly a pohyb'))),
          jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Kosterní svaly umožňují aktivní pohyb. Porozumění origo a úponům je klíčové pro fyzikální vyšetření.')))
        )
      )
    )
  )
)
WHERE slug = 'anatomie-zaklady';

COMMENT ON TABLE public.clinical_simulations IS 'MedScope Academy v35 Phase 13 — decision-tree simulations';
