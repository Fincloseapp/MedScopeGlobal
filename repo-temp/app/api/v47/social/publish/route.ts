import { publishToSocial } from "@/lib/v47/social/publisher";
import { parseV47Body, v47Json } from "@/lib/v47/api-helpers";
import type { SocialPlatform } from "@/lib/v47/social/publisher";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await parseV47Body<{
    platform?: SocialPlatform;
    title?: string;
    content?: string;
    mediaUrl?: string;
  }>(req);
  if (!body?.platform || !body?.title?.trim() || !body?.content?.trim()) {
    return v47Json({ error: "platform, title, content required" }, 400);
  }
  const result = await publishToSocial({
    platform: body.platform,
    title: body.title,
    content: body.content,
    mediaUrl: body.mediaUrl,
  });
  return v47Json(result, result.ok ? 200 : 503);
}
