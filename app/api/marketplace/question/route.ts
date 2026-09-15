import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";
import { ingestMarketplaceIntake } from "@/lib/marketplace/intake";

export const dynamic = "force-dynamic";

const schema = z.object({
  company: z.string().min(2).max(200),
  contactName: z.string().max(120).optional(),
  contactEmail: z.string().email(),
  message: z.string().min(8).max(4000),
  termsAccepted: z.boolean().optional(),
  locale: z.string().max(16).optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: Boolean(process.env.TURNSTILE_SECRET_KEY),
    action: "marketplace_question",
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

  const result = await ingestMarketplaceIntake({
    kind: "question",
    company: body.company,
    title: `${copy.formTitle} — ${body.company}`,
    summary: body.message,
    contactName: body.contactName || body.company,
    contactEmail: body.contactEmail,
    source: "form",
    locale: body.locale,
  });
  if (!result.ok) {
    return NextResponse.json({ error: copy.apiUnavailable }, { status: 503 });
  }
  return NextResponse.json({
    ok: true,
    autoReplied: result.autoReplied,
    message: copy.apiQuestionOk,
  });
}
