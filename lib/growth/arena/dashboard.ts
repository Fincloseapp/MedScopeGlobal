import { AI_AGENT_GOAL_NEAR, AI_AGENT_GOAL_SEP27 } from "@/lib/growth/ai-agent-program";
import { countLiveSubscriptions } from "@/lib/growth/ai-agent-stats";
import { evaluateProgramGoals } from "@/lib/growth/ai-agent-eval";
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
import { africaCountryCodes, isAfricaCountry } from "@/lib/growth/africa-markets";

const DASHBOARD_WINDOW_MS = 7 * 86_400_000;

export async function loadArenaDashboard() {
  await ensureArenaSeeded();
  const [teams, members, knowledge, metrics, evolution, bus, liveSubscribers] = await Promise.all([
    loadTeams(),
    loadMembers(),
    listKnowledge(16),
    listMetrics(24, "team"),
    listEvolution(16),
    listBus(16),
    countLiveSubscriptions(),
  ]);

  const leaderboard = [...teams].sort((a, b) => b.teamPoints - a.teamPoints);
  const weekStart = new Date(Date.now() - DASHBOARD_WINDOW_MS).toISOString();
  const events = await loadArenaEvents(weekStart);
  const markets = scoreLocaleMarkets(events);
  const countries = scoreCountryMarkets(events).filter((row) => row.activity > 0);
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
  const socialQueue = teams
    .flatMap((team) =>
      generateTeamDrafts({
        team: team.slug,
        styleBias: team.styleBias,
        knowledge: knowledge.find((row) => row.teamSlug === team.slug) ?? null,
        locales: ["cs", "en", "fr"],
      }).filter((row) => row.channel === "social-draft")
    )
    .slice(0, 12);
  const africaMapped = africaCountryCodes().length;
  const africa = countryTraffic
    .filter((row) => isAfricaCountry(row.country))
    .map((row) => ({
      country: row.country,
      locale: row.locale ?? "en",
      visits: row.visits,
      checkouts: row.checkouts,
      paid: row.paid,
    }));
  const africaWithTraffic = africa.length;
  const indexNowQuota = teams.reduce((sum, team) => sum + team.reachQuota, 0);
  const localesLive = markets.filter((row) => {
    const activity =
      row.alfa.visits + row.alfa.checkouts + row.alfa.paid + row.beta.visits + row.beta.checkouts + row.beta.paid;
    return activity > 0;
  });
  const alfaLeadCountries = countries.filter((row) => row.leader === "alfa").length;
  const betaLeadCountries = countries.filter((row) => row.leader === "beta").length;
  const alfaLeadLocales = localesLive.filter((row) => row.leader === "alfa").length;
  const betaLeadLocales = localesLive.filter((row) => row.leader === "beta").length;
  const traffic7d = trafficTotals.visits + trafficTotals.checkouts + trafficTotals.paid;
  const pointsLeader =
    (leaderboard[0]?.teamPoints ?? 0) === (leaderboard[1]?.teamPoints ?? 0)
      ? "tie"
      : (leaderboard[0]?.slug ?? "tie");
  const raceLeader =
    traffic7d === 0
      ? "tie"
      : alfaLeadCountries === betaLeadCountries
        ? pointsLeader
        : alfaLeadCountries > betaLeadCountries
          ? "alfa"
          : "beta";
  const nextActions = [
    trafficTotals.paid === 0
      ? "Zaplacené předplatné je 0 — cron ho nevymyslí. Růst: sdílení klipů, locale hopy, B2B /firmy/reklama/nova."
      : `Za 7 dní ${trafficTotals.paid} zaplacených událostí — držet stejný kanál.`,
    "3 reklamní 8s shoty: /promo/klipy (man, woman, alike). Lidský upload do IG/FB/WA — cron neposílá.",
    "Instagram/Facebook/WhatsApp/LinkedIn: fronta draftů níže. Cron neposílá — lidský účet.",
    `Afrika: ${africaMapped} zemí namapováno na fr/en/pt/es. Provoz v ${africaWithTraffic} z nich.`,
    "IndexNow + hop /predplatne na všech 22 mutacích běží každých 5 minut.",
  ];
  const pace = evaluateProgramGoals(liveSubscribers, 0, new Date());

  return {
    loadedAt: new Date().toISOString(),
    windowStart: weekStart,
    honesty:
      "Závod se počítá z reálných hopů (ISO země + mutace). 0–0 kolo nemění kvótu ani body. IndexNow + hop /predplatne, žádný auto-post. 170 000 / 500 000 je programový cíl, ne aktuální stav.",
    liveSubscribers,
    goals: {
      near: AI_AGENT_GOAL_NEAR,
      sep27: AI_AGENT_GOAL_SEP27,
      nearPace: pace.near,
      sep27Pace: pace.sep27,
    },
    sections: sectionsByPriority(),
    teams,
    members,
    leaderboard,
    verdict: {
      leader: raceLeader,
      pointsLeader,
      traffic7d,
      countriesLive: countries.length,
      localesLive: localesLive.length,
      alfaLeadCountries,
      betaLeadCountries,
      alfaLeadLocales,
      betaLeadLocales,
      emptyReason:
        traffic7d === 0
          ? "Za 7 dní žádný hop s ISO zemí. Průběžné body jsou historické — prázdné kolo není výhra."
          : null,
    },
    markets: localesLive,
    countries,
    countryTraffic,
    pipeline: {
      visits7d: trafficTotals.visits,
      checkouts7d: trafficTotals.checkouts,
      paid7d: trafficTotals.paid,
      indexNowQuota,
      socialDraftsHeld: socialQueue.length,
      africaMapped,
      africaWithTraffic,
      nextActions,
    },
    socialQueue,
    africa,
    knowledge,
    metrics,
    evolution,
    bus,
  };
}

export type ArenaDashboard = Awaited<ReturnType<typeof loadArenaDashboard>>;
