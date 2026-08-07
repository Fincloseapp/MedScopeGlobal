import { getVipStatus } from "@/lib/vip";
import { createServiceRoleClient } from "@/lib/supabase/service";

const FREE_DAILY_LIMIT = 3;
const VIP_DAILY_LIMIT = 40;
const AGENT = "dokumentace";

export type DokumentaceAccessOk = {
  ok: true;
  isVip: boolean;
  remaining: number;
};

export type DokumentaceAccessDenied = {
  ok: false;
  status: number;
  error: string;
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
 * Gate for MedScope Dokumentace: login required; non-VIP 3/day, VIP 40/day.
 * VIP via vip_subscriptions OR users.access_level = physician (belt and suspenders).
 */
export async function assertDokumentaceAccess(
  userId: string | undefined
): Promise<DokumentaceAccessResult> {
  if (!userId) {
    return {
      ok: false,
      status: 401,
      error: "Pro MedScope Dokumentace se musíte přihlásit.",
    };
  }

  const vipRow = await getVipStatus(userId);
  const physicianLevel = vipRow ? false : await hasPhysicianAccessLevel(userId);
  const isVip = vipRow || physicianLevel;
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
      };
    }
    return {
      ok: false,
      status: 429,
      error: "Vyčerpán denní limit Dokumentace (40 zápisů / 24 h). Zkuste později.",
    };
  }

  return { ok: true, isVip, remaining };
}
