import { NextResponse } from "next/server";
import { isGroqConfigured } from "@/lib/ai/groq";
import { getNzipIndexMap } from "@/lib/v19/nzip-index";
import { buildNzipDeepRegistries } from "@/lib/v19/nzip-registries";
import { V19_SOURCE_TOPICS } from "@/lib/v19/sources";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";

export const runtime = "nodejs";

export async function GET() {
  const index = getNzipIndexMap();
  const reg = buildNzipDeepRegistries();

  return NextResponse.json({
    status: "ok",
    engine: "v19",
    version: V19_ENGINE_VERSION,
    features: [
      "nzip-deep-integration",
      "nzip-deep-registries",
      "nzip-auto-linking",
      "nzip-glossary-tooltips",
      "nzip-educational-links",
      "legal-compliance",
      "science-tier",
      "mode-layers",
      "seo-jsonld-nzip-tags",
      "hub-links-science-glossary",
    ],
    nzip: {
      indexPages: index.pageCount,
      registryCounts: reg.counts,
      builtAt: index.builtAt,
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
      "/api/cron/v19-nzip-index",
      "/api/cron/v19-nzip-refresh",
    ],
    groq: isGroqConfigured(),
  });
}
