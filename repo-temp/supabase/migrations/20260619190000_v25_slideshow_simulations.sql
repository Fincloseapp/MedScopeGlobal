-- v25: simulation results + slideshow video metadata
CREATE TABLE IF NOT EXISTS simulation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id uuid NOT NULL,
  action text,
  score_delta int DEFAULT 0,
  xp_earned int DEFAULT 0,
  result_json jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS v25_slide_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid,
  topic text NOT NULL,
  manifest_url text,
  video_url text,
  video_mode text DEFAULT 'slides_overlay',
  provider text DEFAULT 'groq',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulation_results_user ON simulation_results (user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_sim ON simulation_results (simulation_id);
CREATE INDEX IF NOT EXISTS idx_v25_slide_videos_lesson ON v25_slide_videos (lesson_id);

ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE v25_slide_videos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY simulation_results_own ON simulation_results
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY v25_slide_videos_read ON v25_slide_videos
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
