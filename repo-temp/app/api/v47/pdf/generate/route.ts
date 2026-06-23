import { generatePdfSummary } from "@/lib/v47/pdf/generator";
import { parseV47Body, v47Json } from "@/lib/v47/api-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await parseV47Body<{ topic?: string; content?: string }>(req);
  if (!body?.topic?.trim()) return v47Json({ error: "topic required" }, 400);
  const result = await generatePdfSummary({ topic: body.topic, content: body.content });
  return v47Json(result, result.ok ? 200 : 503);
}
