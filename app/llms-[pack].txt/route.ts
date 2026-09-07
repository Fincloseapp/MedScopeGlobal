import { NextResponse } from "next/server";
import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { renderLlmsTxt } from "@/lib/seo/llms-txt";

export const revalidate = 3600;

const PACKS = new Set<ChromePack>(["cs", "de", "fr", "it", "es", "pt-BR", "en"]);

export async function GET(_request: Request, context: { params: Promise<{ pack: string }> }) {
  const { pack: raw } = await context.params;
  const decoded = decodeURIComponent(raw ?? "en");
  const pack = decoded === "pt-BR" ? "pt-BR" : chromePack(decoded);
  if (!PACKS.has(pack)) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new Response(renderLlmsTxt(pack), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
