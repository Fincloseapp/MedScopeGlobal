import { parseExchangePlan, PLAN_COOKIE, type ExchangePlanSpec, planSpec } from "@/lib/exchange/monetization";
import type { ExchangePlan } from "@/lib/exchange/types";
import { createDataClient } from "@/lib/supabase/data";

export type AdvertiserContext = {
  plan: ExchangePlan;
  spec: ExchangePlanSpec;
  organizationId?: string;
  organizationSlug?: string;
  demo: boolean;
  userId?: string | null;
};

function planFromCookieHeader(header: string | null): ExchangePlan | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${PLAN_COOKIE}=([^;]+)`));
  return match ? parseExchangePlan(decodeURIComponent(match[1] ?? "")) : null;
}

export function planFromRequest(request: Request): ExchangePlan {
  const url = new URL(request.url);
  const as = url.searchParams.get("as") ?? url.searchParams.get("plan");
  if (as) return parseExchangePlan(as);
  return planFromCookieHeader(request.headers.get("cookie")) ?? "basic";
}

export async function getAdvertiserContext(request?: Request): Promise<AdvertiserContext> {
  const demoPlan = request ? planFromRequest(request) : "basic";
  const supabase = await createDataClient();
  if (!supabase || !request) {
    return { plan: demoPlan, spec: planSpec(demoPlan), demo: true };
  }

  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) {
      return { plan: demoPlan, spec: planSpec(demoPlan), demo: true };
    }
    const { data: membership } = await supabase
      .from("exchange_memberships")
      .select("organization_id, role, exchange_organizations(id, slug, plan)")
      .eq("user_id", userId)
      .maybeSingle();
    const org = (membership as { exchange_organizations?: { id: string; slug: string; plan: string } } | null)
      ?.exchange_organizations;
    if (!org) {
      return { plan: demoPlan, spec: planSpec(demoPlan), demo: true, userId };
    }
    const plan = parseExchangePlan(org.plan);
    return {
      plan,
      spec: planSpec(plan),
      organizationId: org.id,
      organizationSlug: org.slug,
      demo: false,
      userId,
    };
  } catch {
    return { plan: demoPlan, spec: planSpec(demoPlan), demo: true };
  }
}

export async function getAdvertiserContextFromCookies(): Promise<AdvertiserContext> {
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    const plan = parseExchangePlan(jar.get(PLAN_COOKIE)?.value);
    return { plan, spec: planSpec(plan), demo: true };
  } catch {
    return { plan: "basic", spec: planSpec("basic"), demo: true };
  }
}
