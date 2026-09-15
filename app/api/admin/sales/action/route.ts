import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminGateOpen } from "@/lib/auth/admin-gate";
import { requireAdminAccess } from "@/lib/auth/require-admin-access";
import { sanitizeText } from "@/lib/security/sanitize";
import { runSalesDepartmentTick } from "@/lib/sales/runner";
import { approveOutreach } from "@/lib/sales/outreach";
import { emailSalesInvoice, markInvoicePaid } from "@/lib/sales/billing";
import { pauseFulfillment, resumeFulfillment } from "@/lib/sales/fulfillment";
import { slugifyCompany } from "@/lib/sales/ids";
import { normalizeSalesEmail } from "@/lib/sales/legal";
import {
  findContractById,
  findProspectBySlug,
  insertProspect,
  insertSuppression,
  listInvoices,
  listOutreach,
  listProspects,
  salesDb,
  updateContract,
  updateOutreach,
  updateProspect,
} from "@/lib/sales/store";

export const dynamic = "force-dynamic";

const schema = z.object({
  action: z.enum([
    "run_tick",
    "approve_outreach",
    "reject_outreach",
    "mark_paid",
    "pause_contract",
    "resume_contract",
    "send_invoice",
    "add_prospect",
    "suppress",
    "run_marketplace_loop",
  ]),
  id: z.string().optional(),
  company: z.string().max(200).optional(),
  email: z.string().max(200).optional(),
  website: z.string().max(240).optional(),
  sector: z.string().max(40).optional(),
  reason: z.string().max(400).optional(),
});

export async function POST(request: Request) {
  try {
    if (!(await isAdminGateOpen())) {
      await requireAdminAccess();
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (body.action === "run_tick") {
    const result = await runSalesDepartmentTick();
    return NextResponse.json(result);
  }

  if (body.action === "run_marketplace_loop") {
    const { runMarketplaceLoopModel } = await import("@/lib/sales/marketplace-loop");
    const result = await runMarketplaceLoopModel({ persist: true });
    return NextResponse.json(result);
  }

  const db = salesDb(null);
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  if (body.action === "add_prospect") {
    const company = sanitizeText(body.company ?? "", 200);
    const email = normalizeSalesEmail(body.email ?? "");
    if (!company || !email) return NextResponse.json({ error: "company_and_email_required" }, { status: 400 });
    const slugBase = slugifyCompany(company);
    const slug = (await findProspectBySlug(db, slugBase)) ? `${slugBase}-manual` : slugBase;
    const row = await insertProspect(db, {
      company,
      slug,
      email,
      website: body.website ? sanitizeText(body.website, 240) : null,
      sector: (body.sector as "clinic") ?? "clinic",
      country: "CZ",
      stage: "qualified",
      legal_basis: "inquiry",
      score: 70,
      source: "admin",
    });
    return NextResponse.json({ ok: Boolean(row), id: row?.id });
  }

  if (body.action === "suppress") {
    const email = normalizeSalesEmail(body.email ?? "");
    if (!email) return NextResponse.json({ error: "email_required" }, { status: 400 });
    await insertSuppression(db, email, body.reason || "admin");
    const prospects = await listProspects(db, 400);
    const hit = prospects.find((p) => p.email === email);
    if (hit) await updateProspect(db, hit.id, { suppressed_at: new Date().toISOString(), stage: "suppressed" });
    return NextResponse.json({ ok: true });
  }

  if (!body.id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  if (body.action === "approve_outreach" || body.action === "reject_outreach") {
    const rows = await listOutreach(db, 200);
    const row = rows.find((item) => item.id === body.id);
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (body.action === "approve_outreach") await approveOutreach(db, row);
    else {
      await updateOutreach(db, row.id, { status: "skipped_legal", skip_reason: body.reason || "admin_reject" });
      await updateProspect(db, row.prospect_id, { stage: "lost" });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "mark_paid" || body.action === "send_invoice") {
    const invoices = await listInvoices(db, 300);
    const invoice = invoices.find((item) => item.id === body.id);
    if (!invoice) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const contract = await findContractById(db, invoice.contract_id);
    const prospects = await listProspects(db, 400);
    const prospect = prospects.find((p) => p.id === invoice.prospect_id);
    if (!contract || !prospect) return NextResponse.json({ error: "missing_contract" }, { status: 404 });
    if (body.action === "mark_paid") {
      await markInvoicePaid(db, invoice, contract, "bank_transfer");
      return NextResponse.json({ ok: true });
    }
    const mailed = await emailSalesInvoice(invoice, prospect, contract);
    return NextResponse.json(mailed);
  }

  if (body.action === "pause_contract" || body.action === "resume_contract") {
    const contract = await findContractById(db, body.id);
    if (!contract) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (body.action === "pause_contract") await pauseFulfillment(db, contract);
    else await resumeFulfillment(db, contract);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
