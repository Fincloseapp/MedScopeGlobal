import { sendEmail } from "@/lib/email/engine";
import { runAdEditorBoard } from "@/lib/ads/ad-editors";
import { applySalesDepartmentSchema } from "@/lib/sales/apply-schema";
import { applyMarketplaceDeskSchema } from "@/lib/marketplace/schema";
import { listMarketplaceListings, updateMarketplaceListing } from "@/lib/marketplace/store";
import { sendMarketplaceAck, sendMarketplaceAutoReply } from "@/lib/marketplace/mail";
import { classifyMarketplaceMessage } from "@/lib/marketplace/auto-reply";
import { salesDunningEmail, salesPortalUrl } from "@/lib/sales/copy";
import { evaluateSalesControl } from "@/lib/sales/control";
import { icpNeedsHumanReview, SALES_ICP_SEEDS } from "@/lib/sales/icp";
import { addMonthsIso, dateOnly, randomToken, slugifyCompany } from "@/lib/sales/ids";
import { salesMaxEmailsPerRun } from "@/lib/sales/legal";
import { recommendedPackageId, queueOfferIfNeeded, sendQueuedOutreach } from "@/lib/sales/outreach";
import {
  emailSalesInvoice,
  issueRetainerInvoice,
} from "@/lib/sales/billing";
import { activateFulfillment, pauseFulfillment } from "@/lib/sales/fulfillment";
import { salesPackageById } from "@/lib/sales/packages";
import {
  findProspectByEmail,
  findProspectBySlug,
  findProspectByWebsite,
  insertEvent,
  insertProspect,
  insertRun,
  listContracts,
  listInquiries,
  listInvoices,
  listOutreach,
  listProspects,
  listSuppressions,
  salesDb,
  updateContract,
  updateInquiry,
  updateInvoice,
  updateProspect,
} from "@/lib/sales/store";
import type { SalesProspect, SalesTickResult } from "@/lib/sales/types";
import { mailReady } from "@/lib/monetization/vialongevita-brief";

function idleControl(skippedLegal = 0) {
  return evaluateSalesControl({
    mailReady: mailReady(),
    unrepliedListings: 0,
    outreachNeedsApproval: 0,
    inquiriesReceived: 0,
    inquiriesOverdue: 0,
    invoicesOverdue: 0,
    pendingPayment: 0,
    skippedLegal,
  });
}

function emptyTick(partial: Partial<SalesTickResult> & { startedAt: string }): SalesTickResult {
  return {
    ok: false,
    schemaOk: false,
    db: false,
    seeded: 0,
    ingested: 0,
    queued: 0,
    sent: 0,
    skippedLegal: 0,
    invoicesIssued: 0,
    invoicesSent: 0,
    fulfilled: 0,
    inquiriesForwarded: 0,
    paused: 0,
    errors: [],
    finishedAt: new Date().toISOString(),
    control: idleControl(),
    ...partial,
  };
}

export async function runSalesDepartmentTick(): Promise<SalesTickResult> {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  const schema = await applySalesDepartmentSchema();
  await applyMarketplaceDeskSchema();
  const db = salesDb(null);
  if (!db) {
    return emptyTick({
      startedAt,
      schemaOk: schema.ok,
      errors: ["service_role_unavailable", schema.error ?? ""].filter(Boolean),
    });
  }

  let seeded = 0;
  let ingested = 0;
  let queued = 0;
  let sent = 0;
  let skippedLegal = 0;
  let invoicesIssued = 0;
  let invoicesSent = 0;
  let fulfilled = 0;
  let inquiriesForwarded = 0;
  let paused = 0;

  try {
    for (const seed of SALES_ICP_SEEDS) {
      const slug = slugifyCompany(seed.company);
      const existing =
        (await findProspectBySlug(db, slug)) ?? (await findProspectByWebsite(db, seed.website));
      if (existing) continue;
      const row = await insertProspect(db, {
        company: seed.company,
        slug,
        website: seed.website,
        sector: seed.sector,
        country: seed.country,
        stage: icpNeedsHumanReview(seed.sector) ? "identified" : "qualified",
        legal_basis: "none",
        score: icpNeedsHumanReview(seed.sector) ? 45 : 62,
        notes: seed.why,
        source: "icp",
      });
      if (row) seeded += 1;
    }

    try {
      const pending = await listMarketplaceListings(db, 80);
      for (const listing of pending) {
        if (listing.auto_replied_at || !listing.contact_email) continue;
        const topic = classifyMarketplaceMessage(`${listing.title} ${listing.summary}`);
        const replied =
          listing.kind === "question"
            ? await sendMarketplaceAutoReply({ to: listing.contact_email, topic, listing })
            : await sendMarketplaceAck(listing);
        if (replied.ok) {
          await updateMarketplaceListing(db, listing.id, {
            auto_replied_at: new Date().toISOString(),
            reply_topic: topic,
          });
        }
      }
    } catch {
      /* marketplace tables may not exist yet */
    }

    const { data: requests } = await db
      .from("ads_requests")
      .select("id,company,email,contact_person,ico,dic,buyer_address,status,url,ad_text,price,created_at")
      .order("created_at", { ascending: false })
      .limit(80);
    for (const req of requests ?? []) {
      const email = String(req.email ?? "").trim().toLowerCase();
      if (!email) continue;
      let prospect = await findProspectByEmail(db, email);
      if (!prospect) {
        const slugBase = slugifyCompany(String(req.company ?? email.split("@")[0]));
        const slug = (await findProspectBySlug(db, slugBase)) ? `${slugBase}-in` : slugBase;
        prospect = await insertProspect(db, {
          company: String(req.company ?? "Inzerent"),
          slug,
          email,
          contact_name: req.contact_person ? String(req.contact_person) : null,
          ico: req.ico ? String(req.ico) : null,
          dic: req.dic ? String(req.dic) : null,
          address: req.buyer_address ? String(req.buyer_address) : null,
          website: req.url ? String(req.url) : null,
          sector: "clinic",
          country: "CZ",
          stage: req.status === "active" ? "won" : "offered",
          legal_basis: "inquiry",
          score: 88,
          notes: `Inbound ads_request ${req.id}`,
          source: "ads_request",
        });
        if (prospect) ingested += 1;
      } else if (prospect.legal_basis === "none" || prospect.legal_basis === "unverified_guess") {
        await updateProspect(db, prospect.id, {
          legal_basis: "inquiry",
          email,
          stage: prospect.stage === "identified" ? "offered" : prospect.stage,
        });
        ingested += 1;
      }
    }

    try {
      const { data: inquiries } = await db
        .from("b2b_inquiries")
        .select("id,company,email,name,created_at")
        .order("created_at", { ascending: false })
        .limit(40);
      for (const row of inquiries ?? []) {
        const email = String(row.email ?? "").trim().toLowerCase();
        if (!email) continue;
        const existing = await findProspectByEmail(db, email);
        if (existing) continue;
        const inserted = await insertProspect(db, {
          company: String(row.company ?? "Firma"),
          slug: slugifyCompany(String(row.company ?? email)),
          email,
          contact_name: row.name ? String(row.name) : null,
          sector: "clinic",
          country: "CZ",
          stage: "offered",
          legal_basis: "inquiry",
          score: 80,
          source: "b2b_inquiry",
          notes: `b2b_inquiries ${row.id}`,
        });
        if (inserted) ingested += 1;
      }
    } catch {
      /* table may not exist */
    }

    const suppressed = await listSuppressions(db);
    const prospects = await listProspects(db, 400);
    for (const prospect of prospects) {
      if (prospect.email && suppressed.has(prospect.email) && !prospect.suppressed_at) {
        await updateProspect(db, prospect.id, { suppressed_at: new Date().toISOString(), stage: "suppressed" });
      }
    }

    const fresh = await listProspects(db, 400);
    const outreachRows = await listOutreach(db, 400);
    const alreadyQueued = new Set(
      outreachRows
        .filter((row) => ["queued", "needs_approval", "approved", "sent"].includes(row.status))
        .map((row) => row.prospect_id)
    );
    for (const prospect of fresh) {
      if (!prospect.email) continue;
      if (prospect.stage === "suppressed" || prospect.stage === "won" || prospect.stage === "fulfilling") continue;
      if (alreadyQueued.has(prospect.id) || prospect.outreach_count > 0) continue;
      const result = await queueOfferIfNeeded(db, prospect, suppressed);
      if (result.queued) queued += 1;
    }

    const send = await sendQueuedOutreach(db, suppressed, salesMaxEmailsPerRun());
    sent += send.sent;
    skippedLegal += send.skippedLegal;

    const contracts = await listContracts(db, 300);
    const prospectById = new Map(fresh.map((p) => [p.id, p]));

    for (const contract of contracts) {
      const prospect = prospectById.get(contract.prospect_id);
      if (!prospect) continue;
      if (contract.status === "active" && (!contract.ads_ids || contract.ads_ids.length === 0)) {
        const pkg = salesPackageById(contract.package_id);
        if (pkg && pkg.placements.length > 0) {
          const out = await activateFulfillment(db, contract, prospect);
          if (out.adsIds.length) fulfilled += 1;
        } else {
          fulfilled += 1;
        }
        await updateProspect(db, prospect.id, { stage: "fulfilling" });
      }

      if (contract.status === "pending_payment" || contract.status === "active") {
        const invoices = (await listInvoices(db, 200)).filter((inv) => inv.contract_id === contract.id);
        const open = invoices.find((inv) => inv.status === "issued" || inv.status === "sent" || inv.status === "overdue");
        const needsNew =
          contract.status === "pending_payment"
            ? !open
            : Boolean(
                contract.period_end &&
                  new Date(contract.period_end).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
                  !open
              );
        if (needsNew && !contract.stripe_subscription_id) {
          const start = new Date();
          const end = new Date(addMonthsIso(start, 1));
          const invoice = await issueRetainerInvoice(db, contract, prospect, start, end);
          if (invoice) {
            invoicesIssued += 1;
            const mailed = await emailSalesInvoice(invoice, prospect, contract);
            if (mailed.ok) {
              invoicesSent += 1;
              await updateInvoice(db, invoice.id, { status: "sent", sent_at: new Date().toISOString() });
            }
          }
        }
      }
    }

    const invoices = await listInvoices(db, 250);
    const now = Date.now();
    for (const invoice of invoices) {
      if ((invoice.status === "issued" || invoice.status === "sent") && new Date(invoice.due_at).getTime() < now) {
        await updateInvoice(db, invoice.id, { status: "overdue" });
        const contract = contracts.find((c) => c.id === invoice.contract_id);
        const prospect = contract ? prospectById.get(contract.prospect_id) : null;
        if (contract && prospect?.email) {
          const letter = salesDunningEmail(
            prospect.company,
            invoice.number,
            invoice.variable_symbol,
            invoice.amount_czk,
            contract.stripe_checkout_url
          );
          await sendEmail({
            to: prospect.email,
            subject: letter.subject,
            html: `${letter.html}<p>${salesPortalUrl(contract.portal_token)}</p>`,
            text: letter.text,
            category: "transactional",
            metadata: { kind: "sales_dunning", invoiceId: invoice.id },
          });
        }
      }
    }

    for (const contract of contracts) {
      if (contract.status !== "active" && contract.status !== "past_due") continue;
      const overdue = invoices.some(
        (inv) =>
          inv.contract_id === contract.id &&
          inv.status === "overdue" &&
          Date.now() - new Date(inv.due_at).getTime() > 3 * 24 * 60 * 60 * 1000
      );
      if (overdue) {
        await pauseFulfillment(db, contract);
        await updateContract(db, contract.id, { status: "past_due" });
        const prospect = prospectById.get(contract.prospect_id);
        if (prospect) await updateProspect(db, prospect.id, { stage: "past_due" });
        paused += 1;
      }
    }

    const inquiries = await listInquiries(db, 120);
    for (const inquiry of inquiries) {
      if (inquiry.status !== "received") continue;
      const contract = contracts.find((c) => c.id === inquiry.contract_id) ?? null;
      const prospect = inquiry.prospect_id ? prospectById.get(inquiry.prospect_id) ?? null : null;
      if (!contract || !prospect) continue;
      const { fulfillInquiry } = await import("@/lib/sales/fulfillment");
      const out = await fulfillInquiry(db, inquiry, contract, prospect);
      if (out.forwarded) inquiriesForwarded += 1;
    }

    for (const inquiry of inquiries) {
      if (inquiry.status === "forwarded" && inquiry.sla_due_at && new Date(inquiry.sla_due_at).getTime() < Date.now()) {
        await updateInquiry(db, inquiry.id, { status: "overdue" });
      }
    }

    try {
      const liveListings = await listMarketplaceListings(db, 80);
      for (const listing of liveListings) {
        if (listing.status !== "visible" || listing.kind === "question") continue;
        const board = runAdEditorBoard({
          company: listing.company,
          adText: `${listing.title}\n${listing.summary}`,
        });
        if (board.recommendation === "deny") {
          await updateMarketplaceListing(db, listing.id, {
            status: "rejected",
            reply_topic: "blocked_legal",
          });
        }
      }
    } catch {
      /* marketplace editorial is best-effort */
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const finishedAt = new Date().toISOString();
  let control = evaluateSalesControl({
    mailReady: mailReady(),
    unrepliedListings: 0,
    outreachNeedsApproval: 0,
    inquiriesReceived: 0,
    inquiriesOverdue: 0,
    invoicesOverdue: 0,
    pendingPayment: 0,
    skippedLegal,
  });
  try {
    const [listingsNow, inquiriesNow, invoicesNow, outreachNow, contractsNow] = await Promise.all([
      listMarketplaceListings(db, 80),
      listInquiries(db, 120),
      listInvoices(db, 120),
      listOutreach(db, 200),
      listContracts(db, 200),
    ]);
    control = evaluateSalesControl({
      mailReady: mailReady(),
      unrepliedListings: listingsNow.filter((row) => !row.auto_replied_at).length,
      outreachNeedsApproval: outreachNow.filter((row) => row.status === "needs_approval").length,
      inquiriesReceived: inquiriesNow.filter((row) => row.status === "received").length,
      inquiriesOverdue: inquiriesNow.filter((row) => row.status === "overdue").length,
      invoicesOverdue: invoicesNow.filter((row) => row.status === "overdue").length,
      pendingPayment: contractsNow.filter((row) => row.status === "pending_payment").length,
      skippedLegal: outreachNow.filter((row) => row.status === "skipped_legal").length,
    });
    await insertEvent(db, "sales_control", { findings: control });
  } catch {
    /* control snapshot is best-effort */
  }

  const summary: SalesTickResult = {
    ok: errors.length === 0,
    schemaOk: schema.ok,
    db: true,
    seeded,
    ingested,
    queued,
    sent,
    skippedLegal,
    invoicesIssued,
    invoicesSent,
    fulfilled,
    inquiriesForwarded,
    paused,
    errors,
    startedAt,
    finishedAt,
    control,
  };

  await insertRun(db, {
    started_at: startedAt,
    finished_at: finishedAt,
    ok: summary.ok,
    summary: { ...summary },
    error: errors[0] ?? null,
  });
  await insertEvent(db, "sales_tick", { ...summary });
  return summary;
}

export async function ensureInboundProspect(
  input: {
    company: string;
    email: string;
    contactName?: string | null;
    ico?: string | null;
    dic?: string | null;
    address?: string | null;
    website?: string | null;
    offerText?: string | null;
  }
): Promise<SalesProspect | null> {
  const db = salesDb(null);
  if (!db) return null;
  const email = input.email.trim().toLowerCase();
  const existing = await findProspectByEmail(db, email);
  if (existing) {
    await updateProspect(db, existing.id, {
      legal_basis: "inquiry",
      contact_name: input.contactName ?? existing.contact_name,
      ico: input.ico ?? existing.ico,
      dic: input.dic ?? existing.dic,
      address: input.address ?? existing.address,
    });
    return { ...existing, legal_basis: "inquiry" };
  }
  const slug = slugifyCompany(input.company);
  return insertProspect(db, {
    company: input.company,
    slug: (await findProspectBySlug(db, slug)) ? `${slug}-${randomToken(3)}` : slug,
    email,
    contact_name: input.contactName ?? null,
    ico: input.ico ?? null,
    dic: input.dic ?? null,
    address: input.address ?? null,
    website: input.website ?? null,
    notes: input.offerText ?? null,
    sector: "clinic",
    country: "CZ",
    stage: "offered",
    legal_basis: "inquiry",
    score: 90,
    source: "pausal_form",
  });
}

export { recommendedPackageId, dateOnly };
