import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { getAdvertiserContext } from "@/lib/exchange/session";
import { entitlementsFor } from "@/lib/exchange/monetization";
import { sanitizeText } from "@/lib/security/sanitize";
import { createDataClient } from "@/lib/supabase/data";
import { logAdminEvent } from "@/lib/logging";
import { recordExchangeMetric } from "@/lib/exchange/observability";

export const dynamic = "force-dynamic";

const schema = z.object({
  body: z.string().min(8).max(4000),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await withApiGuard(request, { action: "exchange_inquiry_reply" });
  if (!guard.ok) return guard.response;

  const ctx = await getAdvertiserContext(request);
  const access = entitlementsFor(ctx.plan);
  if (!access.canReply) {
    recordExchangeMetric("inquiry_reply_blocked", { plan: ctx.plan });
    return NextResponse.json(
      { error: "subscription_required", plan: ctx.plan, upgrade: "/exchange/pricing" },
      { status: 402 }
    );
  }

  const { id } = await params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const body = sanitizeText(parsed.data.body, 4000);
  const supabase = await createDataClient();
  if (supabase) {
    await supabase.from("exchange_inquiry_replies").insert({
      contact_id: id,
      organization_id: ctx.organizationId ?? null,
      body,
    });
    await supabase.from("exchange_contacts").update({ replied_at: new Date().toISOString() }).eq("id", id);
  }

  await logAdminEvent("exchange_inquiry_reply", { id, plan: ctx.plan });
  recordExchangeMetric("inquiry_reply", { plan: ctx.plan });
  return NextResponse.json({ ok: true, plan: ctx.plan });
}
