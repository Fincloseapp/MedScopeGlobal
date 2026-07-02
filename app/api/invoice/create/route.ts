import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { generateInvoice } from "@/lib/billing/invoice-generator";
import { sendEmail } from "@/lib/email/engine";
import { loadEmailTemplate } from "@/lib/email/ai-generator";
import { z } from "zod";

const bodySchema = z.object({
  transactionId: z.string().min(1),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  lineItems: z.array(
    z.object({
      description: z.string().min(1),
      amountCzk: z.number().positive(),
    })
  ).min(1),
  vatRate: z.number().min(0).max(100).optional(),
  sendEmail: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const invoice = await generateInvoice(parsed.data);
  let emailResult = null;

  if (parsed.data.sendEmail !== false) {
    const tpl = loadEmailTemplate("invoice", {
      invoiceId: invoice.transactionId,
      date: new Date(invoice.issuedAt).toLocaleDateString("cs-CZ"),
      customerName: invoice.customerName,
      description: parsed.data.lineItems.map((i) => i.description).join(", "),
      amount: `${invoice.subtotalCzk} Kč`,
      vat: `${invoice.vatCzk} Kč`,
      total: `${invoice.totalCzk} Kč`,
    });

    emailResult = await sendEmail({
      to: parsed.data.customerEmail,
      subject: `Faktura ${invoice.transactionId} — MedScopeGlobal`,
      html: invoice.html || tpl,
      category: "transactional",
      attachments: [
        {
          filename: `faktura-${invoice.transactionId}.html`,
          content: invoice.html,
          type: "text/html",
        },
      ],
      metadata: { transactionId: invoice.transactionId },
    });
  }

  return NextResponse.json({
    ok: true,
    invoice: {
      transactionId: invoice.transactionId,
      issuedAt: invoice.issuedAt,
      subtotalCzk: invoice.subtotalCzk,
      vatCzk: invoice.vatCzk,
      totalCzk: invoice.totalCzk,
      html: invoice.html,
      pdfBase64: invoice.pdfBase64,
    },
    email: emailResult,
  });
}
