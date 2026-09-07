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
import { generateTeamDrafts } from "@/lib/growth/arena/content-agent";
import { loadArenaEvents } from "@/lib/growth/arena/analyst-agent";
import { scoreCountryMarkets, scoreCountryTraffic, scoreLocaleMarkets } from "@/lib/growth/arena/markets";
import { africaCoverageRows, africaCountryCodes } from "@/lib/growth/africa-markets";

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
  const trafficTotals = countryTraffic.reduce(
    (acc, row) => {
      acc.visits += row.visits;
      acc.checkouts += row.checkouts;
      acc.paid += row.paid;
      return acc;
    },
    { visits: 0, checkouts: 0, paid: 0 }
  );
  const socialQueue = teams.flatMap((team) =>
    generateTeamDrafts({
      team: team.slug,
      styleBias: team.styleBias,
      knowledge: knowledge.find((row) => row.teamSlug === team.slug) ?? null,
    }).filter((row) => row.channel === "social-draft")
  );
  const africa = africaCoverageRows().map((row) => {
    const score = countries.find((item) => item.country === row.country);
    const traffic = countryTraffic.find((item) => item.country === row.country);
    return {
      ...row,
      visits: traffic?.visits ?? (score?.alfa.visits ?? 0) + (score?.beta.visits ?? 0),
      checkouts: traffic?.checkouts ?? 0,
      paid: traffic?.paid ?? 0,
    };
  });
  const africaWithTraffic = africa.filter((row) => row.visits + row.checkouts + row.paid > 0).length;
  const indexNowQuota = teams.reduce((sum, team) => sum + team.reachQuota, 0);
  const nextActions = [
    trafficTotals.paid === 0
      ? "Zaplacené předplatné je 0 — cron ho nevymyslí. Růst: sdílení klipů, locale hopy, B2B /firmy/reklama/nova."
      : `Za 7 dní ${trafficTotals.paid} zaplacených událostí — držet stejný kanál.`,
    "3 reklamní 8s shoty: /promo/klipy (healthspan, sleep, lifestyle). Lidský upload do IG/FB/WA — cron neposílá.",
    "Instagram/Facebook/WhatsApp/LinkedIn: fronta draftů níže. Cron neposílá — lidský účet.",
    `Afrika: ${africaCountryCodes().length} zemí namapováno na fr/en/pt/es. Provoz v ${africaWithTraffic} z nich.`,
    "IndexNow + hop /predplatne na všech 22 mutacích běží každých 5 minut.",
  ];

  return {
    loadedAt: new Date().toISOString(),
    windowStart: weekStart,
    honesty:
      "Závod běží autonomně ve všech zemích podle ISO země návštěvníka (cf-ipcountry) a jazykové mutace. Tabulka níže je 7 dní reálných událostí — ne vymyšlený dosah. IndexNow + hop /predplatne, žádný auto-post na Instagram/Facebook/WhatsApp/Reddit/X/TikTok. 170 000 / 500 000 je programový cíl, ne aktuální stav.",
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
    pipeline: {
      visits7d: trafficTotals.visits,
      checkouts7d: trafficTotals.checkouts,
      paid7d: trafficTotals.paid,
      indexNowQuota,
      socialDraftsHeld: socialQueue.length,
      africaMapped: africaCountryCodes().length,
      africaWithTraffic,
      nextActions,
    },
    socialQueue: socialQueue.slice(0, 16),
    africa,
    knowledge,
    metrics,
    evolution,
    bus,
  };
}

export type ArenaDashboard = Awaited<ReturnType<typeof loadArenaDashboard>>;
