import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { createPausalOrder } from "@/lib/sales/order";
import { isSalesPackageId } from "@/lib/sales/packages";
import { applySalesDepartmentSchema } from "@/lib/sales/apply-schema";
import { salesPayInstructions } from "@/lib/sales/pay";

export const dynamic = "force-dynamic";

const schema = z.object({
  company: z.string().min(2).max(200),
  contactName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  ico: z.string().min(8).max(20),
  dic: z.string().max(20).optional(),
  address: z.string().min(8).max(240),
  website: z.string().max(240).optional(),
  offerText: z.string().max(2000).optional(),
  packageId: z.string().min(2).max(40),
  billingInterval: z.enum(["month", "year"]).optional(),
  termsAccepted: z.boolean(),
  locale: z.string().max(16).optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { requireCaptcha: false, action: "sales_order" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatné údaje." }, { status: 400 });
  }
  if (!isSalesPackageId(body.packageId)) {
    return NextResponse.json({ error: "Neznámý paušál." }, { status: 400 });
  }
  if (!body.termsAccepted) {
    return NextResponse.json({ error: "Potřebujeme souhlas s podmínkami inzerce." }, { status: 400 });
  }

  await applySalesDepartmentSchema();
  const result = await createPausalOrder({
    company: sanitizeText(body.company, 200),
    contactName: sanitizeText(body.contactName, 120),
    email: body.email.trim().toLowerCase(),
    ico: sanitizeText(body.ico, 20),
    dic: body.dic ? sanitizeText(body.dic, 20) : undefined,
    address: sanitizeText(body.address, 240),
    website: body.website ? sanitizeText(body.website, 240) : undefined,
    offerText: body.offerText ? sanitizeText(body.offerText, 2000) : undefined,
    packageId: body.packageId,
    billingInterval: body.billingInterval,
    termsAccepted: true,
    locale: body.locale,
  });

  if (!result.ok) {
    const messages: Record<string, string> = {
      terms_required: "Potřebujeme souhlas s podmínkami inzerce.",
      unknown_package: "Neznámý paušál.",
      ico_required: "IČO musí mít 8 číslic.",
      address_required: "Doplňte fakturační adresu.",
      prospect_failed: "Nepodařilo se založit firmu. Napište na inzerce@medscopeglobal.com.",
      contract_failed: "Smlouvu se nepodařilo uložit. Zkuste kartu přes Stripe, nebo napište na inzerce@.",
    };
    return NextResponse.json(
      { error: messages[result.error ?? ""] ?? "Objednávku se nepodařilo dokončit." },
      { status: result.error === "ico_required" || result.error === "address_required" || result.error === "terms_required" ? 400 : 503 }
    );
  }

  const pay = salesPayInstructions();
  return NextResponse.json({
    ok: true,
    mode: result.mode,
    contractId: result.contract?.id,
    portalUrl: result.contract ? `/inzerenti/portal?token=${result.contract.portal_token}` : null,
    checkoutUrl: result.checkoutUrl,
    invoiceNumber: result.invoiceNumber,
    variableSymbol: result.variableSymbol,
    pay,
  });
}
