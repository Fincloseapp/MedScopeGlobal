import { getSessionProfile } from "@/lib/auth/session";
import { getVipSubscription } from "@/lib/vip";
import { MEDIFLOW } from "@/lib/apps/catalog";
import { buildValidityLabel, guestAccess, type AppAccessInfo } from "@/lib/apps/access-status";
import type { MediFlowSession } from "@/lib/mediflow/types";

export type { MediFlowSession };

const SUBSCRIBE = "/predplatne#public";

export async function getMediFlowSession(): Promise<MediFlowSession & {
  authenticated: boolean;
  userId: string | null;
  access: AppAccessInfo;
  loginUrl: string;
}> {
  const loginUrl = `/login?redirect=${encodeURIComponent(MEDIFLOW.appPath)}`;
  const { user, profile } = await getSessionProfile();

  if (!user) {
    return {
      ...GUEST_SESSION(loginUrl),
      authenticated: false,
      userId: null,
      access: guestAccess(loginUrl, SUBSCRIBE, "Host · lokální data"),
      loginUrl,
    };
  }

  const vip = await getVipSubscription(user.id);
  const email = user.email ?? profile?.email ?? null;
  const planLabel = vip.active ? "VIP MediFlow" : "Zdarma";
  const access: AppAccessInfo = {
    authenticated: true,
    accountLabel: profile?.full_name ?? email ?? "Účet",
    email,
    planLabel,
    entitled: vip.active,
    validUntil: vip.endsAt,
    validityLabel: buildValidityLabel({
      authenticated: true,
      entitled: vip.active,
      endsAt: vip.endsAt,
    }),
    loginUrl,
    subscribeUrl: SUBSCRIBE,
  };

  return {
    email,
    isGuest: false,
    isVip: vip.active,
    syncedAt: new Date().toISOString(),
    authenticated: true,
    userId: user.id,
    access,
    loginUrl,
  };
}

function GUEST_SESSION(loginUrl: string): MediFlowSession {
  return {
    email: null,
    isGuest: true,
    isVip: false,
    syncedAt: null,
  };
}
