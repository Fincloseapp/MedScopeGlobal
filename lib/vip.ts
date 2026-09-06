import { createClient } from "@/lib/supabase/server";
export {
  PAYWALL_PREVIEW_CHARS,
  getPaywallPreviewHtml,
  getPaywallPreviewText,
} from "@/lib/monetization/paywall-preview";

/** Free trial length shown on pricing and passed to Stripe checkout */
export const VIP_TRIAL_DAYS = 14;

export type VipSubscriptionInfo = {
  active: boolean;
  /** ISO timestamp from vip_subscriptions.ends_at when known */
  endsAt: string | null;
};

export async function getVipSubscription(
  userId: string | undefined
): Promise<VipSubscriptionInfo> {
  if (!userId) return { active: false, endsAt: null };
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("vip_subscriptions")
      .select("active, ends_at")
      .eq("user_id", userId)
      .eq("active", true)
      .maybeSingle();

    if (!data?.active) return { active: false, endsAt: null };
    const endsAt = (data.ends_at as string | null) ?? null;
    if (endsAt && new Date(endsAt) < new Date()) {
      return { active: false, endsAt };
    }
    return { active: true, endsAt };
  } catch {
    return { active: false, endsAt: null };
  }
}

export async function getVipStatus(userId: string | undefined) {
  return (await getVipSubscription(userId)).active;
}
