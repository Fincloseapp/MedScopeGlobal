import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { isValidClkId } from "@/lib/academy/b2b/verification";
import { listPartnerMemberships } from "@/lib/academy/b2b/db";
import { getVipSubscription } from "@/lib/vip";
import { buildValidityLabel, guestAccess } from "@/lib/apps/access-status";
import type { AppAccessInfo } from "@/lib/apps/access-status";

export type DokumentaceEligibility = {
  eligible: boolean;
  canInstall: boolean;
  reason:
    | "ok"
    | "unauthenticated"
    | "not_verified"
    | "unavailable";
  userId?: string;
  email?: string | null;
  displayName?: string | null;
  verifiedDoctor: boolean;
  accessLevel?: string | null;
  role?: string | null;
  clkId?: string | null;
  facilities: Array<{ id: string; name: string; role: string }>;
  message: string;
  isVip?: boolean;
  access: AppAccessInfo;
};

type UserEligibilityRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  access_level: string | null;
  role: string | null;
  verified_doctor: boolean | null;
  verification_status: string | null;
  clk_id: string | null;
};

function isEligibleFromRow(row: UserEligibilityRow, hasFacility: boolean): boolean {
  if (row.verified_doctor === true) return true;
  if (row.role === "admin") return true;
  if (row.access_level === "physician" && row.verification_status === "approved") {
    return true;
  }
  if (isValidClkId(row.clk_id) && row.access_level === "physician") return true;
  if (hasFacility && row.access_level === "physician") return true;
  if (hasFacility && row.role === "admin") return true;
  return false;
}

async function loadUserRow(userId: string): Promise<UserEligibilityRow | null> {
  try {
    const admin = tryCreateServiceRoleClient();
    if (!admin) return null;
    const { data, error } = await admin
      .from("users")
      .select(
        "id, email, full_name, access_level, role, verified_doctor, verification_status, clk_id"
      )
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) {
      // Fallback without optional columns
      const fallback = await admin
        .from("users")
        .select("id, email, full_name, access_level, role")
        .eq("id", userId)
        .maybeSingle();
      if (fallback.error || !fallback.data) return null;
      return {
        id: fallback.data.id as string,
        email: (fallback.data.email as string | null) ?? null,
        full_name: (fallback.data.full_name as string | null) ?? null,
        access_level: (fallback.data.access_level as string | null) ?? null,
        role: (fallback.data.role as string | null) ?? null,
        verified_doctor: null,
        verification_status: null,
        clk_id: null,
      };
    }
    return data as UserEligibilityRow;
  } catch {
    return null;
  }
}

/**
 * Dokumentace app + install: only verified physicians / facility-linked accounts.
 * TestD qualifies via verified_doctor + admin + physician access_level.
 */
export async function getDokumentaceEligibility(
  userId: string | undefined
): Promise<DokumentaceEligibility> {
  const loginUrl = "/login?next=/app/dokumentace";
  const subscribeUrl = "/predplatne#dokumentace";

  if (!userId) {
    return {
      eligible: false,
      canInstall: false,
      reason: "unauthenticated",
      verifiedDoctor: false,
      facilities: [],
      message:
        "Pro stažení a používání OrdiZapis od MedScopeGlobal se přihlaste ověřeným lékařským účtem.",
      isVip: false,
      access: guestAccess(loginUrl, subscribeUrl, "Host · vyžaduje ověřeného lékaře"),
    };
  }

  const row = await loadUserRow(userId);
  if (!row) {
    return {
      eligible: false,
      canInstall: false,
      reason: "unavailable",
      userId,
      verifiedDoctor: false,
      facilities: [],
      message: "Nepodařilo se ověřit účet. Zkuste to znovu.",
      isVip: false,
      access: {
        authenticated: true,
        accountLabel: "Účet MedScope",
        email: null,
        planLabel: "Nelze ověřit",
        entitled: false,
        validUntil: null,
        validityLabel: "zkontrolujte připojení",
        loginUrl,
        subscribeUrl,
      },
    };
  }

  let facilities: Array<{ id: string; name: string; role: string }> = [];
  try {
    const memberships = await listPartnerMemberships(userId);
    facilities = memberships.map((m) => ({
      id: m.partner.id,
      name: m.partner.name,
      role: m.role,
    }));
  } catch {
    facilities = [];
  }

  const vip = await getVipSubscription(userId);
  const eligible = isEligibleFromRow(row, facilities.length > 0);
  const accountLabel = row.full_name || row.email || "Účet MedScope";

  if (!eligible) {
    return {
      eligible: false,
      canInstall: false,
      reason: "not_verified",
      userId,
      email: row.email,
      displayName: row.full_name,
      verifiedDoctor: row.verified_doctor === true,
      accessLevel: row.access_level,
      role: row.role,
      clkId: row.clk_id,
      facilities,
      message:
        "Stažení a plné používání OrdiZapis je jen pro ověřené lékaře (nebo účet zdravotnického zařízení). Dokončete ověření v Lékařské zóně.",
      isVip: vip.active,
      access: {
        authenticated: true,
        accountLabel,
        email: row.email,
        planLabel: "Čeká na ověření lékaře",
        entitled: false,
        validUntil: vip.endsAt,
        validityLabel: buildValidityLabel({
          authenticated: true,
          entitled: false,
          endsAt: vip.endsAt,
        }),
        loginUrl,
        subscribeUrl,
      },
    };
  }

  const planLabel = vip.active
    ? "Lékař · předplatné OrdiZapis"
    : "Ověřený lékařský účet";

  return {
    eligible: true,
    canInstall: true,
    reason: "ok",
    userId,
    email: row.email,
    displayName: row.full_name,
    verifiedDoctor: row.verified_doctor === true || Boolean(isValidClkId(row.clk_id)),
    accessLevel: row.access_level,
    role: row.role,
    clkId: row.clk_id,
    facilities,
    message:
      facilities.length > 0
        ? `Účet propojen: ${row.full_name || "lékař"} · ${facilities.map((f) => f.name).join(", ")}`
        : `Účet propojen: ${row.full_name || row.email || "ověřený lékař"}`,
    isVip: vip.active,
    access: {
      authenticated: true,
      accountLabel,
      email: row.email,
      planLabel,
      entitled: true,
      validUntil: vip.endsAt,
      validityLabel: buildValidityLabel({
        authenticated: true,
        entitled: true,
        endsAt: vip.endsAt,
      }),
      loginUrl,
      subscribeUrl,
    },
  };
}
