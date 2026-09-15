import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";
import { ingestMarketplaceIntake } from "@/lib/marketplace/intake";

export const dynamic = "force-dynamic";

const schema = z.object({
  kind: z.enum(["offer", "demand", "question"]),
  locale: z.string().max(16).optional(),
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

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: getMarketplaceUiCopy().apiInvalid }, { status: 400 });
  }

  const hintedLocale =
    raw && typeof raw === "object" && "locale" in raw && typeof (raw as { locale?: unknown }).locale === "string"
      ? (raw as { locale: string }).locale
      : undefined;
  const copy = getMarketplaceUiCopy(hintedLocale);

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(raw);
  } catch {
    return NextResponse.json({ error: copy.apiInvalid }, { status: 400 });
  }
  if (body.termsAccepted === false) {
    return NextResponse.json({ error: copy.apiTerms }, { status: 400 });
  }

  const { termsAccepted: _terms, locale, ...intake } = body;
  const result = await ingestMarketplaceIntake({
    ...intake,
    locale,
    contactName: body.contactName || body.company,
    source: "form",
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error === "database_unavailable" ? copy.apiUnavailable : copy.apiSaveFailed },
      { status: result.error === "database_unavailable" ? 503 : 500 }
    );
  }

  const messages: Record<string, string> = {
    offer: copy.apiOfferOk,
    demand: copy.apiDemandOk,
    question: copy.apiQuestionOk,
  };

  return NextResponse.json({
    ok: true,
    id: result.listing?.id,
    autoReplied: result.autoReplied,
    message: messages[body.kind],
  });
}
