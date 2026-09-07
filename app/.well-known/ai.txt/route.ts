import { logAiCrawlerVisit } from "@/lib/growth/ai-crawler";
import { renderWellKnownAiTxt } from "@/lib/seo/llms-txt";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await logAiCrawlerVisit(request, "/.well-known/ai.txt", "en");
  return new Response(renderWellKnownAiTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
