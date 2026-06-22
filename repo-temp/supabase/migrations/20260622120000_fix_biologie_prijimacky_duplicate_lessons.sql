-- Fix duplicate mitóza/meióza lessons in biologie-prijimacky-bunka-genetika
-- Root cause: diacritic slug bunkove-delení coexisting with ASCII bunkove-deleni after slug migration,
-- or duplicate inserts with overlapping cell-division content.

-- Remove duplicate cell-division lessons (keep canonical bunkove-deleni if present)
WITH bio AS (
  SELECT id FROM public.courses WHERE slug = 'biologie-prijimacky-bunka-genetika'
),
cell_division AS (
  SELECT
    l.id,
    ROW_NUMBER() OVER (
      ORDER BY
        CASE
          WHEN l.slug = 'bunkove-deleni' THEN 0
          WHEN l.slug = 'bunkove-delení' THEN 1
          WHEN l.slug = 'mitoza' THEN 2
          WHEN l.slug = 'meioza' THEN 3
          ELSE 4
        END,
        l.sort_order ASC,
        l.created_at ASC
    ) AS rn
  FROM public.lessons l
  JOIN bio b ON l.course_id = b.id
  WHERE l.slug IN ('bunkove-delení', 'bunkove-deleni', 'mitoza', 'meioza')
     OR l.title ILIKE '%mitóza%a%meióza%'
     OR l.title ILIKE '%Buněčné dělení%'
)
DELETE FROM public.lessons
WHERE id IN (SELECT id FROM cell_division WHERE rn > 1);

-- Ensure single combined cell-division lesson (sort 2) with ASCII slug
INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT
  c.id,
  'bunkove-deleni',
  'Buněčné dělení — mitóza a meióza',
  E'## A) Mitóza
Zachovává počet chromozomů (2n→2n). Fáze: profáze, metafáze, anafáze, telofáze. Výsledek: dvě identické dcery.

## B) Meióza
Snižuje počet chromozomů (2n→n). Meióza I (křížení) a II. Vytváří 4 haploidní gamety.

## C) Srovnání
Mitóza = růst, oprava; meióza = pohlavní rozmnožování, variabilita.

## D) Cermat tip
Znalost pořadí fází a změn počtu chromozomů v jednotlivých fázích.',
  2,
  30,
  'published'
FROM public.courses c
WHERE c.slug = 'biologie-prijimacky-bunka-genetika'
  AND NOT EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.course_id = c.id
      AND l.slug IN ('bunkove-deleni', 'bunkove-delení', 'mitoza', 'meioza')
  );

-- Normalize sort order: bunka-struktura (1), bunkove-deleni (2), genetika-mendel (3)
UPDATE public.lessons l
SET sort_order = v.new_order, updated_at = now()
FROM public.courses c
JOIN (VALUES
  ('bunka-struktura', 1),
  ('bunkove-deleni', 2),
  ('bunkove-delení', 2),
  ('genetika-mendel', 3)
) AS v(slug, new_order) ON true
WHERE l.course_id = c.id
  AND c.slug = 'biologie-prijimacky-bunka-genetika'
  AND l.slug = v.slug;

-- Final slug normalization (diacritics → ASCII)
UPDATE public.lessons l
SET slug = 'bunkove-deleni', updated_at = now()
FROM public.courses c
WHERE l.course_id = c.id
  AND c.slug = 'biologie-prijimacky-bunka-genetika'
  AND l.slug = 'bunkove-delení';
