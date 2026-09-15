import { sanitizeText } from "@/lib/security/sanitize";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";
import { classifyMarketplaceKind, classifyMarketplaceMessage } from "@/lib/marketplace/auto-reply";
import { applyMarketplaceDeskSchema } from "@/lib/marketplace/schema";
import {
  insertMarketplaceListing,
  insertMarketplaceMessage,
  marketplaceDb,
  updateMarketplaceListing,
} from "@/lib/marketplace/store";
import { notifyMarketplaceAdmin, sendMarketplaceAck, sendMarketplaceAutoReply } from "@/lib/marketplace/mail";
import type { MarketplaceIntakeInput, MarketplaceListing } from "@/lib/marketplace/types";
import { slugifyCompany } from "@/lib/sales/ids";
import { fulfillInquiry, inquirySlaDue } from "@/lib/sales/fulfillment";
import { findProspectByEmail, insertInquiry, insertProspect, listContracts, listProspects, updateProspect } from "@/lib/sales/store";
import { salesPackageById } from "@/lib/sales/packages";
import { runAdEditorBoard } from "@/lib/ads/ad-editors";

export type MarketplaceIntakeResult = {
  ok: boolean;
  listing?: MarketplaceListing | null;
  autoReplied: boolean;
  error?: string;
};

export async function ingestMarketplaceIntake(input: MarketplaceIntakeInput): Promise<MarketplaceIntakeResult> {
  await applyMarketplaceDeskSchema();
  const db = marketplaceDb();
  if (!db) return { ok: false, autoReplied: false, error: "database_unavailable" };

  const email = input.contactEmail.trim().toLowerCase();
  const ui = getMarketplaceUiCopy(input.locale);
  const listing = await insertMarketplaceListing(db, {
    kind: input.kind,
    status: input.kind === "question" ? "answered" : "visible",
    company: sanitizeText(input.company, 200),
    title: sanitizeText(input.title, 180),
    summary: sanitizeText(input.summary, 4000),
    category: input.category ? sanitizeText(input.category, 80) : null,
    region: input.region ? sanitizeText(input.region, 80) : ui.regionDefault,
    cert: input.cert ? sanitizeText(input.cert, 80) : null,
    contact_name: sanitizeText(input.contactName || input.company, 120),
    contact_email: email,
    phone: input.phone ? sanitizeText(input.phone, 40) : null,
    source: input.source,
    published_at: input.kind === "question" ? null : new Date().toISOString(),
  });
  if (!listing) return { ok: false, autoReplied: false, error: "save_failed" };

  if (listing.kind !== "question") {
    const board = runAdEditorBoard({
      company: listing.company,
      adText: `${listing.title}\n${listing.summary}`,
    });
    if (board.recommendation === "deny") {
      await updateMarketplaceListing(db, listing.id, { status: "rejected", reply_topic: "blocked_legal" });
      listing.status = "rejected";
      listing.reply_topic = "blocked_legal";
    }
  }

  await insertMarketplaceMessage(db, {
    listing_id: listing.id,
    direction: "inbound",
    from_email: email,
    to_email: null,
    subject: listing.title,
    body: listing.summary,
    topic: input.kind,
  });

  if (input.kind === "offer" || input.kind === "question") {
    let prospect = await findProspectByEmail(db, email);
    if (!prospect) {
      const slugBase = slugifyCompany(listing.company || email.split("@")[0] || "inzerent");
      prospect = await insertProspect(db, {
        company: listing.company,
        slug: slugBase,
        email,
        contact_name: listing.contact_name,
        phone: listing.phone,
        sector: "clinic",
        country: "CZ",
        stage: "offered",
        legal_basis: "inquiry",
        score: 86,
        source: "marketplace",
        notes: `marketplace ${listing.kind} ${listing.id}`,
      });
    } else if (prospect.legal_basis === "none" || prospect.legal_basis === "unverified_guess") {
      await updateProspect(db, prospect.id, { legal_basis: "inquiry", email, stage: "offered" });
    }
  }

  if (input.kind === "demand") {
    await broadcastDemandToAdvertisers(listing);
  }

  const topic = classifyMarketplaceMessage(`${listing.title} ${listing.summary}`);
  const ack =
    input.kind === "question"
      ? await sendMarketplaceAutoReply({ to: email, topic, listing, locale: input.locale })
      : await sendMarketplaceAck(listing, input.locale);

  if (ack.ok) {
    await updateMarketplaceListing(db, listing.id, {
      auto_replied_at: new Date().toISOString(),
      reply_topic: topic,
    });
    await insertMarketplaceMessage(db, {
      listing_id: listing.id,
      direction: "outbound",
      from_email: null,
      to_email: email,
      subject: topic,
      body: "auto-reply",
      topic,
    });
  }
  await notifyMarketplaceAdmin(listing);

  return { ok: true, listing, autoReplied: ack.ok };
}

async function broadcastDemandToAdvertisers(listing: MarketplaceListing): Promise<void> {
  const db = marketplaceDb();
  if (!db || !listing.contact_email) return;
  const contracts = (await listContracts(db, 500)).filter((c) => c.status === "active").slice(0, 500);
  const prospects = await listProspects(db, 800);
  const byId = new Map(prospects.map((p) => [p.id, p]));
  for (const contract of contracts) {
    const prospect = byId.get(contract.prospect_id) ?? null;
    const inquiry = await insertInquiry(db, {
      contract_id: contract.id,
      prospect_id: contract.prospect_id,
      landing_slug: contract.landing_slug,
      company_name: listing.company,
      sender_name: listing.contact_name || listing.company,
      sender_email: listing.contact_email,
      message: `${listing.title}\n\n${listing.summary}`,
      status: "received",
      sla_due_at: inquirySlaDue(salesPackageById(contract.package_id)?.slaHours ?? 72),
    });
    if (!inquiry) continue;
    await fulfillInquiry(db, inquiry, contract, prospect);
  }
}

export function intakeFromInboundEmail(input: {
  fromEmail: string;
  fromName?: string;
  subject: string;
  text: string;
}): MarketplaceIntakeInput {
  const hay = `${input.subject}\n${input.text}`;
  const kind = classifyMarketplaceKind(hay);
  const company = input.fromName?.trim() || input.fromEmail.split("@")[1]?.split(".")[0] || "Firma";
  return {
    kind,
    company,
    title: sanitizeText(input.subject || (kind === "demand" ? "Poptávka z e-mailu" : "Dotaz k inzerci"), 180),
    summary: sanitizeText(input.text || input.subject, 4000),
    contactName: input.fromName?.trim() || company,
    contactEmail: input.fromEmail,
    source: "email",
  };
}
