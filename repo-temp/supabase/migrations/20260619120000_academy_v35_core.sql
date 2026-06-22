-- MedScope Academy v35.0 — Phase 1 core tables
-- Block 2: courses, lessons, quizzes, AI pipeline, gamification, marketplace

CREATE OR REPLACE FUNCTION public.academy_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Core learning ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  level TEXT NOT NULL DEFAULT 'beginner'
    CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  cover_image_url TEXT,
  duration_minutes INT NOT NULL DEFAULT 0,
  xp_reward INT NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_public ON public.courses(is_public, status);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  content_json JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 0,
  video_asset_id UUID,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INT NOT NULL DEFAULT 70,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON public.quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON public.quizzes(status);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice'
    CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);

-- ─── AI pipeline ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  payload JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  priority INT NOT NULL DEFAULT 0,
  error_message TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON public.ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_type ON public.ai_tasks(task_type);

CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.ai_tasks(id) ON DELETE SET NULL,
  worker TEXT NOT NULL DEFAULT 'unknown',
  level TEXT NOT NULL DEFAULT 'info'
    CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_task ON public.ai_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON public.ai_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS public.ai_expert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.ai_tasks(id) ON DELETE CASCADE,
  expert_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'revision')),
  feedback TEXT,
  score NUMERIC(4,2),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_expert_reviews_task ON public.ai_expert_reviews(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_expert_reviews_status ON public.ai_expert_reviews(status);

-- ─── Gamification ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  points INT NOT NULL DEFAULT 0,
  source_type TEXT,
  source_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user ON public.xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created ON public.xp_events(created_at DESC);

CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INT NOT NULL DEFAULT 0,
  rank INT,
  period TEXT NOT NULL DEFAULT 'all_time'
    CHECK (period IN ('weekly', 'monthly', 'all_time')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, period)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_period_xp ON public.leaderboard(period, total_xp DESC);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  quiz_score INT,
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course ON public.user_progress(course_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_course_lesson
  ON public.user_progress (
    user_id,
    course_id,
    COALESCE(lesson_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON public.certificates(course_id);

-- ─── Marketplace & mentoring ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  price_czk INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'listed', 'sold_out', 'archived')),
  listing_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_courses_course ON public.marketplace_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_courses_status ON public.marketplace_courses(status);

CREATE TABLE IF NOT EXISTS public.mentoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mentee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_mentee ON public.mentoring_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_status ON public.mentoring_sessions(status);

-- ─── Content assets ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.video_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  storage_path TEXT,
  duration_seconds INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_assets_status ON public.video_assets(status);

ALTER TABLE public.lessons
  DROP CONSTRAINT IF EXISTS lessons_video_asset_id_fkey;
ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_video_asset_id_fkey
  FOREIGN KEY (video_asset_id) REFERENCES public.video_assets(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.clinical_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  scenario_json JSONB NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'intermediate',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_simulations_slug ON public.clinical_simulations(slug);
CREATE INDEX IF NOT EXISTS idx_clinical_simulations_status ON public.clinical_simulations(status);

CREATE TABLE IF NOT EXISTS public.textbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content_ref TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_textbooks_slug ON public.textbooks(slug);
CREATE INDEX IF NOT EXISTS idx_textbooks_status ON public.textbooks(status);

-- ─── Extended modules (Phase 1 schema, Phase 2+ features) ────────────────────

CREATE TABLE IF NOT EXISTS public.system_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle', 'running', 'passed', 'failed')),
  last_run_at TIMESTAMPTZ,
  result JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  game_type TEXT NOT NULL DEFAULT 'quiz_race',
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_games_slug ON public.study_games(slug);

CREATE TABLE IF NOT EXISTS public.ai_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  prompt_template TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_scenarios_slug ON public.ai_scenarios(slug);

CREATE TABLE IF NOT EXISTS public.marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_events_status ON public.marketing_events(status);
CREATE INDEX IF NOT EXISTS idx_marketing_events_scheduled ON public.marketing_events(scheduled_at);

-- ─── updated_at triggers ─────────────────────────────────────────────────────

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'courses', 'lessons', 'quizzes', 'quiz_questions',
    'ai_tasks', 'ai_expert_reviews',
    'leaderboard', 'user_progress',
    'marketplace_courses', 'mentoring_sessions',
    'video_assets', 'clinical_simulations', 'textbooks',
    'system_tests', 'study_games', 'ai_scenarios', 'marketing_events'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.academy_set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;

-- Courses: public read published, admin full
DROP POLICY IF EXISTS courses_public_read ON public.courses;
CREATE POLICY courses_public_read ON public.courses
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND is_public = true);

DROP POLICY IF EXISTS courses_admin ON public.courses;
CREATE POLICY courses_admin ON public.courses
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Lessons / quizzes: read when parent course is public published
DROP POLICY IF EXISTS lessons_public_read ON public.lessons;
CREATE POLICY lessons_public_read ON public.lessons
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id
        AND c.status = 'published' AND c.is_public = true
    )
  );

DROP POLICY IF EXISTS lessons_admin ON public.lessons;
CREATE POLICY lessons_admin ON public.lessons
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS quizzes_public_read ON public.quizzes;
CREATE POLICY quizzes_public_read ON public.quizzes
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND (
      (course_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = quizzes.course_id AND c.status = 'published' AND c.is_public = true
      ))
      OR (lesson_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.courses c ON c.id = l.course_id
        WHERE l.id = quizzes.lesson_id AND l.status = 'published'
          AND c.status = 'published' AND c.is_public = true
      ))
    )
  );

DROP POLICY IF EXISTS quizzes_admin ON public.quizzes;
CREATE POLICY quizzes_admin ON public.quizzes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS quiz_questions_public_read ON public.quiz_questions;
CREATE POLICY quiz_questions_public_read ON public.quiz_questions
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_questions.quiz_id AND q.status = 'published'
    )
  );

DROP POLICY IF EXISTS quiz_questions_admin ON public.quiz_questions;
CREATE POLICY quiz_questions_admin ON public.quiz_questions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- User progress: own rows read/write
DROP POLICY IF EXISTS user_progress_own ON public.user_progress;
CREATE POLICY user_progress_own ON public.user_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_progress_admin ON public.user_progress;
CREATE POLICY user_progress_admin ON public.user_progress
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- XP / certificates / leaderboard: read own + public leaderboard
DROP POLICY IF EXISTS xp_events_own ON public.xp_events;
CREATE POLICY xp_events_own ON public.xp_events
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS xp_events_admin ON public.xp_events;
CREATE POLICY xp_events_admin ON public.xp_events
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS certificates_own ON public.certificates;
CREATE POLICY certificates_own ON public.certificates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS certificates_admin ON public.certificates;
CREATE POLICY certificates_admin ON public.certificates
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS leaderboard_public_read ON public.leaderboard;
CREATE POLICY leaderboard_public_read ON public.leaderboard
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS leaderboard_admin ON public.leaderboard;
CREATE POLICY leaderboard_admin ON public.leaderboard
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- AI tables: admin only (API uses service role)
DROP POLICY IF EXISTS ai_tasks_admin ON public.ai_tasks;
CREATE POLICY ai_tasks_admin ON public.ai_tasks
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS ai_logs_admin ON public.ai_logs;
CREATE POLICY ai_logs_admin ON public.ai_logs
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS ai_expert_reviews_admin ON public.ai_expert_reviews;
CREATE POLICY ai_expert_reviews_admin ON public.ai_expert_reviews
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Marketplace / mentoring / assets: public read published, admin write
DROP POLICY IF EXISTS marketplace_courses_public_read ON public.marketplace_courses;
CREATE POLICY marketplace_courses_public_read ON public.marketplace_courses
  FOR SELECT TO anon, authenticated
  USING (status = 'listed');

DROP POLICY IF EXISTS marketplace_courses_admin ON public.marketplace_courses;
CREATE POLICY marketplace_courses_admin ON public.marketplace_courses
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS mentoring_sessions_participant ON public.mentoring_sessions;
CREATE POLICY mentoring_sessions_participant ON public.mentoring_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id)
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);

DROP POLICY IF EXISTS mentoring_sessions_admin ON public.mentoring_sessions;
CREATE POLICY mentoring_sessions_admin ON public.mentoring_sessions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS video_assets_public_read ON public.video_assets;
CREATE POLICY video_assets_public_read ON public.video_assets
  FOR SELECT TO anon, authenticated
  USING (status = 'ready');

DROP POLICY IF EXISTS video_assets_admin ON public.video_assets;
CREATE POLICY video_assets_admin ON public.video_assets
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS clinical_simulations_public_read ON public.clinical_simulations;
CREATE POLICY clinical_simulations_public_read ON public.clinical_simulations
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS clinical_simulations_admin ON public.clinical_simulations;
CREATE POLICY clinical_simulations_admin ON public.clinical_simulations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS textbooks_public_read ON public.textbooks;
CREATE POLICY textbooks_public_read ON public.textbooks
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS textbooks_admin ON public.textbooks;
CREATE POLICY textbooks_admin ON public.textbooks
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS system_tests_admin ON public.system_tests;
CREATE POLICY system_tests_admin ON public.system_tests
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS study_games_public_read ON public.study_games;
CREATE POLICY study_games_public_read ON public.study_games
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS study_games_admin ON public.study_games;
CREATE POLICY study_games_admin ON public.study_games
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS ai_scenarios_public_read ON public.ai_scenarios;
CREATE POLICY ai_scenarios_public_read ON public.ai_scenarios
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS ai_scenarios_admin ON public.ai_scenarios;
CREATE POLICY ai_scenarios_admin ON public.ai_scenarios
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS marketing_events_admin ON public.marketing_events;
CREATE POLICY marketing_events_admin ON public.marketing_events
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.courses IS 'MedScope Academy v35 — courses catalog';
