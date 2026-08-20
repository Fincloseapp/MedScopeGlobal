import { getSessionProfile } from "@/lib/auth/session";
import { getVipStatus } from "@/lib/vip";
import { MEDIPACIENT } from "@/lib/apps/catalog";
import type { PacientSession } from "@/lib/medipacient/types";

export type { PacientSession };

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
    };
  }
  const isVip = await getVipStatus(user.id);
  return {
    authenticated: true,
    entitled: true,
    owner: true,
    isVip,
    reason: "ok",
    userId: user.id,
    email: user.email ?? profile?.email ?? null,
    displayName: profile?.full_name ?? user.email ?? null,
    role: profile?.role ?? null,
    message: isVip
      ? "Premium účet — pokročilá analýza a připomínky jsou odemčené."
      : "Zkušební zprávy i vaše nahrávky. Předplatné Veřejnost odemyká připomínky navíc.",
    loginUrl,
    appUrl: MEDIPACIENT.appPath,
    canUpload: true,
    limits: { timeline: true, upload: true },
  };
}
