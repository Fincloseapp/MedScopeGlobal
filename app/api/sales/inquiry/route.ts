import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { applySalesDepartmentSchema } from "@/lib/sales/apply-schema";
import { fulfillInquiry, inquirySlaDue } from "@/lib/sales/fulfillment";
import { salesPackageById } from "@/lib/sales/packages";
import {
  findActiveContractBySlug,
  findProspectBySlug,
  insertInquiry,
  listProspects,
  salesDb,
} from "@/lib/sales/store";

export const dynamic = "force-dynamic";

const schema = z.object({
  slug: z.string().min(2).max(80),
  senderName: z.string().min(2).max(120),
  senderEmail: z.string().email(),
  message: z.string().min(8).max(4000),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { requireCaptcha: false, action: "sales_inquiry" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatná poptávka." }, { status: 400 });
  }

  await applySalesDepartmentSchema();
  const db = salesDb(null);
  if (!db) return NextResponse.json({ error: "Služba je dočasně nedostupná." }, { status: 503 });

  const slug = sanitizeText(body.slug, 80);
  const contract = await findActiveContractBySlug(db, slug);
  const prospect = contract
    ? (await listProspects(db, 400)).find((p) => p.id === contract.prospect_id) ?? null
    : await findProspectBySlug(db, slug);
  const pkg = contract ? salesPackageById(contract.package_id) : null;

  const inquiry = await insertInquiry(db, {
    contract_id: contract?.id ?? null,
    prospect_id: prospect?.id ?? contract?.prospect_id ?? null,
    landing_slug: slug,
    company_name: prospect?.company ?? slug,
    sender_name: sanitizeText(body.senderName, 120),
    sender_email: body.senderEmail.trim().toLowerCase(),
    message: sanitizeText(body.message, 4000),
    status: "received",
    sla_due_at: inquirySlaDue(pkg?.slaHours ?? 72),
  });
  if (!inquiry) return NextResponse.json({ error: "Uložení poptávky selhalo." }, { status: 503 });

  const out = await fulfillInquiry(db, inquiry, contract, prospect ?? null);
  return NextResponse.json({
    ok: true,
    forwarded: out.forwarded,
    held: out.held,
    message: out.held
      ? "Poptávka je uložená. Inzerent ji dostane, jakmile je paušál aktivní."
      : "Poptávka byla předána inzerentovi.",
  });
}
