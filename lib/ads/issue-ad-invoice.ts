import { generateInvoiceHtml } from "@/lib/billing/invoice-generator";
import { getLegalBankAccount, getLegalIban } from "@/lib/billing/spd-qr";
import { sendEmail } from "@/lib/email/engine";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export function invoiceFromAdRequest(req: Record<string, unknown>) {
  const amount = Math.round(Number(req.price ?? 0));
  const vs = String(req.variable_symbol ?? req.id ?? "").replace(/\D/g, "").slice(0, 10);
  return generateInvoiceHtml({
    transactionId: vs ? `MSG-${vs}` : `MSG-${String(req.id).slice(0, 8)}`,
    customerEmail: String(req.email ?? ""),
    customerName: String(req.company ?? ""),
    buyerIco: req.ico ? String(req.ico) : null,
    buyerDic: req.dic ? String(req.dic) : null,
    buyerAddress: req.buyer_address ? String(req.buyer_address) : null,
    variableSymbol: vs || null,
    paymentMethod:
      req.payment_method === "stripe"
        ? "karta (Stripe)"
        : req.payment_method === "bank_transfer"
          ? "bankovní převod"
          : "karta nebo převod",
    bankAccount: getLegalBankAccount(),
    iban: getLegalIban(),
    lineItems: [
      {
        description: `Inzerce MedScopeGlobal — ${req.type ?? "banner"} / ${req.position ?? "web"} (${req.duration ?? "30"} dní)`,
        amountCzk: amount,
      },
    ],
  });
}

export async function emailAdInvoice(req: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  const doc = invoiceFromAdRequest(req);
  if (!doc.customerEmail) return { ok: false, error: "missing_email" };
  const sent = await sendEmail({
    to: doc.customerEmail,
    subject: `Faktura ${doc.transactionId} — MedScopeGlobal inzerce`,
    html: doc.html,
    text: `Faktura ${doc.transactionId} na ${doc.totalCzk} Kč. Variabilní symbol: ${req.variable_symbol ?? "—"}.`,
    category: "transactional",
    metadata: { kind: "ad_invoice", requestId: String(req.id ?? "") },
    attachments: doc.pdfBase64
      ? [
          {
            filename: `${doc.transactionId}.pdf`,
            content: doc.pdfBase64,
            type: "application/pdf",
            encoding: "base64",
          },
        ]
      : undefined,
  });
  if (sent.ok) {
    const admin = tryCreateServiceRoleClient();
    if (admin && req.id) {
      await admin
        .from("ads_requests")
        .update({ invoice_sent_at: new Date().toISOString() })
        .eq("id", req.id);
    }
  }
  return { ok: sent.ok, error: sent.error };
}
