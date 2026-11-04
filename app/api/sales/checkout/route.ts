import { NextResponse } from "next/server";
import { SITE } from "@/lib/config/site";
import { createRetainerCheckoutUrl } from "@/lib/sales/billing";
import { findContractById, listProspects, salesDb, updateContract } from "@/lib/sales/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const contractId = new URL(request.url).searchParams.get("contract_id");
  if (!contractId) return NextResponse.json({ error: "Missing contract_id" }, { status: 400 });
  const db = salesDb(null);
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const contract = await findContractById(db, contractId);
  if (!contract) return NextResponse.json({ error: "Smlouva nenalezena." }, { status: 404 });
  if (contract.stripe_checkout_url && contract.status === "pending_payment") {
    return NextResponse.redirect(contract.stripe_checkout_url);
  }
  const prospects = await listProspects(db, 400);
  const prospect = prospects.find((p) => p.id === contract.prospect_id);
  if (!prospect) return NextResponse.json({ error: "Kontakt nenalezen." }, { status: 404 });
  try {
    const url = await createRetainerCheckoutUrl(contract, prospect);
    if (!url) {
      return NextResponse.redirect(`${SITE.url.replace(/\/$/, "")}/inzerenti/portal?token=${encodeURIComponent(contract.portal_token)}&stripe=0`);
    }
    await updateContract(db, contract.id, { stripe_checkout_url: url });
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Stripe checkout selhal." }, { status: 503 });
  }
}
