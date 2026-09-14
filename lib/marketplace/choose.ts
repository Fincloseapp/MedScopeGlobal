import { z } from "zod";
import { sanitizeText } from "@/lib/security/sanitize";
import { marketplaceDb, insertMarketplaceMessage, listVisibleMarketplaceListings } from "@/lib/marketplace/store";
import { scoreOfferToDemand } from "@/lib/sales/marketplace-loop";
import { insertInquiry, listContracts, listProspects } from "@/lib/sales/store";
import { fulfillInquiry, inquirySlaDue } from "@/lib/sales/fulfillment";
import { salesPackageById } from "@/lib/sales/packages";

export const chooseOfferSchema = z.object({
  offerId: z.string().min(2).max(80),
  company: z.string().min(2).max(200),
  email: z.string().email(),
  message: z.string().min(8).max(2000),
  termsAccepted: z.boolean(),
});

export async function chooseMarketplaceOffer(input: z.infer<typeof chooseOfferSchema>): Promise<{
  ok: boolean;
  error?: string;
  matched?: boolean;
}> {
  if (!input.termsAccepted) return { ok: false, error: "terms_required" };
  const db = marketplaceDb();
  if (!db) return { ok: false, error: "database_unavailable" };

  const offers = await listVisibleMarketplaceListings(db, "offer", 80);
  const offer = offers.find((row) => row.id === input.offerId);
  if (!offer) return { ok: false, error: "offer_not_found" };

  const email = input.email.trim().toLowerCase();
  const company = sanitizeText(input.company, 200);
  const message = sanitizeText(input.message, 2000);

  const note = await insertMarketplaceMessage(db, {
    listing_id: offer.id,
    direction: "inbound",
    from_email: email,
    to_email: offer.contact_email,
    subject: `Výběr dodavatele — ${company}`,
    body: message,
    topic: "choose",
  });
  if (!note) return { ok: false, error: "save_failed" };

  await insertMarketplaceMessage(db, {
    listing_id: offer.id,
    direction: "outbound",
    from_email: email,
    to_email: offer.contact_email,
    subject: "Poptávající si vás vybral na tržišti",
    body: `${company} vybral nabídku „${offer.title}“. Oslovení zůstává na tržišti.`,
    topic: "match",
  });

  const prospects = await listProspects(db, 200);
  const contracts = (await listContracts(db, 80)).filter((row) => row.status === "active");
  const supplier = prospects.find((row) => row.email && offer.contact_email && row.email === offer.contact_email);
  const contract = supplier ? contracts.find((row) => row.prospect_id === supplier.id) : null;
  if (contract) {
    const inquiry = await insertInquiry(db, {
      contract_id: contract.id,
      prospect_id: contract.prospect_id,
      landing_slug: contract.landing_slug,
      company_name: company,
      sender_name: company,
      sender_email: email,
      message: `${message}\n\nShoda s nabídkou: ${offer.title} (${scoreOfferToDemand(offer, { title: message, summary: message }).toFixed(2)})`,
      status: "received",
      sla_due_at: inquirySlaDue(salesPackageById(contract.package_id)?.slaHours ?? 72),
    });
    if (inquiry) {
      await fulfillInquiry(db, inquiry, contract, supplier ?? null);
    }
  }

  return { ok: true, matched: true };
}
