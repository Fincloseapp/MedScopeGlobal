import {
  editorialAccessFromFlags,
  hasActiveReaderSubscription,
  hasEditorialCookieAccess,
} from "@/lib/auth/editorial-access";
import { getSessionProfile } from "@/lib/auth/session";
import type { AccessLevelId } from "@/lib/config/access-levels";
import { getVipStatus } from "@/lib/vip";
import type { AppUser } from "@/types/database";

export type ReaderContext = {
  user: { id: string; email?: string | null } | null;
  profile: AppUser | null;
  isVip: boolean;
  accessLevel: AccessLevelId;
  hasEditorialAccess: boolean;
};

const ANONYMOUS: ReaderContext = {
  user: null,
  profile: null,
  isVip: false,
  accessLevel: "public",
  hasEditorialAccess: false,
};

async function loadReaderContext(): Promise<ReaderContext> {
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
export async function getReaderContext(): Promise<ReaderContext> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cookieAccess = await hasEditorialCookieAccess();
  const withCookie = (ctx: ReaderContext): ReaderContext =>
    cookieAccess ? { ...ctx, hasEditorialAccess: true } : ctx;
  try {
    const ctx = await Promise.race([
      loadReaderContext(),
      new Promise<ReaderContext>((resolve) => {
        timer = setTimeout(() => resolve(ANONYMOUS), 800);
      }),
    ]);
    return withCookie(ctx);
  } catch (error) {
    console.error("getReaderContext", error);
    return withCookie(ANONYMOUS);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
