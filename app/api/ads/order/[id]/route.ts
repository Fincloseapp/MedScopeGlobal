import { NextResponse } from "next/server";
import { invoiceFromAdRequest } from "@/lib/ads/issue-ad-invoice";
import { buildSpdString, getLegalBankAccount, getLegalIban } from "@/lib/billing/spd-qr";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 401 });
  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("ads_requests").select("*").eq("id", id).maybeSingle();
  if (error || !data || data.approval_token !== token) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const invoice = invoiceFromAdRequest(data);
  const spd = buildSpdString({
    amountCzk: Number(data.price ?? 0),
    variableSymbol: String(data.variable_symbol ?? ""),
    message: `Inzerce ${data.company}`,
  });
  return NextResponse.json({
    id: data.id,
    company: data.company,
    status: data.status,
    decision: data.decision ?? null,
    price: data.price,
    type: data.type,
    position: data.position,
    ad_text: data.ad_text,
    banner_url: data.banner_url,
    variableSymbol: data.variable_symbol ?? null,
    invoiceHtml: invoice.html,
    invoiceNumber: invoice.transactionId,
    iban: getLegalIban(),
    bankAccount: getLegalBankAccount(),
    hasQr: Boolean(spd),
    stripeReady: data.status === "approved" || data.decision === "allowed",
  });
}
