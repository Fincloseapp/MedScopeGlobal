import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { chooseMarketplaceOffer, chooseOfferSchema } from "@/lib/marketplace/choose";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: Boolean(process.env.TURNSTILE_SECRET_KEY),
    action: "marketplace_choose",
  });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof chooseOfferSchema>;
  try {
    body = chooseOfferSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný výběr dodavatele." }, { status: 400 });
  }

  const result = await chooseMarketplaceOffer(body);
  if (!result.ok) {
    const messages: Record<string, string> = {
      terms_required: "Potřebujeme souhlas se zpracováním firemního e-mailu.",
      database_unavailable: "Tržiště teď nemůže uložit výběr. Zkuste to znovu.",
      offer_not_found: "Nabídka už není viditelná.",
      save_failed: "Výběr se neuložil.",
    };
    return NextResponse.json(
      { error: messages[result.error ?? ""] ?? "Výběr se nepodařil." },
      { status: result.error === "database_unavailable" ? 503 : 400 }
    );
  }
  return NextResponse.json({
    ok: true,
    matched: true,
    message: "Dodavatel je oslovený přes tržiště. Veřejný telefon ani osobní e-mail se nezveřejňuje.",
  });
}
