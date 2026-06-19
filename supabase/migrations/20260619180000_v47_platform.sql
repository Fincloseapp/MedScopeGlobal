-- v47 platform expansion tables
CREATE TABLE IF NOT EXISTS v47_translation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_locale text,
  target_locale text NOT NULL,
  input_text text NOT NULL,
  output_text text,
  provider text DEFAULT 'groq',
  model text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS v47_content_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  input_json jsonb NOT NULL DEFAULT '{}',
  output_json jsonb,
  provider text DEFAULT 'groq',
  model text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v47_translation_jobs_target ON v47_translation_jobs (target_locale);
CREATE INDEX IF NOT EXISTS idx_v47_content_generations_kind ON v47_content_generations (kind);

ALTER TABLE v47_translation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE v47_content_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS v47_translation_jobs_service ON v47_translation_jobs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS v47_content_generations_service ON v47_content_generations
  FOR ALL USING (auth.role() = 'service_role');
