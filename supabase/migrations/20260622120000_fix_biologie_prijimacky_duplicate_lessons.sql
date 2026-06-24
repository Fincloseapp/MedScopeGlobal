-- Idempotent fix: remove duplicate mitóza/meióza lesson in Biologie přijímačky course
-- Keeps the earliest lesson by sort_order; audit item #10 (Agent 5 / Lucie)

DO $$
DECLARE
  course_slug text := 'biologie-prijimacky-bunka-genetika';
  dup_title text := 'Buněčné dělení — mitóza a meióza';
  keep_id uuid;
BEGIN
  SELECT l.id INTO keep_id
  FROM academy_lessons l
  JOIN academy_courses c ON c.id = l.course_id
  WHERE c.slug = course_slug
    AND l.title = dup_title
  ORDER BY l.sort_order ASC NULLS LAST, l.created_at ASC
  LIMIT 1;

  IF keep_id IS NOT NULL THEN
    DELETE FROM academy_lessons l
    USING academy_courses c
    WHERE l.course_id = c.id
      AND c.slug = course_slug
      AND l.title = dup_title
      AND l.id <> keep_id;
  END IF;
END $$;
