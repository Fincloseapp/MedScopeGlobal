import { NextResponse } from "next/server";
import { crawlNzipPublicIndex } from "@/lib/v19/nzip-crawl";
import { getNzipIndexMap, listNzipIndexEntries } from "@/lib/v19/nzip-index";
import { buildNzipDeepRegistries } from "@/lib/v19/nzip-registries";
import type { NzipCategory, V19Specialty } from "@/lib/v19/types";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const refresh = url.searchParams.get("refresh") === "1";
  const deep = url.searchParams.get("deep") !== "0";
  const category = url.searchParams.get("category") as NzipCategory | null;
  const specialty = url.searchParams.get("specialty") as V19Specialty | null;
  const limit = Math.min(100, Number(url.searchParams.get("limit") ?? 30));
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));

  let crawlResult = null;
  if (refresh) {
    crawlResult = await crawlNzipPublicIndex();
  }

  const index = getNzipIndexMap();
  const registries = deep ? buildNzipDeepRegistries() : null;
  const { entries, total } = listNzipIndexEntries({
    category: category ?? undefined,
    specialty: specialty ?? undefined,
    limit,
    offset,
  });

  return NextResponse.json({
    status: "ok",
    engine: "v19",
    engineVersion: V19_ENGINE_VERSION,
    index: {
      version: index.version,
      builtAt: index.builtAt,
      source: index.source,
      pageCount: index.pageCount,
      categoryCount: index.categories.length,
      keywordCount: index.keywords.length,
    },
    deepRegistries: registries
      ? {
          version: registries.version,
          builtAt: registries.builtAt,
          counts: registries.counts,
          glossary: registries.glossary.slice(0, 20),
          education: registries.education.slice(0, 20),
          publication: registries.publication.slice(0, 20),
          prevention: registries.prevention.slice(0, 10),
        }
      : undefined,
    categories: index.categories,
    keywords: index.keywords.slice(0, 50),
    topics: entries,
    pagination: { total, limit, offset },
    crawl: crawlResult,
  });
}
