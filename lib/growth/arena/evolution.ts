import {
  LOSING_STREAK_KILL,
  REACH_QUOTA_DEFAULT,
  REACH_QUOTA_MAX,
  REACH_QUOTA_MIN,
  TEAM_SEED,
  type ArenaTeamSlug,
  type ContentStyle,
} from "@/lib/growth/arena/config";

export type TeamRuntime = {
  slug: ArenaTeamSlug;
  generation: number;
  status: "active" | "terminated" | "disqualified";
  teamPoints: number;
  reachQuota: number;
  messageLimit: number;
  losingStreak: number;
  hourConversions: number;
  styleBias: ContentStyle;
};

export type EvolutionDecision = {
  action: "none" | "allocate" | "terminate-clone" | "disqualify";
  winner: ArenaTeamSlug;
  loser: ArenaTeamSlug;
  winnerQuota: number;
  loserQuota: number;
  clone?: {
    slug: ArenaTeamSlug;
    generation: number;
    styleBias: ContentStyle;
    reachQuota: number;
  };
  detail: string;
};

const STYLES: ContentStyle[] = [
  "clinical-short",
  "prevention-habit",
  "sleep-focus",
  "movement-nudge",
  "nutrition-evidence",
];

export function mutateStyle(current: ContentStyle, salt = 0): ContentStyle {
  const idx = Math.max(0, STYLES.indexOf(current));
  return STYLES[(idx + 1 + (salt % 3)) % STYLES.length] ?? "clinical-short";
}

export function allocateQuotas(winnerQuota: number, loserQuota: number): {
  winnerQuota: number;
  loserQuota: number;
} {
  return {
    winnerQuota: Math.min(REACH_QUOTA_MAX, winnerQuota + 8),
    loserQuota: Math.max(REACH_QUOTA_MIN, loserQuota - 4),
  };
}

export function decideEvolution(alfa: TeamRuntime, beta: TeamRuntime): EvolutionDecision {
  const active = [alfa, beta].filter((row) => row.status === "active");
  if (active.length === 0) {
    return {
      action: "terminate-clone",
      winner: "alfa",
      loser: "beta",
      winnerQuota: REACH_QUOTA_DEFAULT,
      loserQuota: REACH_QUOTA_MIN,
      clone: {
        slug: "alfa",
        generation: alfa.generation + 1,
        styleBias: TEAM_SEED.alfa.styleBias,
        reachQuota: REACH_QUOTA_DEFAULT,
      },
      detail: "Oba týmy mrtvé — restart Alfa z výchozí konfigurace.",
    };
  }

  const dq = [alfa, beta].find((row) => row.status === "disqualified");
  if (dq) {
    const winner = dq.slug === "alfa" ? beta : alfa;
    const quotas = allocateQuotas(winner.reachQuota, REACH_QUOTA_MIN);
    return {
      action: "disqualify",
      winner: winner.slug,
      loser: dq.slug,
      winnerQuota: quotas.winnerQuota,
      loserQuota: quotas.loserQuota,
      clone: {
        slug: dq.slug,
        generation: dq.generation + 1,
        styleBias: mutateStyle(winner.styleBias, dq.generation),
        reachQuota: Math.max(REACH_QUOTA_MIN, Math.round(winner.reachQuota * 0.8)),
      },
      detail: `Tým ${dq.slug} diskvalifikován za spam/shadowban (−50 000). Klon z ${winner.slug}.`,
    };
  }

  if (alfa.hourConversions === 0 && beta.hourConversions === 0) {
    const ahead = alfa.teamPoints >= beta.teamPoints ? alfa : beta;
    const behind = ahead.slug === "alfa" ? beta : alfa;
    return {
      action: "none",
      winner: ahead.slug,
      loser: behind.slug,
      winnerQuota: alfa.reachQuota,
      loserQuota: beta.reachQuota,
      detail: "Souboj hodiny: 0–0. Bez konverze se kvóta ani série proher nemění.",
    };
  }

  const leader = alfa.hourConversions >= beta.hourConversions ? alfa : beta;
  const trailer = leader.slug === "alfa" ? beta : alfa;
  const quotas = allocateQuotas(leader.reachQuota, trailer.reachQuota);

  if (
    trailer.losingStreak + 1 >= LOSING_STREAK_KILL &&
    trailer.hourConversions === 0 &&
    leader.hourConversions > 0
  ) {
    return {
      action: "terminate-clone",
      winner: leader.slug,
      loser: trailer.slug,
      winnerQuota: quotas.winnerQuota,
      loserQuota: quotas.loserQuota,
      clone: {
        slug: trailer.slug,
        generation: trailer.generation + 1,
        styleBias: mutateStyle(leader.styleBias, trailer.generation),
        reachQuota: Math.max(REACH_QUOTA_MIN, Math.round(leader.reachQuota * 0.8)),
      },
      detail: `Evoluce: ${trailer.slug} usmrcen po ${LOSING_STREAK_KILL} prázdných hodinách. Klon z ${leader.slug}.`,
    };
  }

  return {
    action: "allocate",
    winner: leader.slug,
    loser: trailer.slug,
    winnerQuota: quotas.winnerQuota,
    loserQuota: quotas.loserQuota,
    detail: `Souboj hodiny: ${leader.slug} ${leader.hourConversions} konverzí > ${trailer.slug} ${trailer.hourConversions}. Vyšší organický kvót.`,
  };
}
