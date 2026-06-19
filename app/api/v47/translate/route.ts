import { translateText } from "@/lib/v47/translation/engine";
import { parseV47Body, v47Json } from "@/lib/v47/api-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await parseV47Body<{ text?: string; sourceLocale?: string; targetLocale?: string }>(req);
  if (!body?.text?.trim() || !body.targetLocale?.trim()) {
    return v47Json({ error: "text and targetLocale required" }, 400);
  }

  const result = await translateText({
    text: body.text,
    sourceLocale: body.sourceLocale,
    targetLocale: body.targetLocale,
  });

  return v47Json(result, result.ok ? 200 : 503);
}
