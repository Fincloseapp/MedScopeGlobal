-- MedScope Academy v35.0 — Phase 2 triggers (leaderboard recalc, AI task dispatcher)

-- Recalculate leaderboard totals when XP is awarded
CREATE OR REPLACE FUNCTION public.academy_recalc_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leaderboard (user_id, total_xp, period, updated_at)
  VALUES (NEW.user_id, NEW.points, 'all_time', now())
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

-- Notify on new AI tasks (dispatcher hook — processed by cron/API)
CREATE OR REPLACE FUNCTION public.academy_ai_task_notify()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'queued' THEN
    PERFORM pg_notify('academy_ai_task', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_tasks_notify ON public.ai_tasks;
CREATE TRIGGER trg_ai_tasks_notify
  AFTER INSERT ON public.ai_tasks
  FOR EACH ROW EXECUTE FUNCTION public.academy_ai_task_notify();

COMMENT ON FUNCTION public.academy_recalc_leaderboard IS 'MedScope Academy v35 — XP → leaderboard sync';
