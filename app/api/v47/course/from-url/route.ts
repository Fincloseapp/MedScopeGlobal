import { generateCourseFromUrl } from "@/lib/v47/course-from-url/generator";
import { parseV47Body, v47Json } from "@/lib/v47/api-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await parseV47Body<{ url?: string; title?: string }>(req);
  if (!body?.url?.trim()) return v47Json({ error: "url required" }, 400);
  const result = await generateCourseFromUrl({ url: body.url, title: body.title });
  return v47Json(result, result.ok ? 200 : 503);
}
