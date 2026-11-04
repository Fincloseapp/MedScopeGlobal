import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { createPausalOrder } from "@/lib/sales/order";
import { isSalesPackageId } from "@/lib/sales/packages";
import { applySalesDepartmentSchema } from "@/lib/sales/apply-schema";

export const dynamic = "force-dynamic";

const schema = z.object({
  company: z.string().min(2).max(200),
  contactName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  ico: z.string().max(20).optional(),
  dic: z.string().max(20).optional(),
  address: z.string().max(240).optional(),
  website: z.string().max(240).optional(),
  offerText: z.string().max(2000).optional(),
  packageId: z.string().min(2).max(40),
  termsAccepted: z.boolean(),
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
    ico: body.ico ? sanitizeText(body.ico, 20) : undefined,
    dic: body.dic ? sanitizeText(body.dic, 20) : undefined,
    address: body.address ? sanitizeText(body.address, 240) : undefined,
    website: body.website ? sanitizeText(body.website, 240) : undefined,
    offerText: body.offerText ? sanitizeText(body.offerText, 2000) : undefined,
    packageId: body.packageId,
    termsAccepted: true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "order_failed" }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    contractId: result.contract?.id,
    portalUrl: result.contract ? `/inzerenti/portal?token=${result.contract.portal_token}` : null,
    checkoutUrl: result.checkoutUrl,
    invoiceNumber: result.invoiceNumber,
    variableSymbol: result.variableSymbol,
  });
}
