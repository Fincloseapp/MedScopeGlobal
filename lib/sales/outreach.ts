import { sendEmail } from "@/lib/email/engine";
import { getLegalEntity } from "@/lib/config/legal-entity";
import { salesPackageById } from "@/lib/sales/packages";
import { campaignMarketplaceEmail, campaignSourceLocale, isCampaignProspect } from "@/lib/sales/campaign";
import { salesOfferEmail, salesUnsubscribeUrl } from "@/lib/sales/copy";
import {
  domainMatchesWebsite,
  evaluateOutreachGate,
  salesCampaignAutoSendEnabled,
  unsubscribeToken,
} from "@/lib/sales/legal";
import {
  insertOutreach,
  listOutreach,
  listProspects,
  updateOutreach,
  updateProspect,
  type SalesClient,
} from "@/lib/sales/store";
import type { SalesOutreach, SalesPackage, SalesProspect } from "@/lib/sales/types";

export function buildOfferForProspect(
  prospect: SalesProspect,
  pkg: SalesPackage,
  extras?: { checkoutUrl?: string | null; portalUrl?: string | null; vs?: string | null; invoiceNumber?: string | null }
) {
  const email = prospect.email;
  if (!email) return null;
  const token = unsubscribeToken(email);
  const unsubscribeUrl = salesUnsubscribeUrl(email, token);
  if (isCampaignProspect(prospect)) {
    return campaignMarketplaceEmail({
      company: prospect.company,
      locale: campaignSourceLocale(prospect.source),
      unsubscribeUrl,
    });
  }
  return salesOfferEmail({
    company: prospect.company,
    package: pkg,
    checkoutUrl: extras?.checkoutUrl,
    portalUrl: extras?.portalUrl,
    unsubscribeUrl,
    variableSymbol: extras?.vs,
    invoiceNumber: extras?.invoiceNumber,
  });
}

export function recommendedPackageId(prospect: SalesProspect): SalesPackage["id"] {
  if (isCampaignProspect(prospect)) return "start";
  if (prospect.sector === "pharma_rx") return "clinical";
  if (prospect.sector === "congress" || prospect.sector === "medtech") return "magazine";
  if (prospect.sector === "clinic" || prospect.sector === "pharmacy") return "visible";
  return "start";
}

export async function queueOfferIfNeeded(
  db: SalesClient,
  prospect: SalesProspect,
  suppressed: Set<string>,
  pkg?: SalesPackage | null
): Promise<{ queued: boolean; needsApproval: boolean; reason: string }> {
  const campaignAuto =
    isCampaignProspect(prospect) &&
    salesCampaignAutoSendEnabled() &&
    Boolean(prospect.email) &&
    domainMatchesWebsite(prospect.email!, prospect.website);
  const gate = evaluateOutreachGate({
    email: prospect.email,
    legalBasis: prospect.legal_basis,
    stage: prospect.stage,
    outreachCount: prospect.outreach_count,
    lastContactedAt: prospect.last_contacted_at,
    suppressedAt: prospect.suppressed_at,
    approvedOutreachAt: prospect.approved_outreach_at,
    suppressed: prospect.email ? suppressed.has(prospect.email) : false,
    campaignAuto,
  });
  if (!gate.allow) return { queued: false, needsApproval: false, reason: gate.reason };

  const chosen = pkg ?? salesPackageById(recommendedPackageId(prospect));
  if (!chosen) return { queued: false, needsApproval: false, reason: "no_package" };
  const letter = buildOfferForProspect(prospect, chosen);
  if (!letter) return { queued: false, needsApproval: false, reason: "missing_email" };

  const status = gate.autoSend ? "queued" : "needs_approval";
  const row = await insertOutreach(db, {
    prospect_id: prospect.id,
    status,
    template: isCampaignProspect(prospect) ? "marketplace_campaign" : "offer",
    subject: letter.subject,
    body_html: letter.html,
    legal_basis: gate.legalBasis,
  });
  if (!row) return { queued: false, needsApproval: false, reason: "insert_failed" };

  await updateProspect(db, prospect.id, {
    stage: gate.autoSend ? "offered" : "outreach_queued",
  });
  return { queued: true, needsApproval: !gate.autoSend, reason: gate.reason };
}

export async function sendQueuedOutreach(
  db: SalesClient,
  suppressed: Set<string>,
  cap: number
): Promise<{ sent: number; skippedLegal: number; failed: number }> {
  const entity = getLegalEntity();
  const rows = await listOutreach(db, 80);
  const pending = rows.filter((row) => row.status === "queued" || row.status === "approved");
  const prospects = await listProspects(db, 800);
  const byId = new Map(prospects.map((p) => [p.id, p]));
  let sent = 0;
  let skippedLegal = 0;
  let failed = 0;

  for (const row of pending) {
    if (sent >= cap) break;
    const prospect = byId.get(row.prospect_id);
    if (!prospect?.email) {
      await updateOutreach(db, row.id, { status: "skipped_legal", skip_reason: "missing_email" });
      skippedLegal += 1;
      continue;
    }
    if (suppressed.has(prospect.email) || prospect.suppressed_at) {
      await updateOutreach(db, row.id, { status: "skipped_legal", skip_reason: "suppressed" });
      skippedLegal += 1;
      continue;
    }
    const campaignAuto =
      isCampaignProspect(prospect) &&
      salesCampaignAutoSendEnabled() &&
      domainMatchesWebsite(prospect.email, prospect.website);
    const gate = evaluateOutreachGate({
      email: prospect.email,
      legalBasis: prospect.legal_basis,
      stage: prospect.stage,
      outreachCount: prospect.outreach_count,
      lastContactedAt: prospect.last_contacted_at,
      suppressedAt: prospect.suppressed_at,
      approvedOutreachAt: prospect.approved_outreach_at || (row.status === "approved" ? new Date().toISOString() : null),
      suppressed: false,
      campaignAuto,
    });
    if (!gate.allow || !gate.autoSend) {
      await updateOutreach(db, row.id, {
        status: "needs_approval",
        skip_reason: gate.reason,
      });
      skippedLegal += 1;
      continue;
    }

    const result = await sendEmail({
      to: prospect.email,
      subject: row.subject,
      html: row.body_html,
      category: prospect.legal_basis === "inquiry" || prospect.legal_basis === "customer" ? "transactional" : "marketing",
      fromName: `${entity.tradeName} inzerce`,
      metadata: { kind: "sales_outreach", prospectId: prospect.id, outreachId: row.id },
    });
    if (!result.ok) {
      await updateOutreach(db, row.id, { status: "failed", skip_reason: result.error ?? "send_failed" });
      failed += 1;
      continue;
    }
    await updateOutreach(db, row.id, { status: "sent", sent_at: new Date().toISOString(), skip_reason: null });
    await updateProspect(db, prospect.id, {
      stage: prospect.stage === "identified" || prospect.stage === "qualified" ? "contacted" : "offered",
      outreach_count: prospect.outreach_count + 1,
      last_contacted_at: new Date().toISOString(),
    });
    sent += 1;
  }

  return { sent, skippedLegal, failed };
}

export async function approveOutreach(db: SalesClient, outreach: SalesOutreach): Promise<void> {
  await updateOutreach(db, outreach.id, { status: "approved", skip_reason: null });
  await updateProspect(db, outreach.prospect_id, {
    approved_outreach_at: new Date().toISOString(),
    legal_basis: outreach.legal_basis === "none" ? "legitimate_interest" : outreach.legal_basis,
  });
}
