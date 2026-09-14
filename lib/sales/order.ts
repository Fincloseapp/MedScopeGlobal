import { addMonthsIso, dateOnly, randomToken, slugifyCompany, salesVariableSymbol } from "@/lib/sales/ids";
import { isSalesPackageId, salesPackageById } from "@/lib/sales/packages";
import { ensureInboundProspect } from "@/lib/sales/runner";
import { createRetainerCheckoutUrl, emailSalesInvoice, issueRetainerInvoice } from "@/lib/sales/billing";
import {
  createGuestRetainerCheckout,
  normalizeCzechIco,
  notifyPausalOrder,
} from "@/lib/sales/pay";
import {
  findProspectBySlug,
  insertContract,
  salesDb,
  updateContract,
} from "@/lib/sales/store";
import type { SalesContract, SalesProspect } from "@/lib/sales/types";

export type CreatePausalOrderInput = {
  company: string;
  email: string;
  contactName?: string;
  ico?: string;
  dic?: string;
  address?: string;
  website?: string;
  offerText?: string;
  packageId: string;
  termsAccepted: boolean;
  allowGuest?: boolean;
};

export async function createPausalOrder(input: CreatePausalOrderInput): Promise<{
  ok: boolean;
  error?: string;
  contract?: SalesContract;
  prospect?: SalesProspect;
  checkoutUrl?: string | null;
  invoiceNumber?: string;
  variableSymbol?: string;
  mode?: "live" | "guest";
}> {
  if (!input.termsAccepted) return { ok: false, error: "terms_required" };
  if (!isSalesPackageId(input.packageId)) return { ok: false, error: "unknown_package" };
  const pkg = salesPackageById(input.packageId);
  if (!pkg) return { ok: false, error: "unknown_package" };
  const ico = normalizeCzechIco(input.ico);
  if (!ico) return { ok: false, error: "ico_required" };
  if (!input.address || input.address.trim().length < 8) return { ok: false, error: "address_required" };

  const db = salesDb(null);
  if (!db) {
    if (input.allowGuest === false) return { ok: false, error: "database_unavailable" };
    const vs = salesVariableSymbol(ico);
    let checkoutUrl: string | null = null;
    try {
      const guest = await createGuestRetainerCheckout({
        company: input.company,
        email: input.email,
        contactName: input.contactName,
        ico,
        address: input.address,
        packageId: pkg.id,
        offerText: input.offerText,
      });
      checkoutUrl = guest?.url ?? null;
    } catch (err) {
      console.warn("[sales] guest stripe", err instanceof Error ? err.message : err);
    }
    await notifyPausalOrder({
      company: input.company,
      email: input.email,
      contactName: input.contactName,
      ico,
      address: input.address,
      packageId: pkg.id,
      checkoutUrl,
      variableSymbol: vs,
      guest: true,
    });
    if (!checkoutUrl) return { ok: true, checkoutUrl: null, variableSymbol: vs, mode: "guest" };
    return { ok: true, checkoutUrl, variableSymbol: vs, mode: "guest" };
  }

  const prospect = await ensureInboundProspect({
    company: input.company,
    email: input.email,
    contactName: input.contactName,
    ico,
    dic: input.dic,
    address: input.address,
    website: input.website,
    offerText: input.offerText,
  });
  if (!prospect) return { ok: false, error: "prospect_failed" };

  const slugBase = slugifyCompany(input.company);
  const clash = await findProspectBySlug(db, slugBase);
  const landingSlug = clash && clash.id !== prospect.id ? `${slugBase}-${randomToken(2)}` : prospect.slug;
  const contract = await insertContract(db, {
    prospect_id: prospect.id,
    package_id: pkg.id,
    status: "pending_payment",
    monthly_czk: pkg.priceCzkMonth,
    offer_text: input.offerText || pkg.tagline,
    target_url: input.website || null,
    landing_slug: landingSlug,
    portal_token: randomToken(24),
    terms_accepted_at: new Date().toISOString(),
  });
  if (!contract) return { ok: false, error: "contract_failed" };

  const start = new Date();
  const end = new Date(addMonthsIso(start, 1));
  const invoice = await issueRetainerInvoice(db, contract, prospect, start, end);
  if (invoice) {
    await emailSalesInvoice(invoice, prospect, contract);
  }

  let checkoutUrl: string | null = null;
  try {
    checkoutUrl = await createRetainerCheckoutUrl(contract, prospect);
    if (checkoutUrl) {
      await updateContract(db, contract.id, { stripe_checkout_url: checkoutUrl });
    }
  } catch (err) {
    checkoutUrl = null;
    console.warn("[sales] stripe checkout", err instanceof Error ? err.message : err);
  }

  await notifyPausalOrder({
    company: input.company,
    email: input.email,
    contactName: input.contactName,
    ico,
    address: input.address,
    packageId: pkg.id,
    checkoutUrl,
    invoiceNumber: invoice?.number,
    variableSymbol: invoice?.variable_symbol,
    skipBuyer: true,
  });

  return {
    ok: true,
    contract: { ...contract, stripe_checkout_url: checkoutUrl, period_start: dateOnly(start), period_end: dateOnly(end) },
    prospect,
    checkoutUrl,
    invoiceNumber: invoice?.number,
    variableSymbol: invoice?.variable_symbol,
    mode: "live",
  };
}
