-- MedScopeGlobal — medical categories & rubrics (run after migrations)

insert into public.rubrics (slug, name) values
  ('ai-study-summary', 'AI shrnutí studií'),
  ('ai-guideline-summary', 'AI shrnutí guidelines'),
  ('ai-textbook-summary', 'AI shrnutí učebnic'),
  ('ai-diagnostic-algorithm', 'AI diagnostické algoritmy'),
  ('ai-treatment-recommendation', 'AI léčebná doporučení'),
  ('ai-case-study', 'AI kazuistiky'),
  ('ai-quiz', 'AI testové otázky'),
  ('ai-mini-quiz', 'AI mini-kvízy'),
  ('ai-checklist', 'AI klinické checklisty'),
  ('ai-step-by-step', 'AI postupy krok za krokem'),
  ('ai-differential', 'AI diferenciální diagnostika'),
  ('ai-treatment-plan', 'AI léčebné plány'),
  ('ai-patient-education', 'AI edukace pro pacienty')
on conflict (slug) do nothing;

insert into public.categories (name, slug, description) values
  ('Všeobecné lékařství', 'general-practice', 'General practice and primary care'),
  ('Interna', 'internal-medicine', 'Internal medicine'),
  ('Kardiologie', 'cardiology', 'Cardiology'),
  ('Endokrinologie / Diabetologie', 'endocrinology', 'Endocrinology and diabetology'),
  ('Revmatologie', 'rheumatology', 'Rheumatology'),
  ('Onkologie', 'oncology', 'Oncology'),
  ('Neurologie', 'neurology', 'Neurology'),
  ('Pneumologie', 'pulmonology', 'Pulmonology'),
  ('Dermatologie', 'dermatology', 'Dermatology'),
  ('Gastroenterologie', 'gastroenterology', 'Gastroenterology'),
  ('Infekční medicína', 'infectious-disease', 'Infectious disease'),
  ('Psychiatrie', 'psychiatry', 'Psychiatry'),
  ('Alergologie / Imunologie', 'allergy-immunology', 'Allergy and immunology'),
  ('Ortopedie', 'orthopedics', 'Orthopedics'),
  ('Chirurgie', 'surgery', 'Surgery'),
  ('Pediatrie', 'pediatrics', 'Pediatrics'),
  ('Urgentní medicína', 'emergency-medicine', 'Emergency medicine'),
  ('Studium medicíny', 'medical-education', 'Medical education'),
  ('Mladí lékaři / rezidenti', 'residents', 'Residents and junior doctors'),
  ('Oční lékařství', 'ophthalmology', 'Ophthalmology'),
  ('Glaukom', 'glaucoma', 'Glaucoma'),
  ('Katarakta', 'cataract', 'Cataract'),
  ('Makulární degenerace', 'macular-degeneration', 'Macular degeneration'),
  ('Diabetická retinopatie', 'diabetic-retinopathy', 'Diabetic retinopathy'),
  ('Refrakční vady', 'refractive-disorders', 'Refractive disorders'),
  ('Oční chirurgie', 'ocular-surgery', 'Ocular surgery'),
  ('Oční farmakologie', 'ocular-pharmacology', 'Ocular pharmacology')
on conflict (slug) do nothing;
