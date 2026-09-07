import { K_FACTOR_WINDOW_MS, REACH_QUOTA_DEFAULT } from "@/lib/growth/arena/config";
import { ARENA_DISCOVERY_LOCALES } from "@/lib/growth/arena/locales";
import { loadArenaEvents, reportFromWindow } from "@/lib/growth/arena/analyst-agent";
import {
  scoreCountryMarkets,
  scoreLocaleMarkets,
  windowFromEvents,
  type ArenaMarketScore,
} from "@/lib/growth/arena/markets";
import { generateTeamDrafts } from "@/lib/growth/arena/content-agent";
import { distributeTeamReach } from "@/lib/growth/arena/distribution-agent";
import { rotatedRankedAgentHopUrls } from "@/lib/growth/ai-agent-hops";
import { RANKED_AI_AGENT_SLUGS, agentHopPathUrl } from "@/lib/growth/ai-agent-program";
import { getSiteUrl } from "@/lib/config/site-url";
import { submitIndexNow } from "@/lib/seo/indexnow";
import { decideEvolution, type TeamRuntime } from "@/lib/growth/arena/evolution";
import { ctrOf } from "@/lib/growth/arena/metrics";
import { scoreArenaWindow } from "@/lib/growth/arena/reward";
import {
  addMemberPoints,
  ensureArenaSeeded,
  latestKnowledge,
  loadTeams,
  upsertTeam,
  writeBus,
  writeEvolution,
  writeKnowledge,
  writeMetric,
  type TeamRow,
} from "@/lib/growth/arena/store";

export type ArenaTickResult = {
  ok: boolean;
  windowStart: string;
  teams: string[];
  markets: ArenaMarketScore[];
  actions: string[];
  errors: string[];
};

function toRuntime(row: TeamRow, hourConversions: number): TeamRuntime {
  return {
    slug: row.slug,
    generation: row.generation,
    status: row.status,
    teamPoints: row.teamPoints,
    reachQuota: row.reachQuota,
    messageLimit: row.messageLimit,
    losingStreak: row.losingStreak,
    hourConversions,
    styleBias: row.styleBias,
  };
}

export async function runArenaTick(): Promise<ArenaTickResult> {
  const actions: string[] = [];
  const errors: string[] = [];
  await ensureArenaSeeded();
  const teams = await loadTeams();
  for (const team of teams) {
    if (team.status === "active" && team.reachQuota < ARENA_DISCOVERY_LOCALES.length) {
      await upsertTeam({
        slug: team.slug,
        reachQuota: REACH_QUOTA_DEFAULT,
        messageLimit: Math.max(team.messageLimit, REACH_QUOTA_DEFAULT),
      });
      team.reachQuota = REACH_QUOTA_DEFAULT;
      team.messageLimit = Math.max(team.messageLimit, REACH_QUOTA_DEFAULT);
    }
  }
  const windowStart = new Date(Date.now() - K_FACTOR_WINDOW_MS).toISOString();
  const hourStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const hourConv: Record<string, number> = {};
  const hourEvents = await loadArenaEvents(hourStart);
  const tenEvents = await loadArenaEvents(windowStart);
  const markets = scoreLocaleMarkets(hourEvents);

  for (const team of teams) {
    if (team.status !== "active") {
      hourConv[team.slug] = 0;
      continue;
    }
    const tenWindow = windowFromEvents(tenEvents, team.slug);
    const hourWindow = windowFromEvents(hourEvents, team.slug);
    const ten = reportFromWindow(team.slug, tenWindow, 0);
    const hour = reportFromWindow(team.slug, hourWindow, 0);
    hourConv[team.slug] = hour.window.paid + hour.window.checkouts;

    if (ten.shareWorthy && ten.insight) {
      await writeKnowledge({
        teamSlug: team.slug,
        section: "vialongevita",
        styleKey: ten.styleHint,
        kFactor: ten.kFactor,
        insight: ten.insight,
      });
      await writeBus({
        teamSlug: team.slug,
        fromRole: "analyst",
        toRole: "content",
        kind: "k-factor",
        body: { k: ten.kFactor, style: ten.styleHint, insight: ten.insight },
      });
      actions.push(`${team.slug} analyst: K=${ten.kFactor} zapsáno do sdílené paměti`);
    }

    const knowledge = await latestKnowledge(team.slug, "vialongevita");
    const drafts = generateTeamDrafts({
      team: team.slug,
      styleBias: team.styleBias,
      knowledge,
      locales: ARENA_DISCOVERY_LOCALES,
    });
    await writeBus({
      teamSlug: team.slug,
      fromRole: "content",
      toRole: "distribution",
      kind: "drafts",
      body: { count: drafts.length, style: drafts[0]?.style ?? team.styleBias },
    });

    const dist = await distributeTeamReach({
      team: team.slug,
      quota: team.reachQuota,
      drafts,
    });
    const spam = Boolean(dist.error === "spam_blocked");
    if (spam) actions.push(`${team.slug} distribution zablokována — spam`);

    const reward = scoreArenaWindow({
      window: hour.window,
      predictedK: team.predictedK,
      actualK: hour.kFactor,
      section3Users: hour.section3Users,
      spam,
      alreadyAwardedMilestone: team.milestoneSection3,
    });

    await addMemberPoints(team.slug, "content", reward.roles.content);
    await addMemberPoints(team.slug, "distribution", reward.roles.distribution);
    await addMemberPoints(team.slug, "analyst", reward.roles.analyst);

    await writeMetric({
      teamSlug: team.slug,
      agentRole: "team",
      section: "vialongevita",
      windowStart: hourStart,
      windowMinutes: 60,
      visits: hour.window.visits,
      checkouts: hour.window.checkouts,
      paid: hour.window.paid,
      newsletters: hour.window.newsletters,
      ctr: ctrOf(hour.window),
      kFactor: hour.kFactor,
      predictedK: team.predictedK,
      reachUsed: dist.submitted,
      pointsDelta: reward.teamPointsDelta,
      spamFlag: spam,
    });

    await upsertTeam({
      slug: team.slug,
      teamPoints: team.teamPoints + reward.teamPointsDelta,
      predictedK: hour.kFactor,
      milestoneSection3: team.milestoneSection3 || reward.milestoneAwarded,
      status: reward.disqualified ? "disqualified" : team.status,
    });
    if (reward.milestoneAwarded) {
      actions.push(`${team.slug} milník 50 000 Sekce 3 — týmová odměna`);
    }
    actions.push(
      `${team.slug} body ${reward.teamPointsDelta} · K ${hour.kFactor} · IndexNow ${dist.submitted}`
    );
    if (dist.error && dist.error !== "spam_blocked") errors.push(`${team.slug}: ${dist.error}`);
  }

  const rankedHops = [
    ...rotatedRankedAgentHopUrls(),
    ...RANKED_AI_AGENT_SLUGS.map((agent) => agentHopPathUrl(agent, "en", getSiteUrl())),
  ];
  const rankedPing = await submitIndexNow(rankedHops);
  actions.push(`IndexNow ranked hops ${rankedPing.submitted} · HTTP ${rankedPing.status}`);
  if (rankedPing.error) errors.push(`ranked hops: ${rankedPing.error}`);

  const fresh = await loadTeams();
  const alfa = fresh.find((row) => row.slug === "alfa");
  const beta = fresh.find((row) => row.slug === "beta");
  if (alfa && beta) {
    const decision = decideEvolution(
      toRuntime(alfa, hourConv.alfa ?? 0),
      toRuntime(beta, hourConv.beta ?? 0)
    );
    const winner = decision.winner === "alfa" ? alfa : beta;
    const loser = decision.loser === "alfa" ? alfa : beta;

    if (decision.action === "none") {
      actions.push(decision.detail);
    }

    if (decision.action === "allocate") {
      await upsertTeam({
        slug: winner.slug,
        reachQuota: decision.winnerQuota,
        messageLimit: decision.winnerQuota,
        losingStreak: 0,
      });
      await upsertTeam({
        slug: loser.slug,
        reachQuota: decision.loserQuota,
        messageLimit: decision.loserQuota,
        losingStreak: loser.losingStreak + (hourConv[loser.slug] ? 0 : 1),
      });
    }

    if (decision.action === "terminate-clone" || decision.action === "disqualify") {
      if (decision.clone) {
        await upsertTeam({
          slug: decision.clone.slug,
          generation: decision.clone.generation,
          status: "active",
          reachQuota: decision.clone.reachQuota,
          messageLimit: decision.clone.reachQuota,
          teamPoints: 0,
          losingStreak: 0,
          styleBias: decision.clone.styleBias,
        });
      }
      await upsertTeam({
        slug: winner.slug,
        reachQuota: decision.winnerQuota,
        losingStreak: 0,
      });
    }

    if (decision.action !== "none") {
      await writeEvolution({
        action: decision.action,
        winnerSlug: decision.winner,
        loserSlug: decision.loser,
        detail: decision.detail,
      });
      actions.push(decision.detail);
    }
  }

  let decided = 0;
  for (const market of markets) {
    const activity =
      market.alfa.visits +
      market.alfa.checkouts +
      market.alfa.paid +
      market.alfa.newsletters +
      market.beta.visits +
      market.beta.checkouts +
      market.beta.paid +
      market.beta.newsletters;
    if (activity === 0) continue;
    const alfaPts = scoreArenaWindow({
      window: market.alfa,
      actualK: market.alfa.kFactor,
      section3Users: market.alfa.paid,
      spam: false,
      alreadyAwardedMilestone: true,
    });
    const betaPts = scoreArenaWindow({
      window: market.beta,
      actualK: market.beta.kFactor,
      section3Users: market.beta.paid,
      spam: false,
      alreadyAwardedMilestone: true,
    });
    await writeMetric({
      teamSlug: "alfa",
      agentRole: "market",
      section: `locale:${market.locale}`,
      windowStart: hourStart,
      windowMinutes: 60,
      visits: market.alfa.visits,
      checkouts: market.alfa.checkouts,
      paid: market.alfa.paid,
      newsletters: market.alfa.newsletters,
      ctr: ctrOf(market.alfa),
      kFactor: market.alfa.kFactor,
      predictedK: null,
      reachUsed: 1,
      pointsDelta: alfaPts.teamPointsDelta,
      spamFlag: false,
    });
    await writeMetric({
      teamSlug: "beta",
      agentRole: "market",
      section: `locale:${market.locale}`,
      windowStart: hourStart,
      windowMinutes: 60,
      visits: market.beta.visits,
      checkouts: market.beta.checkouts,
      paid: market.beta.paid,
      newsletters: market.beta.newsletters,
      ctr: ctrOf(market.beta),
      kFactor: market.beta.kFactor,
      predictedK: null,
      reachUsed: 1,
      pointsDelta: betaPts.teamPointsDelta,
      spamFlag: false,
    });
    if (market.leader !== "tie") {
      decided += 1;
      const winner = market.leader === "alfa" ? market.alfa : market.beta;
      const loser = market.leader === "alfa" ? market.beta : market.alfa;
      await writeEvolution({
        action: "market",
        winnerSlug: market.leader,
        loserSlug: market.leader === "alfa" ? "beta" : "alfa",
        detail: `${market.locale} (${market.countries.join("/") || "—"}): ${market.leader} ${winner.conversions} > ${loser.conversions}`,
      });
    }
    const localTenAlfa = reportFromWindow("alfa", windowFromEvents(tenEvents, "alfa", market.locale), 0, market.locale);
    const localTenBeta = reportFromWindow("beta", windowFromEvents(tenEvents, "beta", market.locale), 0, market.locale);
    for (const report of [localTenAlfa, localTenBeta]) {
      if (report.shareWorthy && report.insight) {
        await writeKnowledge({
          teamSlug: report.team,
          section: "vialongevita",
          styleKey: report.styleHint,
          kFactor: report.kFactor,
          insight: report.insight,
        });
      }
    }
  }
  const countryScores = scoreCountryMarkets(hourEvents).filter((row) => row.activity > 0);
  let countryDecided = 0;
  for (const row of countryScores) {
    const alfaPts = scoreArenaWindow({
      window: row.alfa,
      actualK: row.alfa.kFactor,
      section3Users: row.alfa.paid,
      spam: false,
      alreadyAwardedMilestone: true,
    });
    const betaPts = scoreArenaWindow({
      window: row.beta,
      actualK: row.beta.kFactor,
      section3Users: row.beta.paid,
      spam: false,
      alreadyAwardedMilestone: true,
    });
    await writeMetric({
      teamSlug: "alfa",
      agentRole: "market",
      section: `country:${row.country}`,
      windowStart: hourStart,
      windowMinutes: 60,
      visits: row.alfa.visits,
      checkouts: row.alfa.checkouts,
      paid: row.alfa.paid,
      newsletters: row.alfa.newsletters,
      ctr: ctrOf(row.alfa),
      kFactor: row.alfa.kFactor,
      predictedK: null,
      reachUsed: 1,
      pointsDelta: alfaPts.teamPointsDelta,
      spamFlag: false,
    });
    await writeMetric({
      teamSlug: "beta",
      agentRole: "market",
      section: `country:${row.country}`,
      windowStart: hourStart,
      windowMinutes: 60,
      visits: row.beta.visits,
      checkouts: row.beta.checkouts,
      paid: row.beta.paid,
      newsletters: row.beta.newsletters,
      ctr: ctrOf(row.beta),
      kFactor: row.beta.kFactor,
      predictedK: null,
      reachUsed: 1,
      pointsDelta: betaPts.teamPointsDelta,
      spamFlag: false,
    });
    if (row.leader !== "tie") {
      countryDecided += 1;
      const winner = row.leader === "alfa" ? row.alfa : row.beta;
      const loser = row.leader === "alfa" ? row.beta : row.alfa;
      await writeEvolution({
        action: "country",
        winnerSlug: row.leader,
        loserSlug: row.leader === "alfa" ? "beta" : "alfa",
        detail: `${row.country}: ${row.leader} ${winner.visits}/${winner.conversions} > ${loser.visits}/${loser.conversions}`,
      });
    }
  }

  actions.push(
    `autonomní souboj ${markets.length} mutací · ${decided} rozhodnutých · země ${countryScores.length} s provozem · ${countryDecided} vedení`
  );

  return {
    ok: errors.length === 0,
    windowStart,
    teams: teams.map((row) => row.slug),
    markets,
    actions,
    errors,
  };
}
