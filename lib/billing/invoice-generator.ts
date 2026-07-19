import { invoiceHtmlToPdfBase64 } from "@/lib/billing/simple-pdf";

export interface InvoiceLineItem {
  description: string;
  amountCzk: number;
}

export interface InvoiceInput {
  transactionId: string;
  customerEmail: string;
  customerName?: string;
  lineItems: InvoiceLineItem[];
  vatRate?: number;
  issuedAt?: Date;
}

export interface InvoiceDocument {
  transactionId: string;
  issuedAt: string;
  customerEmail: string;
  customerName: string;
  subtotalCzk: number;
  vatCzk: number;
  totalCzk: number;
  vatRate: number;
  html: string;
  pdfBase64: string | null;
}

function formatCzk(n: number): string {
  return `${n.toLocaleString("cs-CZ")} Kč`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

export function generateInvoiceHtml(input: InvoiceInput): InvoiceDocument {
  const issuedAt = input.issuedAt ?? new Date();
  const vatRate = input.vatRate ?? 21;
  const subtotalCzk = input.lineItems.reduce((s, i) => s + i.amountCzk, 0);
  const vatCzk = Math.round(subtotalCzk * (vatRate / 100));
  const totalCzk = subtotalCzk + vatCzk;
  const customerName = input.customerName?.trim() || input.customerEmail;

  const rows = input.lineItems
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.description}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">${formatCzk(item.amountCzk)}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><title>Faktura ${input.transactionId}</title></head>
<body style="font-family:system-ui,sans-serif;color:#021d33;max-width:640px;margin:0 auto;padding:24px">
  <header style="border-bottom:3px solid #005B96;padding-bottom:16px;margin-bottom:24px">
    <h1 style="margin:0;font-size:24px;color:#005B96">MedScopeGlobal s.r.o.</h1>
    <p style="margin:4px 0 0;color:#64748b;font-size:13px">Faktura č. ${input.transactionId}</p>
  </header>
  <p><strong>Datum vystavení:</strong> ${formatDate(issuedAt)}</p>
  <p><strong>Odběratel:</strong> ${customerName}<br><strong>E-mail:</strong> ${input.customerEmail}</p>
  <table style="width:100%;border-collapse:collapse;margin:24px 0">
    <thead><tr style="background:#f1f5f9"><th style="padding:8px;text-align:left">Položka</th><th style="padding:8px;text-align:right">Částka</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table style="width:100%;max-width:280px;margin-left:auto;font-size:14px">
    <tr><td>Základ</td><td style="text-align:right">${formatCzk(subtotalCzk)}</td></tr>
    <tr><td>DPH ${vatRate} %</td><td style="text-align:right">${formatCzk(vatCzk)}</td></tr>
    <tr style="font-weight:bold;font-size:16px"><td>Celkem</td><td style="text-align:right;color:#005B96">${formatCzk(totalCzk)}</td></tr>
  </table>
  <footer style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b">
  <p>MedScopeGlobal · info@medscopeglobal.com · https://medscopeglobal.com</p>
  </footer>
</body></html>`;

  const pdfBase64 = invoiceHtmlToPdfBase64({
    transactionId: input.transactionId,
    issuedAtLabel: formatDate(issuedAt),
    customerName,
    customerEmail: input.customerEmail,
    lineItems: input.lineItems.map((i) => ({
      description: i.description,
      amountLabel: formatCzk(i.amountCzk),
    })),
    subtotalLabel: formatCzk(subtotalCzk),
    vatLabel: formatCzk(vatCzk),
    totalLabel: formatCzk(totalCzk),
  });

  return {
    transactionId: input.transactionId,
    issuedAt: issuedAt.toISOString(),
    customerEmail: input.customerEmail,
    customerName,
    subtotalCzk,
    vatCzk,
    totalCzk,
    vatRate,
    html,
    pdfBase64,
  };
}

export async function generateInvoice(input: InvoiceInput): Promise<InvoiceDocument> {
  return generateInvoiceHtml(input);
}
