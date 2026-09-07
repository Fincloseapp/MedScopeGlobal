import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/auth/require-admin-access";
import { activateAdFromCheckout } from "@/lib/ads/activate-from-payment";
import {
  buildPaymentUrl,
  sendAdApprovalEmail,
  sendAdDeniedEmail,
} from "@/lib/services/ads-mail";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().min(1),
  decision: z.enum(["allowed", "denied"]),
  reason: z.string().max(800).optional(),
  markPaid: z.boolean().optional(),
});

export async function POST(request: Request) {
  let actor = "admin";
  try {
    const access = await requireAdminAccess();
    actor = access.supabaseUserId ?? "admin-gate";
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const admin = tryCreateServiceRoleClient();
  if (!admin) return NextResponse.json({ error: "db" }, { status: 503 });
  const { data: req } = await admin.from("ads_requests").select("*").eq("id", body.id).maybeSingle();
  if (!req) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const status = body.decision === "allowed" ? "approved" : "rejected";
  await admin
    .from("ads_requests")
    .update({
      status,
      decision: body.decision,
      decided_at: new Date().toISOString(),
      decided_by: actor,
      denial_reason: body.decision === "denied" ? body.reason ?? "Nesplňuje pravidla inzerce." : null,
      approved_at: body.decision === "allowed" ? new Date().toISOString() : req.approved_at,
    })
    .eq("id", body.id);

  const fresh = {
    ...req,
    status,
    decision: body.decision,
    denial_reason: body.reason,
  };

  if (body.decision === "denied") {
    await sendAdDeniedEmail(fresh, body.reason ?? "Nesplňuje právní, bezpečnostní nebo diplomatická pravidla.");
  } else {
    await sendAdApprovalEmail(fresh, buildPaymentUrl(req.id));
    if (body.markPaid) {
      await activateAdFromCheckout("bank-admin", req.id, "bank_transfer");
    }
  }

  return NextResponse.json({ ok: true, decision: body.decision });
}
