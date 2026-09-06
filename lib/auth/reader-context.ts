import {
  editorialAccessFromFlags,
  hasActiveReaderSubscription,
} from "@/lib/auth/editorial-access";
import { getSessionProfile } from "@/lib/auth/session";
import type { AccessLevelId } from "@/lib/config/access-levels";
import { getVipStatus } from "@/lib/vip";

const ANONYMOUS = {
  user: null,
  profile: null,
  isVip: false,
  accessLevel: "public" as AccessLevelId,
  hasEditorialAccess: false,
};

async function loadReaderContext() {
  const { user, profile } = await getSessionProfile();
  const accessLevel = (profile?.access_level as AccessLevelId) ?? "public";
  const [isVip, hasPaidSubscription] = await Promise.all([
    getVipStatus(user?.id),
    hasActiveReaderSubscription(user?.id),
  ]);
  const hasEditorialAccess = editorialAccessFromFlags({
    isVip,
    accessLevel,
    hasPaidSubscription,
  });
  return { user, profile, isVip, accessLevel, hasEditorialAccess };
}

/** Session + VIP. Times out to anonymous so magazine HTML never waits on Auth. */
export async function getReaderContext() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      loadReaderContext(),
      new Promise<typeof ANONYMOUS>((resolve) => {
        timer = setTimeout(() => resolve(ANONYMOUS), 800);
      }),
    ]);
  } catch (error) {
    console.error("getReaderContext", error);
    return ANONYMOUS;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
