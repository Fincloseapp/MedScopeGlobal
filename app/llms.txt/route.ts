import { logAiCrawlerVisit } from "@/lib/growth/ai-crawler";
import { chromePack } from "@/lib/i18n/chrome-pack";
import { renderLlmsTxt } from "@/lib/seo/llms-txt";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang");
  const locale = lang ? chromePack(lang) : "en";
  await logAiCrawlerVisit(request, "/llms.txt", locale);
  return new Response(renderLlmsTxt(locale), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
