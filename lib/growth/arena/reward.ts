import {
  SECTION3_MILESTONE,
  SECTION3_MILESTONE_POINTS,
  SPAM_TEAM_PENALTY,
} from "@/lib/growth/arena/config";
import { ARENA_POINTS_PER_PAID } from "@/lib/growth/arena/race-rules";
import { analystAccuracy, type ConversionWindow } from "@/lib/growth/arena/metrics";

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
  if (window.paid <= 0) {
    return {
      teamPointsDelta: 0,
      roles: { content: 0, distribution: 0, analyst: 0 },
      milestoneAwarded: false,
      spam: false,
      disqualified: false,
    };
  }
  const content = Math.min(40, window.paid * 8);
  const distribution = Math.min(40, window.paid * 10);
  const analyst = Math.round(analystAccuracy(input.predictedK, input.actualK));
  let team = window.paid * ARENA_POINTS_PER_PAID;

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
