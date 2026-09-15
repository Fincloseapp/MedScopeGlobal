import { generateInvoiceHtml } from "@/lib/billing/invoice-generator";
import { getLegalBankAccount, getLegalIban } from "@/lib/billing/spd-qr";
import { sendEmail } from "@/lib/email/engine";
import { SITE } from "@/lib/config/site";
import { createStripeClient, getStripeSecretKey } from "@/lib/stripe/client";
import { salesInvoiceEmailIntro, salesPortalUrl } from "@/lib/sales/copy";
import { salesPackageById, salesStripeLine } from "@/lib/sales/packages";
import type { SalesBillingInterval, SalesContract, SalesInvoice, SalesProspect } from "@/lib/sales/types";
import { dateOnly, nextInvoiceNumber, salesVariableSymbol } from "@/lib/sales/ids";
import {
  countInvoicesThisMonth,
  insertInvoice,
  updateContract,
  updateInvoice,
  type SalesClient,
} from "@/lib/sales/store";

export function buildSalesInvoiceDocument(input: {
  invoice: Pick<SalesInvoice, "number" | "variable_symbol" | "amount_czk" | "period_start" | "period_end">;
  prospect: Pick<SalesProspect, "company" | "email" | "ico" | "dic" | "address">;
  packageName: string;
  paymentMethod?: string | null;
}) {
  return generateInvoiceHtml({
    transactionId: input.invoice.number,
    customerEmail: input.prospect.email ?? "",
    customerName: input.prospect.company,
    buyerIco: input.prospect.ico,
    buyerDic: input.prospect.dic,
    buyerAddress: input.prospect.address,
    variableSymbol: input.invoice.variable_symbol,
    paymentMethod: input.paymentMethod ?? "karta (Stripe) nebo převod",
    bankAccount: getLegalBankAccount(),
    iban: getLegalIban(),
    lineItems: [
      {
        description: `Měsíční paušál inzerce MedScopeGlobal — ${input.packageName} (${dateOnly(input.invoice.period_start)}–${dateOnly(input.invoice.period_end)})`,
        amountCzk: input.invoice.amount_czk,
      },
    ],
  });
}

export async function issueRetainerInvoice(
  db: SalesClient,
  contract: SalesContract,
  prospect: SalesProspect,
  periodStart: Date,
  periodEnd: Date,
  amountCzk?: number
): Promise<SalesInvoice | null> {
  const seq = (await countInvoicesThisMonth(db)) + 1;
  const number = nextInvoiceNumber(seq, periodStart);
  const vs = salesVariableSymbol(contract.id, periodStart);
  const due = new Date(periodStart);
  due.setUTCDate(due.getUTCDate() + 14);
  return insertInvoice(db, {
    contract_id: contract.id,
    prospect_id: prospect.id,
    number,
    variable_symbol: vs,
    status: "issued",
    amount_czk: amountCzk ?? contract.monthly_czk,
    period_start: dateOnly(periodStart),
    period_end: dateOnly(periodEnd),
    due_at: due.toISOString(),
    payment_method: contract.stripe_subscription_id ? "stripe" : "bank_transfer",
  });
}

export async function emailSalesInvoice(
  invoice: SalesInvoice,
  prospect: SalesProspect,
  contract: SalesContract
): Promise<{ ok: boolean; error?: string }> {
  if (!prospect.email) return { ok: false, error: "missing_email" };
  const pkg = salesPackageById(contract.package_id);
  const doc = buildSalesInvoiceDocument({
    invoice,
    prospect,
    packageName: pkg?.name ?? contract.package_id,
    paymentMethod: invoice.payment_method,
  });
  const intro = salesInvoiceEmailIntro(
    prospect.company,
    invoice.number,
    invoice.variable_symbol,
    invoice.amount_czk
  );
  const portal = salesPortalUrl(contract.portal_token);
  const sent = await sendEmail({
    to: prospect.email,
    subject: intro.subject,
    html: `${intro.leadHtml}<p>Portál inzerenta: <a href="${portal}">${portal}</a></p>${doc.html}`,
    text: intro.text,
    category: "transactional",
    metadata: { kind: "sales_invoice", invoiceId: invoice.id, contractId: contract.id },
    attachments: doc.pdfBase64
      ? [
          {
            filename: `${invoice.number}.pdf`,
            content: doc.pdfBase64,
            type: "application/pdf",
            encoding: "base64",
          },
        ]
      : undefined,
  });
  return { ok: sent.ok, error: sent.error };
}

export async function markInvoicePaid(
  db: SalesClient,
  invoice: SalesInvoice,
  contract: SalesContract,
  method: string
): Promise<void> {
  const now = new Date();
  const periodStart = now;
  const periodEnd = new Date(now);
  periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);
  await updateInvoice(db, invoice.id, {
    status: "paid",
    paid_at: now.toISOString(),
    payment_method: method,
  });
  await updateContract(db, contract.id, {
    status: "active",
    last_paid_at: now.toISOString(),
    paid_months: (contract.paid_months ?? 0) + 1,
    paid_total_czk: (contract.paid_total_czk ?? 0) + invoice.amount_czk,
    period_start: dateOnly(periodStart),
    period_end: dateOnly(periodEnd),
    grace_until: null,
  });
}

export async function applySalesStripePayment(input: {
  contractId: string;
  sessionId?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  stripeInvoiceId?: string | null;
}): Promise<{ ok: boolean; reason?: string }> {
  const { salesDb, findContractById, listInvoices, listProspects, updateContract } = await import("@/lib/sales/store");
  const { activateFulfillment } = await import("@/lib/sales/fulfillment");
  const db = salesDb(null);
  if (!db) return { ok: false, reason: "db" };
  const contract = await findContractById(db, input.contractId);
  if (!contract) return { ok: false, reason: "contract_not_found" };
  const prospects = await listProspects(db, 400);
  const prospect = prospects.find((p) => p.id === contract.prospect_id);
  if (!prospect) return { ok: false, reason: "prospect_not_found" };

  const invoices = (await listInvoices(db, 200)).filter((row) => row.contract_id === contract.id);
  const open = invoices.find((row) => row.status === "issued" || row.status === "sent" || row.status === "overdue") ?? invoices[0];
  if (open && open.status !== "paid") {
    await markInvoicePaid(db, open, contract, "stripe");
    await emailSalesInvoice({ ...open, status: "paid", payment_method: "stripe" }, prospect, contract);
  } else if (!open) {
    const start = new Date();
    const end = new Date();
    end.setUTCMonth(end.getUTCMonth() + 1);
    const invoice = await issueRetainerInvoice(db, contract, prospect, start, end);
    if (invoice) {
      await markInvoicePaid(db, invoice, contract, "stripe");
      await emailSalesInvoice({ ...invoice, status: "paid", payment_method: "stripe" }, prospect, contract);
    }
  }

  await updateContract(db, contract.id, {
    status: "active",
    stripe_subscription_id: input.subscriptionId ?? contract.stripe_subscription_id,
    stripe_customer_id: input.customerId ?? contract.stripe_customer_id,
  });
  const fresh = await findContractById(db, contract.id);
  if (fresh && prospect && (fresh.ads_ids?.length ?? 0) === 0) {
    await activateFulfillment(db, fresh, prospect);
    const { updateProspect } = await import("@/lib/sales/store");
    await updateProspect(db, prospect.id, { stage: "fulfilling", legal_basis: "customer" });
  } else if (prospect) {
    const { updateProspect } = await import("@/lib/sales/store");
    await updateProspect(db, prospect.id, { stage: "fulfilling", legal_basis: "customer" });
  }
  return { ok: true };
}

export async function applySalesStripeFailure(contractId: string): Promise<void> {
  const { salesDb, findContractById, updateContract } = await import("@/lib/sales/store");
  const db = salesDb(null);
  if (!db) return;
  const contract = await findContractById(db, contractId);
  if (!contract) return;
  const grace = new Date();
  grace.setUTCDate(grace.getUTCDate() + 3);
  await updateContract(db, contract.id, { status: "past_due", grace_until: grace.toISOString() });
}

export async function createRetainerCheckoutUrl(
  contract: SalesContract,
  prospect: SalesProspect,
  billingInterval: SalesBillingInterval = "month"
): Promise<string | null> {
  const key = getStripeSecretKey();
  if (!key) return null;
  const pkg = salesPackageById(contract.package_id);
  const stripe = createStripeClient(key);
  const origin = SITE.url.replace(/\/$/, "");
  const line = salesStripeLine(contract.monthly_czk, billingInterval);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    locale: "cs",
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    custom_text: {
      submit: { message: `${line.description}. Neplátce DPH.` },
    },
    success_url: `${origin}/inzerenti/portal?token=${encodeURIComponent(contract.portal_token)}&paid=1`,
    cancel_url: `${origin}/inzerce/pausal?cancelled=1`,
    customer_email: prospect.email ?? undefined,
    metadata: {
      kind: "sales_retainer",
      contract_id: contract.id,
      prospect_id: prospect.id,
      package_id: contract.package_id,
      billing_interval: billingInterval,
    },
    subscription_data: {
      metadata: {
        kind: "sales_retainer",
        contract_id: contract.id,
        billing_interval: billingInterval,
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
            name: `MedScopeGlobal inzerce — ${pkg?.name ?? contract.package_id}`,
            description: `${line.description} · ${prospect.company}`,
          },
        },
      },
    ],
  });
  return session.url;
}
