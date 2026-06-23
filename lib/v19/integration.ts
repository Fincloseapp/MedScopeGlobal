/**
 * v19.7 — napojení obsahu na další části MedScope
 */
import type { V19ArticlePayload } from "@/lib/v19/types";
import { isNzipSource } from "@/lib/v19/legal";

export type V19HubLinks = {
  briefs: string;
  aiHub: string;
  researchHub: string;
  drugs: string;
  algorithms: string;
  education: string;
  glossaryHub: string;
  diagnosis?: string;
};

export function resolveV19HubLinks(
  article: Pick<
    V19ArticlePayload,
    "specialty" | "sourceTier" | "articleType" | "sourceName" | "sourceUrl" | "nzipCategory"
  >
): V19HubLinks {
  const isScience = article.sourceTier === "science";
  const isNzip = isNzipSource(article.sourceName, article.sourceUrl);
  const isGlossary =
    article.nzipCategory === "slovnik-pojmu" ||
    article.nzipCategory === "zdravotnicke-pojmy";

  return {
    briefs: "/odborne/briefy",
    aiHub: "/ai-medical",
    researchHub: isScience ? "/ai-medical/research" : "/research/articles",
    drugs: "/leky",
    algorithms: "/ai-medical",
    education: "/odborne/briefy?mode=patient",
    glossaryHub: isGlossary
      ? "/api/v19/content/ls?category=slovnik-pojmu"
      : "/odborne/briefy?mode=patient&tags=glossary",
    diagnosis: `/ai-medical?topic=${encodeURIComponent(article.specialty)}`,
  };
}
