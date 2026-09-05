import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export type MonetizationEventName =
  | "affiliate_click"
  | "newsletter_subscribe"
  | "house_ad_click"
  | "subscribe_nudge_click"
  | "article_tip_start"
  | "b2b_form_submit";

/** Best-effort insert into public.analytics. Never throws. */
export async function logMonetizationEvent(
  event: MonetizationEventName,
  payload: Record<string, unknown> = {}
): Promise<void> {
  try {
    const admin = tryCreateServiceRoleClient();
    if (!admin) return;
    await admin.from("analytics").insert({
      event,
      payload,
    });
  } catch {
    /* analytics table or credentials may be missing */
  }
}
