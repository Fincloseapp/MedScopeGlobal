import { generateVideoFromContent } from "@/lib/v47/video/from-content";
import { parseV47Body, v47Json } from "@/lib/v47/api-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await parseV47Body<{ title?: string; content?: string; type?: "article" | "course" }>(req);
  if (!body?.title?.trim() || !body?.content?.trim()) {
    return v47Json({ error: "title and content required" }, 400);
  }
  const result = await generateVideoFromContent({
    title: body.title,
    content: body.content,
    type: body.type,
  });
  return v47Json(result, result.ok ? 200 : 503);
}
