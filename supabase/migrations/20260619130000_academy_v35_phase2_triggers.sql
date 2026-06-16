-- MedScope Academy v35.0 — Phase 2 triggers
-- Leaderboard recalc on xp_events, AI task dispatcher notification

-- Recalculate leaderboard totals when XP is awarded
CREATE OR REPLACE FUNCTION public.academy_recalc_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leaderboard (user_id, period, total_xp, updated_at)
  VALUES (NEW.user_id, 'all_time', NEW.points, now())
  ON CONFLICT (user_id, period)
  DO UPDATE SET
    total_xp = public.leaderboard.total_xp + EXCLUDED.total_xp,
    updated_at = now();

  INSERT INTO public.leaderboard (user_id, period, total_xp, updated_at)
  VALUES (NEW.user_id, 'weekly', NEW.points, now())
  ON CONFLICT (user_id, period)
  DO UPDATE SET
    total_xp = public.leaderboard.total_xp + EXCLUDED.total_xp,
    updated_at = now();

  INSERT INTO public.leaderboard (user_id, period, total_xp, updated_at)
  VALUES (NEW.user_id, 'monthly', NEW.points, now())
  ON CONFLICT (user_id, period)
  DO UPDATE SET
    total_xp = public.leaderboard.total_xp + EXCLUDED.total_xp,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_xp_events_leaderboard ON public.xp_events;
CREATE TRIGGER trg_xp_events_leaderboard
  AFTER INSERT ON public.xp_events
  FOR EACH ROW EXECUTE FUNCTION public.academy_recalc_leaderboard();

-- Notify dispatcher on new queued AI tasks (pg_notify for external workers)
CREATE OR REPLACE FUNCTION public.academy_ai_task_dispatcher()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'queued' THEN
    PERFORM pg_notify(
      'academy_ai_task',
      json_build_object('id', NEW.id, 'task_type', NEW.task_type)::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_tasks_dispatcher ON public.ai_tasks;
CREATE TRIGGER trg_ai_tasks_dispatcher
  AFTER INSERT ON public.ai_tasks
  FOR EACH ROW EXECUTE FUNCTION public.academy_ai_task_dispatcher();

COMMENT ON FUNCTION public.academy_recalc_leaderboard IS 'MedScope Academy v35 — sync leaderboard on xp_events insert';
COMMENT ON FUNCTION public.academy_ai_task_dispatcher IS 'MedScope Academy v35 — pg_notify on queued ai_tasks';
