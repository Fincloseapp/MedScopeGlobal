import { handleAiHop } from "@/lib/growth/ai-hop-handler";

export const dynamic = "force-dynamic";

/** Path hop that search engines crawl more reliably than `?ref=`. */
export async function GET(request: Request, context: { params: Promise<{ agent: string }> }) {
  const { agent } = await context.params;
  return handleAiHop(request, agent);
}
