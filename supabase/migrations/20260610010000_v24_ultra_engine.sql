-- v24.0 ULTRA-MAX autonomous content engine

CREATE TABLE IF NOT EXISTS v24_cron_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cron_id text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  metrics jsonb,
  error text,
  started_at timestamptz,
  finished_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v24_cron_runs_cron_id ON v24_cron_runs (cron_id, created_at DESC);

CREATE TABLE IF NOT EXISTS v24_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  locale text NOT NULL DEFAULT 'cs',
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS v24_topic_map (
  topic_hash text PRIMARY KEY,
  section text NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);
