import {
  SECTION3_MILESTONE,
  SECTION3_MILESTONE_POINTS,
  SPAM_TEAM_PENALTY,
} from "@/lib/growth/arena/config";
import { analystAccuracy, ctrOf, type ConversionWindow } from "@/lib/growth/arena/metrics";

export type RoleScores = {
  content: number;
  distribution: number;
  analyst: number;
};

export type RewardResult = {
  teamPointsDelta: number;
  roles: RoleScores;
  milestoneAwarded: boolean;
  spam: boolean;
  disqualified: boolean;
};

export function scoreArenaWindow(input: {
  window: ConversionWindow;
  predictedK?: number | null;
  actualK: number;
  section3Users: number;
  spam: boolean;
  alreadyAwardedMilestone: boolean;
}): RewardResult {
  if (input.spam) {
    return {
      teamPointsDelta: SPAM_TEAM_PENALTY,
      roles: { content: 0, distribution: 0, analyst: 0 },
      milestoneAwarded: false,
      spam: true,
      disqualified: true,
    };
  }

  const { window } = input;
  const ctr = ctrOf(window);
  const content = Math.round(ctr * 1000 + window.checkouts * 4);
  const distribution = window.visits + window.newsletters * 3;
  const analyst = Math.round(analystAccuracy(input.predictedK, input.actualK));
  let team =
    window.paid * 100 +
    window.checkouts * 10 +
    window.newsletters * 5 +
    window.visits +
    content +
    analyst;

  let milestoneAwarded = false;
  if (!input.alreadyAwardedMilestone && input.section3Users >= SECTION3_MILESTONE) {
    team += SECTION3_MILESTONE_POINTS;
    milestoneAwarded = true;
  }

  return {
    teamPointsDelta: team,
    roles: { content, distribution, analyst },
    milestoneAwarded,
    spam: false,
    disqualified: false,
  };
}
