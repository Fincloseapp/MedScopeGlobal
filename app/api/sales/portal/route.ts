import { NextResponse } from "next/server";
import { salesPackageById, formatSalesCzk } from "@/lib/sales/packages";
import {
  findContractByToken,
  listInquiries,
  listInvoices,
  listProspects,
  salesDb,
} from "@/lib/sales/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (token.length < 16) return NextResponse.json({ error: "Chybí přístupový token." }, { status: 400 });
  const db = salesDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const contract = await findContractByToken(db, token);
  if (!contract) return NextResponse.json({ error: "Portál nenalezen." }, { status: 404 });
  const prospects = await listProspects(db, 400);
  const prospect = prospects.find((p) => p.id === contract.prospect_id);
  const invoices = (await listInvoices(db, 200)).filter((row) => row.contract_id === contract.id);
  const inquiries = (await listInquiries(db, 200)).filter((row) => row.contract_id === contract.id);
  const pkg = salesPackageById(contract.package_id);
  return NextResponse.json({
    company: prospect?.company,
    email: prospect?.email,
    packageName: pkg?.name,
    packageId: contract.package_id,
    status: contract.status,
    monthly: formatSalesCzk(contract.monthly_czk),
    paidMonths: contract.paid_months,
    paidTotal: formatSalesCzk(contract.paid_total_czk),
    periodStart: contract.period_start,
    periodEnd: contract.period_end,
    checkoutUrl: contract.status === "pending_payment" ? `/api/sales/checkout?contract_id=${contract.id}` : null,
    landing: `/partneri/${contract.landing_slug}`,
    invoices: invoices.map((row) => ({
      number: row.number,
      status: row.status,
      amount: formatSalesCzk(row.amount_czk),
      vs: row.variable_symbol,
      issuedAt: row.issued_at,
      paidAt: row.paid_at,
    })),
    inquiries: inquiries.map((row) => ({
      status: row.status,
      sender: row.sender_name,
      createdAt: row.created_at,
      forwardedAt: row.forwarded_at,
    })),
  });
}
