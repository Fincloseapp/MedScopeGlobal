import { createClient } from "@/lib/supabase/server";

/** Free trial length shown on pricing and passed to Stripe checkout */
export const VIP_TRIAL_DAYS = 14;

/** Characters of article HTML shown before paywall gate */
export const PAYWALL_PREVIEW_CHARS = 720;

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

/** Plain-text teaser for paywall preview */
export function getPaywallPreviewText(html: string, maxChars = PAYWALL_PREVIEW_CHARS): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice).trim();
}

/** Truncated HTML for rendered paywall preview (keeps opening paragraphs) */
export function getPaywallPreviewHtml(html: string, maxChars = PAYWALL_PREVIEW_CHARS): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return html;

  let acc = 0;
  const blockRe = /(<(?:p|h[1-6]|li|blockquote|div)[^>]*>[\s\S]*?<\/(?:p|h[1-6]|li|blockquote|div)>)/gi;
  let match: RegExpExecArray | null;
  const blocks: string[] = [];

  while ((match = blockRe.exec(html)) !== null) {
    const block = match[1];
    const blockText = block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!blockText) continue;
    if (acc + blockText.length > maxChars && blocks.length > 0) break;
    blocks.push(block);
    acc += blockText.length;
    if (acc >= maxChars) break;
  }

  if (blocks.length > 0) return blocks.join("\n");

  const previewText = getPaywallPreviewText(html, maxChars);
  return `<p>${previewText}…</p>`;
}
