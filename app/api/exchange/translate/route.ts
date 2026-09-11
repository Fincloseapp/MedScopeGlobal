import { NextResponse } from "next/server";
import { z } from "zod";
import { translateExchangeText, translateListingFields } from "@/lib/exchange/translate";
import { withApiGuard } from "@/lib/security/api-guard";
import { EXCHANGE_TARGET_LOCALES } from "@/lib/exchange/locales";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({
  text: z.string().min(1).max(8000).optional(),
  title: z.string().max(180).optional(),
  summary: z.string().max(400).optional(),
  description: z.string().max(8000).optional(),
  sourceLocale: z.string().min(2).max(16).optional(),
  targetLocale: z.string().min(2).max(16),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_translate" });
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (parsed.data.title && parsed.data.summary && parsed.data.description) {
    const fields = await translateListingFields({
      title: parsed.data.title,
      summary: parsed.data.summary,
      description: parsed.data.description,
      sourceLocale: parsed.data.sourceLocale ?? "en",
      targetLocale: parsed.data.targetLocale,
    });
    return NextResponse.json({ ok: true, fields, locales: EXCHANGE_TARGET_LOCALES });
  }

  if (!parsed.data.text) {
    return NextResponse.json({ error: "text or listing fields required" }, { status: 400 });
  }

  const result = await translateExchangeText({
    text: parsed.data.text,
    sourceLocale: parsed.data.sourceLocale,
    targetLocale: parsed.data.targetLocale,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
