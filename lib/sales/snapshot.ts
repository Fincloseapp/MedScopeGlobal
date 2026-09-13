import { applySalesDepartmentSchema } from "@/lib/sales/apply-schema";
import { SALES_ICP_SEEDS } from "@/lib/sales/icp";
import { salesColdAutoSendEnabled, salesMaxEmailsPerRun, salesMaxTouches } from "@/lib/sales/legal";
import { SALES_PACKAGES } from "@/lib/sales/packages";
import {
  listContracts,
  listInquiries,
  listInvoices,
  listOutreach,
  listProspects,
  listRuns,
  salesDb,
} from "@/lib/sales/store";
import { SALES_STAGES, type SalesSnapshot, type SalesStage } from "@/lib/sales/types";
import { startOfMonthIso } from "@/lib/sales/ids";

export async function loadSalesSnapshot(): Promise<SalesSnapshot> {
  const generatedAt = new Date().toISOString();
  const schema = await applySalesDepartmentSchema();
  const db = salesDb();
  const legal = {
    coldAutoSend: salesColdAutoSendEnabled(),
    maxTouches: salesMaxTouches(),
    maxEmailsPerRun: salesMaxEmailsPerRun(),
    termsPath: "/inzerce/podminky",
    privacyPath: "/privacy",
    unsubscribePath: "/api/sales/unsubscribe",
  };

  if (!db) {
    return {
      generatedAt,
      db: false,
      schemaOk: schema.ok,
      kpis: emptyKpis(),
      byStage: SALES_STAGES.map((stage) => ({ stage, count: 0 })),
      packages: SALES_PACKAGES,
      prospects: [],
      contracts: [],
      outreach: [],
      invoices: [],
      inquiries: [],
      runs: [],
      legal,
    };
  }

  const [prospects, contracts, outreach, invoices, inquiries, runs] = await Promise.all([
    listProspects(db),
    listContracts(db),
    listOutreach(db),
    listInvoices(db),
    listInquiries(db),
    listRuns(db),
  ]);

  const prospectName = new Map(prospects.map((p) => [p.id, p]));
  const month = startOfMonthIso();
  const inquiryCount = new Map<string, number>();
  for (const row of inquiries) {
    if (!row.contract_id) continue;
    inquiryCount.set(row.contract_id, (inquiryCount.get(row.contract_id) ?? 0) + 1);
  }
  const lastInvoice = new Map<string, (typeof invoices)[number]>();
  for (const inv of invoices) {
    if (!lastInvoice.has(inv.contract_id)) lastInvoice.set(inv.contract_id, inv);
  }

  const byStageMap = new Map<SalesStage, number>();
  for (const stage of SALES_STAGES) byStageMap.set(stage, 0);
  for (const p of prospects) {
    byStageMap.set(p.stage, (byStageMap.get(p.stage) ?? 0) + 1);
  }

  const active = contracts.filter((c) => c.status === "active");
  const kpis = {
    prospects: prospects.length || SALES_ICP_SEEDS.length,
    inPipeline: prospects.filter((p) =>
      ["qualified", "outreach_queued", "contacted", "engaged", "offered", "negotiating", "contract_sent"].includes(
        p.stage
      )
    ).length,
    activeAdvertisers: active.length,
    pendingPayment: contracts.filter((c) => c.status === "pending_payment").length,
    mrrCzk: active.reduce((sum, c) => sum + (c.monthly_czk || 0), 0),
    paidThisMonthCzk: invoices
      .filter((i) => i.status === "paid" && i.paid_at && i.paid_at >= month)
      .reduce((sum, i) => sum + i.amount_czk, 0),
    unpaidCzk: invoices
      .filter((i) => i.status === "issued" || i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + i.amount_czk, 0),
    inquiriesThisMonth: inquiries.filter((i) => i.created_at >= month).length,
    forwardedThisMonth: inquiries.filter((i) => i.forwarded_at && i.forwarded_at >= month).length,
    outreachQueued: outreach.filter((o) => o.status === "queued").length,
    outreachNeedsApproval: outreach.filter((o) => o.status === "needs_approval").length,
  };

  return {
    generatedAt,
    db: true,
    schemaOk: schema.ok,
    kpis,
    byStage: SALES_STAGES.map((stage) => ({ stage, count: byStageMap.get(stage) ?? 0 })),
    packages: SALES_PACKAGES,
    prospects,
    contracts: contracts.map((c) => ({
      ...c,
      company: prospectName.get(c.prospect_id)?.company ?? "—",
      email: prospectName.get(c.prospect_id)?.email ?? null,
      inquiryCount: inquiryCount.get(c.id) ?? 0,
      lastInvoiceStatus: lastInvoice.get(c.id)?.status ?? null,
    })),
    outreach: outreach.map((o) => ({
      ...o,
      company: prospectName.get(o.prospect_id)?.company ?? "—",
      email: prospectName.get(o.prospect_id)?.email ?? null,
    })),
    invoices: invoices.map((i) => ({
      ...i,
      company: prospectName.get(i.prospect_id)?.company ?? "—",
    })),
    inquiries: inquiries.map((i) => ({
      ...i,
      advertiser: i.company_name,
    })),
    runs,
    legal,
  };
}

function emptyKpis(): SalesSnapshot["kpis"] {
  return {
    prospects: SALES_ICP_SEEDS.length,
    inPipeline: 0,
    activeAdvertisers: 0,
    pendingPayment: 0,
    mrrCzk: 0,
    paidThisMonthCzk: 0,
    unpaidCzk: 0,
    inquiriesThisMonth: 0,
    forwardedThisMonth: 0,
    outreachQueued: 0,
    outreachNeedsApproval: 0,
  };
}

export async function listPublicPartners() {
  const db = salesDb();
  if (!db) return [];
  const [contracts, prospects] = await Promise.all([listContracts(db, 80), listProspects(db, 200)]);
  const names = new Map(prospects.map((p) => [p.id, p]));
  return contracts
    .filter((c) => c.status === "active")
    .map((c) => {
      const p = names.get(c.prospect_id);
      return {
        slug: c.landing_slug,
        company: p?.company ?? "Partner",
        offer: c.offer_text,
        website: p?.website,
        packageId: c.package_id,
        targetUrl: c.target_url || p?.website,
      };
    });
}
