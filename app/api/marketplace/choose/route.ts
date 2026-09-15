import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";
import { chooseMarketplaceOffer, chooseOfferSchema } from "@/lib/marketplace/choose";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: Boolean(process.env.TURNSTILE_SECRET_KEY),
    action: "marketplace_choose",
  });
  if (!guard.ok) return guard.response;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: getMarketplaceUiCopy().apiChooseInvalid }, { status: 400 });
  }
  const hintedLocale =
    raw && typeof raw === "object" && "locale" in raw && typeof (raw as { locale?: unknown }).locale === "string"
      ? (raw as { locale: string }).locale
      : undefined;
  const copy = getMarketplaceUiCopy(hintedLocale);

  let body: z.infer<typeof chooseOfferSchema>;
  try {
    body = chooseOfferSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: copy.apiChooseInvalid }, { status: 400 });
  }

  const result = await chooseMarketplaceOffer(body);
  if (!result.ok) {
    const messages: Record<string, string> = {
      terms_required: copy.apiTerms,
      database_unavailable: copy.apiUnavailable,
      offer_not_found: copy.chooseFailed,
      save_failed: copy.apiSaveFailed,
    };
    return NextResponse.json(
      { error: messages[result.error ?? ""] ?? copy.chooseFailed },
      { status: result.error === "database_unavailable" ? 503 : 400 }
    );
  }
  return NextResponse.json({
    ok: true,
    matched: true,
    message: copy.apiChooseOk,
  });
}
