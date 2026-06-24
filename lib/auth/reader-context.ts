import { getSessionProfile } from "@/lib/auth/session";
import type { AccessLevelId } from "@/lib/config/access-levels";
import { getVipStatus } from "@/lib/vip";

export async function getReaderContext() {
  const { user, profile } = await getSessionProfile();
  const isVip = await getVipStatus(user?.id);
  const accessLevel = (profile?.access_level as AccessLevelId) ?? "public";
  return { user, profile, isVip, accessLevel };
}
