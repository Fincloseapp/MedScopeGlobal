import { getVipStatus } from "@/lib/vip";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";

const FREE_DAILY_LIMIT = 3;
const VIP_DAILY_LIMIT = 40;
const AGENT = "dokumentace";

export type DokumentaceAccessOk = {
  ok: true;
  isVip: boolean;
  remaining: number;
  facilities: Array<{ id: string; name: string; role: string }>;
};

export type DokumentaceAccessDenied = {
  ok: false;
  status: number;
  error: string;
  code?: string;
};

export type DokumentaceAccessResult = DokumentaceAccessOk | DokumentaceAccessDenied;

async function countDokumentaceSessions(userId: string): Promise<number> {
  try {
    const admin = createServiceRoleClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("ai_agent_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("agent", AGENT)
      .gte("created_at", since);
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function hasPhysicianAccessLevel(userId: string): Promise<boolean> {
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin
      .from("users")
      .select("access_level")
      .eq("id", userId)
      .maybeSingle();
    return data?.access_level === "physician";
  } catch {
    return false;
  }
}

/**
 * Gate for MedScope Dokumentace:
 * 1) verified physician / facility-linked account
 * 2) daily quota (3 non-VIP / 40 VIP)
 */
export async function assertDokumentaceAccess(
  userId: string | undefined
): Promise<DokumentaceAccessResult> {
  if (!userId) {
    return {
      ok: false,
      status: 401,
      error: "Pro MedScope Dokumentace se musíte přihlásit.",
      code: "UNAUTHENTICATED",
    };
  }

  const eligibility = await getDokumentaceEligibility(userId);
  if (!eligibility.eligible) {
    return {
      ok: false,
      status: eligibility.reason === "unauthenticated" ? 401 : 403,
      error: eligibility.message,
      code:
        eligibility.reason === "unauthenticated"
          ? "UNAUTHENTICATED"
          : "DOCTOR_VERIFICATION_REQUIRED",
    };
  }

  const vipRow = await getVipStatus(userId);
  const physicianLevel = vipRow ? false : await hasPhysicianAccessLevel(userId);
  const isVip = Boolean(vipRow || physicianLevel);
  const limit = isVip ? VIP_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const used = await countDokumentaceSessions(userId);
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    if (!isVip) {
      return {
        ok: false,
        status: 402,
        error:
          "Vyčerpán denní demo limit (3 zápisy). Předplatné Dokumentace nebo Lékař v praxi odemyká až 40 zápisů denně.",
        code: "PAYMENT_REQUIRED",
      };
    }
    return {
      ok: false,
      status: 429,
      error: "Vyčerpán denní limit Dokumentace (40 zápisů / 24 h). Zkuste později.",
      code: "RATE_LIMITED",
    };
  }

  return {
    ok: true,
    isVip,
    remaining,
    facilities: eligibility.facilities,
  };
}
