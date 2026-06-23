import { NextResponse } from "next/server";
import { isGroqConfigured } from "@/lib/ai/groq";
import { getNzipIndexMap } from "@/lib/v19/nzip-index";
import { V19_SOURCE_TOPICS } from "@/lib/v19/sources";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";

export const runtime = "nodejs";

export async function GET() {
  const index = getNzipIndexMap();

  return NextResponse.json({
    status: "ok",
    engine: "v19",
    version: V19_ENGINE_VERSION,
    features: [
      "nzip-full-crawl",
      "nzip-index-map",
      "nzip-topic-registry",
      "nzip-category-registry",
      "nzip-keyword-registry",
      "legal-compliance",
      "science-tier",
      "mode-layers",
      "seo-jsonld-nzip-tags",
      "async-queue",
      "hub-links-glossary",
      "nzip-topic-cards",
    ],
    nzip: {
      indexPages: index.pageCount,
      indexSource: index.source,
      builtAt: index.builtAt,
      categories: index.categories.length,
      keywords: index.keywords.length,
      attribution: "Zdroj: NZIP.cz – Národní zdravotnický informační portál",
    },
    sources: { total: V19_SOURCE_TOPICS.length, tiers: ["cz", "eu", "world", "science"] },
    modes: ["doctor", "patient", "scientist"],
    endpoints: [
      "/api/v19/articles",
      "/api/v19/content/ls",
      "/api/v19/legal/ls",
      "/api/v19/science/ls",
      "/api/v19/ux/ls",
      "/api/v19/monitoring",
      "/api/v19/health",
      "/api/cron/v19-nzip-index",
    ],
    groq: isGroqConfigured(),
  });
}
