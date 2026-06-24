import { getSessionProfile } from "@/lib/auth/session";
import {
  getClkVerificationStatus,
  isClkVerified,
} from "@/lib/auth/clk-verify";

export type OdbornaGateReason = "login" | "verify" | "pending" | "rejected";

export async function getOdbornaAccess() {
  const { user, profile } = await getSessionProfile();
  if (!user) {
    return {
      allowed: false as const,
      reason: "login" as OdbornaGateReason,
      user: null,
      profile: null,
      clk: null,
    };
  }

  const clk = await getClkVerificationStatus(user.id);

  if (isClkVerified(clk?.status)) {
    return {
      allowed: true as const,
      reason: null,
      user,
      profile,
      clk,
    };
  }

  if (clk?.status === "pending" || clk?.status === "manual_review") {
    return {
      allowed: false as const,
      reason: "pending" as OdbornaGateReason,
      user,
      profile,
      clk,
    };
  }

  if (clk?.status === "rejected") {
    return {
      allowed: false as const,
      reason: "rejected" as OdbornaGateReason,
      user,
      profile,
      clk,
    };
  }

  return {
    allowed: false as const,
    reason: "verify" as OdbornaGateReason,
    user,
    profile,
    clk,
  };
}

export async function requireOdbornaAccess() {
  const access = await getOdbornaAccess();
  return access;
}
