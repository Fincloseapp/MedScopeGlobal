import { AI_AGENT_GOAL_NEAR, AI_AGENT_GOAL_SEP27 } from "@/lib/growth/ai-agent-program";

export type DailyCount = { date: string; count: number };

export type GoalPace = {
  target: number;
  by: string;
  remaining: number;
  daysLeft: number;
  dailyNeeded: number;
  onTrack: boolean;
  label: string;
};

export function addUtcDays(isoDay: string, delta: number): string {
  const d = new Date(`${isoDay}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function daysUntilIso(iso: string, now = new Date()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000));
}

export function sumDailyRange(daily: DailyCount[], from: string, to: string): number {
  return daily
    .filter((row) => row.date >= from && row.date <= to)
    .reduce((sum, row) => sum + row.count, 0);
}

export function evaluateVisibility(
  daily: DailyCount[],
  today: string
): { visible: boolean; last3: number; prev3: number; label: string } {
  const last3from = addUtcDays(today, -2);
  const prev3to = addUtcDays(today, -3);
  const prev3from = addUtcDays(today, -5);
  const last3 = sumDailyRange(daily, last3from, today);
  const prev3 = sumDailyRange(daily, prev3from, prev3to);
  if (last3 === 0 && prev3 === 0) {
    return {
      visible: false,
      last3,
      prev3,
      label: "Nárůst zatím není vidět — v posledních 6 dnech nepřibylo žádné nové předplatné.",
    };
  }
  if (last3 > prev3) {
    return {
      visible: true,
      last3,
      prev3,
      label: `Nárůst je vidět: poslední 3 dny ${last3} > předchozí 3 dny ${prev3}.`,
    };
  }
  if (last3 === prev3) {
    return {
      visible: false,
      last3,
      prev3,
      label: `Předplatné přibývají, ale tempo se nemění (${last3} za 3 dny).`,
    };
  }
  return {
    visible: false,
    last3,
    prev3,
    label: `Nárůst není vidět: poslední 3 dny ${last3} < předchozí 3 dny ${prev3}.`,
  };
}

export function evaluateGoalPace(
  live: number,
  dailyAvg7: number,
  goal: { count: number; by: string },
  now = new Date()
): GoalPace {
  const remaining = Math.max(0, goal.count - live);
  const daysLeft = daysUntilIso(goal.by, now);
  const dailyNeeded = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining;
  const reached = remaining === 0;
  const onTrack = reached || (daysLeft > 0 && dailyAvg7 >= dailyNeeded && dailyNeeded > 0);
  const when = new Date(goal.by).toLocaleDateString("cs-CZ");
  let label: string;
  if (reached) {
    label = `Cíl ${goal.count.toLocaleString("cs-CZ")} je splněn.`;
  } else if (daysLeft === 0) {
    label = `Termín ${when} vypršel. Chybí ${remaining.toLocaleString("cs-CZ")}.`;
  } else if (onTrack) {
    label = `Na cestě k ${when}: tempo ${dailyAvg7}/den stačí (potřeba ${dailyNeeded}/den).`;
  } else {
    label = `Mimo tempo k ${when}: potřeba ${dailyNeeded}/den, skutečnost ${dailyAvg7}/den. Chybí ${remaining.toLocaleString("cs-CZ")}.`;
  }
  return {
    target: goal.count,
    by: goal.by,
    remaining,
    daysLeft,
    dailyNeeded,
    onTrack,
    label,
  };
}

export function evaluateProgramGoals(live: number, dailyAvg7: number, now = new Date()) {
  return {
    near: evaluateGoalPace(live, dailyAvg7, AI_AGENT_GOAL_NEAR, now),
    sep27: evaluateGoalPace(live, dailyAvg7, AI_AGENT_GOAL_SEP27, now),
  };
}
