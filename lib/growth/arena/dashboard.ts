import { AI_AGENT_GOAL_NEAR, AI_AGENT_GOAL_SEP27 } from "@/lib/growth/ai-agent-program";
import { loadAiAgentGrowthSnapshot } from "@/lib/growth/ai-agent-stats";
import {
  ensureArenaSeeded,
  listBus,
  listEvolution,
  listKnowledge,
  listMetrics,
  loadMembers,
  loadTeams,
} from "@/lib/growth/arena/store";
import { sectionsByPriority } from "@/lib/growth/arena/config";
import { loadArenaEvents } from "@/lib/growth/arena/analyst-agent";
import { scoreCountryMarkets, scoreCountryTraffic, scoreLocaleMarkets } from "@/lib/growth/arena/markets";

const DASHBOARD_WINDOW_MS = 7 * 86_400_000;

export async function loadArenaDashboard() {
  await ensureArenaSeeded();
  const [teams, members, knowledge, metrics, evolution, bus, growth] = await Promise.all([
    loadTeams(),
    loadMembers(),
    listKnowledge(16),
    listMetrics(24),
    listEvolution(16),
    listBus(16),
    loadAiAgentGrowthSnapshot(),
  ]);

  const leaderboard = [...teams].sort((a, b) => b.teamPoints - a.teamPoints);
  const weekStart = new Date(Date.now() - DASHBOARD_WINDOW_MS).toISOString();
  const events = await loadArenaEvents(weekStart);
  const markets = scoreLocaleMarkets(events);
  const countries = scoreCountryMarkets(events);
  const countryTraffic = scoreCountryTraffic(events);

  return {
    loadedAt: new Date().toISOString(),
    windowStart: weekStart,
    honesty:
      "Závod běží autonomně ve všech zemích podle ISO země návštěvníka (cf-ipcountry) a jazykové mutace. Tabulka níže je 7 dní reálných událostí — ne vymyšlený dosah. IndexNow + hop /predplatne, žádný Reddit/X/TikTok. 170 000 / 500 000 je programový cíl, ne aktuální stav.",
    liveSubscribers: growth.subscribers.totalLive,
    goals: {
      near: AI_AGENT_GOAL_NEAR,
      sep27: AI_AGENT_GOAL_SEP27,
      nearPace: growth.goals.near,
      sep27Pace: growth.goals.sep27,
    },
    sections: sectionsByPriority(),
    teams,
    members,
    leaderboard,
    markets,
    countries,
    countryTraffic,
    knowledge,
    metrics,
    evolution,
    bus,
  };
}

export type ArenaDashboard = Awaited<ReturnType<typeof loadArenaDashboard>>;
