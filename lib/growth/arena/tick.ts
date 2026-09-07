import { K_FACTOR_WINDOW_MS, REACH_QUOTA_DEFAULT } from "@/lib/growth/arena/config";
import { ARENA_DISCOVERY_LOCALES } from "@/lib/growth/arena/locales";
import { runAnalyst } from "@/lib/growth/arena/analyst-agent";
import { generateTeamDrafts } from "@/lib/growth/arena/content-agent";
import { distributeTeamReach } from "@/lib/growth/arena/distribution-agent";
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

  for (const team of teams) {
    if (team.status !== "active") {
      hourConv[team.slug] = 0;
      continue;
    }
    const ten = await runAnalyst(team.slug, windowStart);
    const hour = await runAnalyst(team.slug, hourStart);
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

    await writeEvolution({
      action: decision.action,
      winnerSlug: decision.winner,
      loserSlug: decision.loser,
      detail: decision.detail,
    });
    actions.push(decision.detail);
  }

  return {
    ok: errors.length === 0,
    windowStart,
    teams: teams.map((row) => row.slug),
    actions,
    errors,
  };
}
