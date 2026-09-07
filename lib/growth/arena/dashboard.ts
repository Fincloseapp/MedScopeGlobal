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

  return {
    loadedAt: new Date().toISOString(),
    honesty:
      "170 000 za 3 dny je programový cíl. Souboj týmů počítá jen reálné hop/checkout/paid eventy. Sociální účty jsou kvóty dosahu, ne automatický spam.",
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
    knowledge,
    metrics,
    evolution,
    bus,
  };
}

export type ArenaDashboard = Awaited<ReturnType<typeof loadArenaDashboard>>;
