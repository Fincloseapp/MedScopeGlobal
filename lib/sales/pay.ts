import { sendEmail } from "@/lib/email/engine";
import { getLegalBankAccount, getLegalIban } from "@/lib/billing/spd-qr";
import { getLegalEntity } from "@/lib/config/legal-entity";
import { SITE } from "@/lib/config/site";
import { marketplaceAdminNotifyEmail, marketplaceInboxEmail } from "@/lib/marketplace/config";
import { createStripeClient, getStripeSecretKey } from "@/lib/stripe/client";
import { formatSalesCzk, salesChargeCzk, salesPackageById, salesStripeLine } from "@/lib/sales/packages";
import type { SalesBillingInterval } from "@/lib/sales/types";
import { randomToken, salesVariableSymbol } from "@/lib/sales/ids";

export type SalesPayInstructions = {
  sellerName: string;
  sellerIco: string | null;
  sellerAddress: string | null;
  iban: string | null;
  bankAccount: string | null;
  supportEmail: string;
  supportPhone: string | null;
  inbox: string;
  stripeReady: boolean;
};

export function salesPayInstructions(): SalesPayInstructions {
  const entity = getLegalEntity();
  return {
    sellerName: entity.name,
    sellerIco: entity.ico,
    sellerAddress: entity.address,
    iban: getLegalIban(),
    bankAccount: getLegalBankAccount(),
    supportEmail: entity.supportEmail,
    supportPhone: entity.supportPhone,
    inbox: marketplaceInboxEmail(),
    stripeReady: Boolean(getStripeSecretKey()),
  };
}

export function normalizeCzechIco(raw: string | undefined | null): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length === 8 ? digits : null;
}

export async function createGuestRetainerCheckout(input: {
  company: string;
  email: string;
  contactName?: string;
  ico?: string;
  address?: string;
  packageId: string;
  offerText?: string;
  billingInterval?: SalesBillingInterval;
}): Promise<{ url: string; pendingId: string } | null> {
  const key = getStripeSecretKey();
  const pkg = salesPackageById(input.packageId);
  if (!key || !pkg) return null;
  const pendingId = randomToken(12);
  const origin = SITE.url.replace(/\/$/, "");
  const stripe = createStripeClient(key);
  const interval: SalesBillingInterval = input.billingInterval === "year" ? "year" : "month";
  const line = salesStripeLine(pkg.priceCzkMonth, interval);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    locale: "cs",
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    custom_text: {
      submit: { message: `${line.description}. Neplátce DPH.` },
    },
    success_url: `${origin}/inzerce/pausal?paid=1&pending=${encodeURIComponent(pendingId)}`,
    cancel_url: `${origin}/inzerce/pausal?cancelled=1`,
    customer_email: input.email,
    metadata: {
      kind: "sales_retainer",
      pending: "1",
      pending_id: pendingId,
      company: input.company.slice(0, 120),
      email: input.email.slice(0, 120),
      contact_name: (input.contactName ?? "").slice(0, 80),
      ico: (input.ico ?? "").slice(0, 20),
      address: (input.address ?? "").slice(0, 200),
      package_id: input.packageId,
      billing_interval: interval,
      offer_text: (input.offerText ?? "").slice(0, 200),
    },
    subscription_data: {
      metadata: {
        kind: "sales_retainer",
        pending: "1",
        pending_id: pendingId,
        package_id: input.packageId,
        billing_interval: interval,
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "czk",
          recurring: line.recurring,
          unit_amount: line.unitAmount,
          product_data: {
            name: `MedScopeGlobal inzerce — ${pkg.name}`,
            description: `${line.description} · ${input.company}`,
          },
        },
      },
    ],
  });
  return session.url ? { url: session.url, pendingId } : null;
}

export async function notifyPausalOrder(input: {
  company: string;
  email: string;
  contactName?: string;
  ico?: string;
  address?: string;
  packageId: string;
  checkoutUrl?: string | null;
  variableSymbol?: string;
  invoiceNumber?: string;
  guest?: boolean;
  skipBuyer?: boolean;
  billingInterval?: SalesBillingInterval;
}): Promise<void> {
  const pkg = salesPackageById(input.packageId);
  const pay = salesPayInstructions();
  const interval: SalesBillingInterval = input.billingInterval === "year" ? "year" : "month";
  const amount = pkg ? formatSalesCzk(salesChargeCzk(pkg.priceCzkMonth, interval)) : "";
  const period = interval === "year" ? "/ rok (2 měsíce zdarma)" : "/ měsíc";
  const vs = input.variableSymbol ? `VS ${input.variableSymbol}` : "";
  const bank = [pay.iban ? `IBAN ${pay.iban}` : null, pay.bankAccount ? `účet ${pay.bankAccount}` : null]
    .filter(Boolean)
    .join(" · ");
  const payLine = input.checkoutUrl
    ? `Platba kartou: ${input.checkoutUrl}`
    : bank
      ? `Převod: ${bank} ${vs} ${amount}`.trim()
      : `Napište na ${pay.inbox} — připravíme platbu.`;

  if (!input.skipBuyer) {
    await sendEmail({
      to: input.email,
      subject: `Objednávka paušálu ${pkg?.name ?? ""} — MedScopeGlobal`,
      html: `<p>Dobrý den,</p><p>přijali jsme objednávku paušálu <strong>${pkg?.name ?? ""}</strong> pro ${input.company} (${amount} ${period}, neplátce DPH).</p><p>${payLine}</p><p>Tržiště zpracuje inzerci u sebe — ne jako jednorázový banner v článku. Podmínky: ${SITE.url.replace(/\/$/, "")}/inzerce/podminky</p>`,
      text: `Objednávka ${pkg?.name ?? ""} ${amount}. ${payLine}`,
      category: "transactional",
      metadata: { kind: "sales_order_ack", guest: String(Boolean(input.guest)) },
    });
  }

  await sendEmail({
    to: marketplaceAdminNotifyEmail(),
    subject: `${input.guest ? "Hostující" : "Nová"} objednávka paušálu — ${input.company}`,
    html: `<p>${input.company} · ${input.email} · IČO ${input.ico ?? "—"} · ${pkg?.name ?? input.packageId} · ${amount}</p><p>${payLine}</p><p>${input.contactName ?? ""} ${input.address ?? ""}</p>`,
    text: `${input.company} ${input.email} ${pkg?.name ?? ""} ${amount}`,
    category: "transactional",
    metadata: { kind: "sales_order_admin" },
  });
}

export async function fulfillPendingRetainerFromStripe(input: {
  sessionId: string;
  subscriptionId?: string | null;
  customerId?: string | null;
  metadata: Record<string, string> | null | undefined;
}): Promise<{ ok: boolean; reason?: string }> {
  const meta = input.metadata ?? {};
  const packageId = meta.package_id || "start";
  const email = (meta.email || "").trim().toLowerCase();
  const company = (meta.company || "").trim();
  if (!email || !company) {
    await sendEmail({
      to: marketplaceAdminNotifyEmail(),
      subject: "Stripe paušál bez firmy / e-mailu",
      html: `<p>Session ${input.sessionId}</p><pre>${JSON.stringify(meta)}</pre>`,
      text: `session ${input.sessionId}`,
      category: "transactional",
      metadata: { kind: "sales_retainer_orphan" },
    });
    return { ok: false, reason: "metadata" };
  }

  const { createPausalOrder } = await import("@/lib/sales/order");
  const { applySalesStripePayment } = await import("@/lib/sales/billing");
  const order = await createPausalOrder({
    company,
    email,
    contactName: meta.contact_name,
    ico: meta.ico,
    address: meta.address,
    offerText: meta.offer_text,
    packageId,
    termsAccepted: true,
    allowGuest: false,
  });
  if (order.ok && order.contract) {
    return applySalesStripePayment({
      contractId: order.contract.id,
      sessionId: input.sessionId,
      subscriptionId: input.subscriptionId,
      customerId: input.customerId,
    });
  }

  await notifyPausalOrder({
    company,
    email,
    contactName: meta.contact_name,
    ico: meta.ico,
    address: meta.address,
    packageId,
    variableSymbol: salesVariableSymbol(meta.ico || meta.pending_id || "7"),
    guest: true,
  });
  await sendEmail({
    to: marketplaceAdminNotifyEmail(),
    subject: `Zaplacený paušál čeká na databázi — ${company}`,
    html: `<p>Stripe session ${input.sessionId} je zaplacená. Doplňte service role / SQL a spřáhnete smlouvu ručně.</p><p>${email} · ${packageId}</p>`,
    text: `Paid session ${input.sessionId} ${email} ${packageId}`,
    category: "transactional",
    metadata: { kind: "sales_retainer_paid_unbound", sessionId: input.sessionId },
  });
  return { ok: true, reason: "notified" };
}
