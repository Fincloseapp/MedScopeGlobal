import { auditSeo } from "@/lib/v47/seo/audit";
import { parseV47Body, v47Json } from "@/lib/v47/api-helpers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await parseV47Body<{ url?: string; title?: string; content?: string }>(req);
  const result = await auditSeo({
    url: body?.url,
    title: body?.title,
    content: body?.content,
  });
  return v47Json(result);
}
