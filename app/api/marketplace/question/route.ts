import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { ingestMarketplaceIntake } from "@/lib/marketplace/intake";

export const dynamic = "force-dynamic";

const schema = z.object({
  company: z.string().min(2).max(200),
  contactName: z.string().min(2).max(120),
  contactEmail: z.string().email(),
  message: z.string().min(8).max(4000),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { requireCaptcha: false, action: "marketplace_question" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný dotaz." }, { status: 400 });
  }

  const result = await ingestMarketplaceIntake({
    kind: "question",
    company: body.company,
    title: `Dotaz inzerenta — ${body.company}`,
    summary: body.message,
    contactName: body.contactName,
    contactEmail: body.contactEmail,
    source: "form",
  });
  if (!result.ok) {
    return NextResponse.json({ error: "Dotaz se nepodařilo uložit." }, { status: 503 });
  }
  return NextResponse.json({
    ok: true,
    autoReplied: result.autoReplied,
    message: "Odpověď jde na e-mail. Můžete také napsat na inzerce@medscopeglobal.com.",
  });
}
