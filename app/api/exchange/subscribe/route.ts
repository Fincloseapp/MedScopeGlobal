import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { PLAN_COOKIE, parseExchangePlan, entitlementsFor, EXCHANGE_COMMISSION } from "@/lib/exchange/monetization";
import { logAdminEvent } from "@/lib/logging";
import { recordExchangeMetric } from "@/lib/exchange/observability";

export const dynamic = "force-dynamic";

const schema = z.object({
  plan: z.enum(["basic", "pro", "enterprise"]),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_subscribe" });
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const plan = parseExchangePlan(parsed.data.plan);
  const access = entitlementsFor(plan);
  await logAdminEvent("exchange_subscribe", { plan, paid: access.paid });
  recordExchangeMetric("subscribe", { plan, paid: access.paid });

  const res = NextResponse.json({
    ok: true,
    plan,
    paid: access.paid,
    dealCommissionPercent: EXCHANGE_COMMISSION.dealCommissionPercent,
    demo: true,
  });
  res.cookies.set(PLAN_COOKIE, plan, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
