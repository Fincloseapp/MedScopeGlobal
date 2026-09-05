import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { isValidClkId } from "@/lib/academy/b2b/verification";
import { listPartnerMemberships } from "@/lib/academy/b2b/db";
import { getVipSubscription } from "@/lib/vip";
import { guestAccess } from "@/lib/apps/access-status";
import type { AppAccessInfo } from "@/lib/apps/access-status";
import {
  fillOrdiApi,
  getOrdiZapisApiCopy,
  ordiZapisValidityLabel,
} from "@/lib/i18n/ordizapis-api-copy";
import {
  ordizapisLoginHref,
  ordizapisSubscribeHref,
} from "@/lib/i18n/ordizapis-app-copy";

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
  userId: string | undefined,
  locale?: string | null
): Promise<DokumentaceEligibility> {
  const copy = getOrdiZapisApiCopy(locale);
  const loginUrl = ordizapisLoginHref(locale);
  const subscribeUrl = ordizapisSubscribeHref(locale);

  if (!userId) {
    const access = guestAccess(loginUrl, subscribeUrl, copy.hostLabel);
    return {
      eligible: false,
      canInstall: false,
      reason: "unauthenticated",
      verifiedDoctor: false,
      facilities: [],
      message: copy.unauthMessage,
      isVip: false,
      access: {
        ...access,
        accountLabel: copy.notSignedIn,
        validityLabel: copy.validityAfterLogin,
      },
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
      message: copy.accountUnavailable,
      isVip: false,
      access: {
        authenticated: true,
        accountLabel: copy.accountMedscope,
        email: null,
        planLabel: copy.cannotVerify,
        entitled: false,
        validUntil: null,
        validityLabel: copy.checkConnection,
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
  const accountLabel = row.full_name || row.email || copy.accountMedscope;

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
      message: copy.notVerifiedMessage,
      isVip: vip.active,
      access: {
        authenticated: true,
        accountLabel,
        email: row.email,
        planLabel: copy.waitingVerification,
        entitled: false,
        validUntil: vip.endsAt,
        validityLabel: ordiZapisValidityLabel({
          locale,
          authenticated: true,
          entitled: false,
          endsAt: vip.endsAt,
        }),
        loginUrl,
        subscribeUrl,
      },
    };
  }

  const planLabel = vip.active ? copy.planPhysicianSub : copy.planVerified;

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
        ? fillOrdiApi(copy.linkedFacilities, {
            name: row.full_name || copy.physicianName,
            facilities: facilities.map((f) => f.name).join(", "),
          })
        : fillOrdiApi(copy.linkedNamed, {
            name: row.full_name || row.email || copy.verifiedPhysicianName,
          }),
    isVip: vip.active,
    access: {
      authenticated: true,
      accountLabel,
      email: row.email,
      planLabel,
      entitled: true,
      validUntil: vip.endsAt,
      validityLabel: ordiZapisValidityLabel({
        locale,
        authenticated: true,
        entitled: true,
        endsAt: vip.endsAt,
      }),
      loginUrl,
      subscribeUrl,
    },
  };
}
