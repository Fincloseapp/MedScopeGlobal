import { AI_AGENT_GOAL_NEAR, AI_AGENT_GOAL_SEP27 } from "@/lib/growth/ai-agent-program";
import { countSubscriptionHeads } from "@/lib/growth/ai-agent-stats";
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
import {
  scoreCountryMarkets,
  scoreCountryTraffic,
  scoreLocaleMarkets,
  windowFromEvents,
} from "@/lib/growth/arena/markets";
import { africaCountryCodes, isAfricaCountry } from "@/lib/growth/africa-markets";
import { ARENA_RACE_RULES } from "@/lib/growth/arena/race-rules";

const DASHBOARD_WINDOW_MS = 7 * 86_400_000;

export async function loadArenaDashboard() {
  await ensureArenaSeeded();
  const [teams, members, knowledge, metrics, evolution, bus, subscriptionHeads] = await Promise.all([
    loadTeams(),
    loadMembers(),
    listKnowledge(16),
    listMetrics(24, "team"),
    listEvolution(16),
    listBus(16),
    countSubscriptionHeads(),
  ]);
  const payingSubscribers = subscriptionHeads.active;
  const liveSubscribers = subscriptionHeads.active + subscriptionHeads.trialing;

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
  const alfaPaid7d = windowFromEvents(events, "alfa").paid;
  const betaPaid7d = windowFromEvents(events, "beta").paid;
  const paidBySlug = { alfa: alfaPaid7d, beta: betaPaid7d } as const;
  const leaderboard = [...teams].sort((a, b) => {
    const paidDelta = (paidBySlug[b.slug] ?? 0) - (paidBySlug[a.slug] ?? 0);
    if (paidDelta !== 0) return paidDelta;
    return a.slug.localeCompare(b.slug);
  });
  const payingNow = payingSubscribers > 0 || trafficTotals.paid > 0 || alfaPaid7d + betaPaid7d > 0;
  const alfaLeadCountries = countries.filter((row) => row.leader === "alfa").length;
  const betaLeadCountries = countries.filter((row) => row.leader === "beta").length;
  const alfaLeadLocales = localesLive.filter((row) => row.leader === "alfa").length;
  const betaLeadLocales = localesLive.filter((row) => row.leader === "beta").length;
  const traffic7d = trafficTotals.visits + trafficTotals.checkouts + trafficTotals.paid;
  const raceLeader =
    alfaPaid7d <= 0 && betaPaid7d <= 0
      ? "tie"
      : alfaPaid7d === betaPaid7d
        ? "tie"
        : alfaPaid7d > betaPaid7d
          ? "alfa"
          : "beta";
  const nextActions = payingNow
    ? [
        `Úspěch: ${payingSubscribers} platících, ${liveSubscribers} živých včetně trial. Za 7 dní ${trafficTotals.paid} zaplacených hopů.`,
        "Další platící jen přes /predplatne — návštěvy a košík zůstávají pipeline.",
        "3 reklamní 8s shoty: /promo/klipy. Lidský upload do IG/FB/WA — cron neposílá.",
        `Afrika: ${africaMapped} zemí namapováno. Platící v ${africa.filter((row) => row.paid > 0).length} z nich.`,
        "IndexNow + hop jen jako distribuce, ne jako skóre.",
      ]
    : [
        "Vyhodnocení: neúspěch. 0 platících předplatitelů — to jediné je výhra.",
        "Crawler čtení, hop, IndexNow a košík jsou mezikrok. Body, kvóta ani klon za ně nejdou.",
        "Jediný cíl: první platící Redakce (25 Kč / €1 / $1 / £1), ne 170 000 návštěv.",
        "Lidský post IG/FB/WA/LI z fronty draftů na /predplatne. Cron neposílá.",
        "B2B /firmy/reklama/nova je druhý příjem — do souboje Alfa/Beta se nepočítá, dokud někdo nezaplatí předplatné.",
      ];
  const pace = evaluateProgramGoals(liveSubscribers, 0, new Date());

  return {
    loadedAt: new Date().toISOString(),
    windowStart: weekStart,
    honesty:
      "Výhra = zaplacené předplatné (ai_agent_paid nebo živý Stripe active). Návštěva crawlera, hop, košík a IndexNow jsou pipeline, ne úspěch. 0 platících = remíza, 0 bodů, žádná kvóta. 170 000 / 500 000 je programový cíl, ne stav.",
    race: {
      ...ARENA_RACE_RULES,
      paidAlfa7d: alfaPaid7d,
      paidBeta7d: betaPaid7d,
    },
    liveSubscribers,
    payingSubscribers,
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
      pointsLeader: raceLeader,
      win: payingNow,
      paidAlfa7d: alfaPaid7d,
      paidBeta7d: betaPaid7d,
      traffic7d,
      countriesLive: countries.length,
      localesLive: localesLive.length,
      alfaLeadCountries,
      betaLeadCountries,
      alfaLeadLocales,
      betaLeadLocales,
      emptyReason: payingNow
        ? null
        : traffic7d === 0
          ? "0 platících a 0 hopů. Bez zaplaceného předplatného není výhra."
          : "Jsou návštěvy (crawleři / hopy / košík), ale 0 zaplacených předplatných — to není výhra.",
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
