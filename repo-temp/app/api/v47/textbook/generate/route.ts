import { generateTextbook } from "@/lib/v47/textbook/generator";
import { parseV47Body, v47Json } from "@/lib/v47/api-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await parseV47Body<{ topic?: string; level?: "student" | "physician"; chapters?: number }>(req);
  if (!body?.topic?.trim()) return v47Json({ error: "topic required" }, 400);
  const result = await generateTextbook({
    topic: body.topic,
    level: body.level,
    chapters: body.chapters,
  });
  return v47Json(result, result.ok ? 200 : 503);
}
