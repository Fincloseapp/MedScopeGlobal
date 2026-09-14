import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { ingestMarketplaceIntake } from "@/lib/marketplace/intake";

export const dynamic = "force-dynamic";

const schema = z.object({
  kind: z.enum(["offer", "demand", "question"]),
  company: z.string().min(2).max(200),
  title: z.string().min(4).max(180),
  summary: z.string().min(8).max(4000),
  category: z.string().max(80).optional(),
  region: z.string().max(80).optional(),
  cert: z.string().max(80).optional(),
  contactName: z.string().max(120).optional(),
  contactEmail: z.string().email(),
  phone: z.string().max(40).optional(),
  termsAccepted: z.boolean().optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: Boolean(process.env.TURNSTILE_SECRET_KEY),
    action: "marketplace_listing",
  });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný formulář." }, { status: 400 });
  }
  if (body.termsAccepted === false) {
    return NextResponse.json({ error: "Potřebujeme souhlas se zpracováním firemního e-mailu." }, { status: 400 });
  }

  const { termsAccepted: _terms, ...intake } = body;
  const result = await ingestMarketplaceIntake({
    ...intake,
    contactName: body.contactName || body.company,
    source: "form",
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error === "database_unavailable" ? "Služba je dočasně nedostupná." : "Uložení selhalo." },
      { status: result.error === "database_unavailable" ? 503 : 500 }
    );
  }

  const messages: Record<string, string> = {
    offer:
      "Nabídka je na tržišti. Na e-mail jde potvrzení a ceník paušálu — kontakty z poptávek dostanete po aktivaci.",
    demand: "Poptávka je zveřejněná. Inzerenti s paušálem dostanou kontakt e-mailem. Vy nic neplatíte.",
    question: "Dotaz jsme přijali. Automatická odpověď jde na váš e-mail, obchodní oddělení naváže podle potřeby.",
  };

  return NextResponse.json({
    ok: true,
    id: result.listing?.id,
    autoReplied: result.autoReplied,
    message: messages[body.kind],
  });
}
