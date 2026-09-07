import { NextResponse } from "next/server";
import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { renderLlmsTxt } from "@/lib/seo/llms-txt";

export const dynamic = "force-dynamic";

const PACKS = ["cs", "de", "fr", "it", "es", "pt-BR", "en"] as const satisfies ChromePack[];

export function generateStaticParams() {
  return PACKS.map((pack) => ({ pack }));
}

async function packFromContext(context: {
  params?: Promise<{ pack?: string }> | { pack?: string };
}): Promise<string> {
  try {
    const raw = context.params;
    const resolved = raw && typeof (raw as Promise<unknown>).then === "function" ? await raw : raw;
    return String((resolved as { pack?: string } | undefined)?.pack ?? "en");
  } catch {
    return "en";
  }
}

export async function GET(
  _request: Request,
  context: { params?: Promise<{ pack?: string }> | { pack?: string } }
) {
  const decoded = decodeURIComponent(await packFromContext(context));
  const pack = decoded === "pt-BR" ? "pt-BR" : chromePack(decoded);
  if (!(PACKS as readonly string[]).includes(pack)) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new Response(renderLlmsTxt(pack), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
