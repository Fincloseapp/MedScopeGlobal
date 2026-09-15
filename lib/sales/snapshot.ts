import { SALES_ICP_SEEDS } from "@/lib/sales/icp";
import { salesCampaignAutoSendEnabled, salesColdAutoSendEnabled, salesMaxEmailsPerRun, salesMaxTouches } from "@/lib/sales/legal";
import { buildCampaignSnapshot } from "@/lib/sales/campaign";
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
import { listMarketplaceListings, marketplaceDb } from "@/lib/marketplace/store";
import { marketplaceAdminNotifyEmail, marketplaceInboxEmail } from "@/lib/marketplace/config";
import { mailReady, mailTransportLabel } from "@/lib/monetization/vialongevita-brief";
import { evaluateSalesControl } from "@/lib/sales/control";
import { lastMarketplaceLoop } from "@/lib/sales/marketplace-loop";

function mailHealth(): SalesSnapshot["marketplace"]["mail"] {
  return {
    ready: mailReady(),
    transport: mailTransportLabel(),
    resend: Boolean(process.env.RESEND_API_KEY?.trim()),
    inbox: marketplaceInboxEmail(),
    adminNotify: marketplaceAdminNotifyEmail(),
  };
}

function controlFromRows(
  mail: SalesSnapshot["marketplace"]["mail"],
  listings: SalesSnapshot["marketplace"]["listings"],
  inquiries: { status: string; sla_due_at: string | null }[],
  invoices: { status: string }[],
  outreach: { status: string }[],
  pendingPayment: number
) {
  const now = Date.now();
  return evaluateSalesControl({
    mailReady: mail.ready,
    unrepliedListings: listings.filter((row) => !row.auto_replied_at).length,
    outreachNeedsApproval: outreach.filter((row) => row.status === "needs_approval").length,
    inquiriesReceived: inquiries.filter((row) => row.status === "received").length,
    inquiriesOverdue: inquiries.filter(
      (row) => row.status === "overdue" || (row.sla_due_at && new Date(row.sla_due_at).getTime() < now && row.status !== "forwarded")
    ).length,
    invoicesOverdue: invoices.filter((row) => row.status === "overdue").length,
    pendingPayment,
    skippedLegal: outreach.filter((row) => row.status === "skipped_legal").length,
  });
}

export async function loadSalesSnapshot(): Promise<SalesSnapshot> {
  const generatedAt = new Date().toISOString();
  const legal = {
    coldAutoSend: salesColdAutoSendEnabled(),
    campaignAutoSend: salesCampaignAutoSendEnabled(),
    maxTouches: salesMaxTouches(),
    maxEmailsPerRun: salesMaxEmailsPerRun(),
    termsPath: "/inzerce/podminky",
    privacyPath: "/privacy",
    unsubscribePath: "/api/sales/unsubscribe",
  };
  const campaignEmpty = buildCampaignSnapshot();
  const mail = mailHealth();

  const empty = (extra?: Partial<SalesSnapshot>): SalesSnapshot => ({
    generatedAt,
    db: false,
    schemaOk: true,
    kpis: emptyKpis(),
    byStage: SALES_STAGES.map((stage) => ({ stage, count: 0 })),
    packages: SALES_PACKAGES,
    prospects: [],
    contracts: [],
    outreach: [],
    invoices: [],
    inquiries: [],
    runs: [],
    marketplace: {
      listings: [],
      mail,
      control: controlFromRows(mail, [], [], [], [], 0),
    },
    loop: lastMarketplaceLoop(),
    campaign: campaignEmpty,
    legal,
    ...extra,
  });

  let db: ReturnType<typeof salesDb>;
  try {
    db = salesDb();
  } catch (err) {
    return empty({ error: err instanceof Error ? err.message : "sales_db_failed" });
  }

  if (!db) {
    return empty({ schemaOk: false });
  }

  let prospects: Awaited<ReturnType<typeof listProspects>> = [];
  let contracts: Awaited<ReturnType<typeof listContracts>> = [];
  let outreach: Awaited<ReturnType<typeof listOutreach>> = [];
  let invoices: Awaited<ReturnType<typeof listInvoices>> = [];
  let inquiries: Awaited<ReturnType<typeof listInquiries>> = [];
  let runs: Awaited<ReturnType<typeof listRuns>> = [];
  try {
    [prospects, contracts, outreach, invoices, inquiries, runs] = await Promise.all([
      listProspects(db, 200),
      listContracts(db, 200),
      listOutreach(db, 80),
      listInvoices(db),
      listInquiries(db),
      listRuns(db),
    ]);
  } catch (err) {
    return empty({
      db: true,
      schemaOk: false,
      error: err instanceof Error ? err.message : "sales_lists_failed",
      campaign: campaignEmpty,
    });
  }

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

  let listings: Awaited<ReturnType<typeof listMarketplaceListings>> = [];
  try {
    const marketDb = marketplaceDb() ?? db;
    listings = await listMarketplaceListings(marketDb, 80);
  } catch {
    listings = [];
  }

  return {
    generatedAt,
    db: true,
    schemaOk: true,
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
    marketplace: {
      listings: listings.map((row) => ({
        id: row.id,
        kind: row.kind,
        status: row.status,
        company: row.company,
        title: row.title,
        source: row.source,
        contact_email: row.contact_email,
        auto_replied_at: row.auto_replied_at,
        created_at: row.created_at,
      })),
      mail: mailHealth(),
      control: controlFromRows(
        mailHealth(),
        listings,
        inquiries,
        invoices,
        outreach,
        kpis.pendingPayment
      ),
    },
    loop: lastMarketplaceLoop(),
    campaign: buildCampaignSnapshot({ contracts, prospects }),
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

export function fallbackSalesSnapshot(error?: string): SalesSnapshot {
  const mail = mailHealth();
  return {
    generatedAt: new Date().toISOString(),
    db: false,
    schemaOk: false,
    error,
    kpis: emptyKpis(),
    byStage: SALES_STAGES.map((stage) => ({ stage, count: 0 })),
    packages: SALES_PACKAGES,
    prospects: [],
    contracts: [],
    outreach: [],
    invoices: [],
    inquiries: [],
    runs: [],
    marketplace: {
      listings: [],
      mail,
      control: controlFromRows(mail, [], [], [], [], 0),
    },
    loop: lastMarketplaceLoop(),
    campaign: buildCampaignSnapshot(),
    legal: {
      coldAutoSend: salesColdAutoSendEnabled(),
      campaignAutoSend: salesCampaignAutoSendEnabled(),
      maxTouches: salesMaxTouches(),
      maxEmailsPerRun: salesMaxEmailsPerRun(),
      termsPath: "/inzerce/podminky",
      privacyPath: "/privacy",
      unsubscribePath: "/api/sales/unsubscribe",
    },
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
