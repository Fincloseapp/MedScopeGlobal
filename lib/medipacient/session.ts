import { getSessionProfile } from "@/lib/auth/session";
import { getVipSubscription } from "@/lib/vip";
import { MEDIPACIENT } from "@/lib/apps/catalog";
import { buildValidityLabel, guestAccess, type AppAccessInfo } from "@/lib/apps/access-status";
import type { PacientSession } from "@/lib/medipacient/types";

export type { PacientSession };

const SUBSCRIBE = "/predplatne#public";

export async function getPacientSession(): Promise<PacientSession> {
  const { user, profile } = await getSessionProfile();
  const loginUrl = `/login?next=${encodeURIComponent(MEDIPACIENT.appPath)}`;
  if (!user) {
    return {
      authenticated: false,
      entitled: false,
      owner: false,
      isVip: false,
      reason: "unauthenticated",
      userId: null,
      email: null,
      displayName: null,
      role: null,
      message:
        "Přihlaste se stejným účtem MedScopeGlobal — pak MeDipacient funguje v prohlížeči i v telefonu.",
      loginUrl,
      appUrl: MEDIPACIENT.appPath,
      canUpload: false,
      limits: { timeline: true, upload: false },
      access: guestAccess(loginUrl, SUBSCRIBE, "Host · zkušební zprávy"),
    };
  }
  const vip = await getVipSubscription(user.id);
  const email = user.email ?? profile?.email ?? null;
  const displayName = profile?.full_name ?? user.email ?? null;
  const planLabel = vip.active ? "Veřejnost · Premium" : "Přihlášeni · základní";
  const access: AppAccessInfo = {
    authenticated: true,
    accountLabel: displayName || email || "Účet MedScope",
    email,
    planLabel,
    entitled: true,
    validUntil: vip.endsAt,
    validityLabel: buildValidityLabel({
      authenticated: true,
      entitled: true,
      endsAt: vip.endsAt,
    }),
    loginUrl,
    subscribeUrl: SUBSCRIBE,
  };
  return {
    authenticated: true,
    entitled: true,
    owner: true,
    isVip: vip.active,
    reason: "ok",
    userId: user.id,
    email,
    displayName,
    role: profile?.role ?? null,
    message: vip.active
      ? "Premium účet — pokročilá analýza a připomínky jsou odemčené."
      : "Zkušební zprávy i vaše nahrávky. Předplatné Veřejnost odemyká připomínky navíc.",
    loginUrl,
    appUrl: MEDIPACIENT.appPath,
    canUpload: true,
    limits: { timeline: true, upload: true },
    access,
  };
}
