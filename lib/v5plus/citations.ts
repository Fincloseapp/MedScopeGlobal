import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import { doiToUrl } from "@/lib/ai/doi";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { PubMedMetadata } from "@/lib/v5plus/pubmed-metadata";

export type CitationFormat = "vancouver" | "apa" | "harvard";

function ruleBasedVancouver(meta: PubMedMetadata): string {
  const year = meta.year ?? "n.d.";
  const authors = meta.authors || "Anonymous";
  return `${authors}. ${meta.title}. ${meta.journal}. ${year}.${meta.doi ? ` doi:${meta.doi}` : ""}`;
}

function ruleBasedApa(meta: PubMedMetadata): string {
  const year = meta.year ?? "n.d.";
  const authors = meta.authors || "Anonymous";
  return `${authors} (${year}). ${meta.title}. ${meta.journal}.${meta.doi ? ` https://doi.org/${meta.doi}` : ""}`;
}

function ruleBasedHarvard(meta: PubMedMetadata): string {
  const year = meta.year ?? "n.d.";
  const authors = meta.authors || "Anonymous";
  return `${authors} ${year}, '${meta.title}', ${meta.journal}${meta.doi ? `, viewed ${new Date().toISOString().slice(0, 10)}, doi:${meta.doi}` : ""}.`;
}

export async function generateCitationsWithAi(meta: PubMedMetadata): Promise<
  Record<CitationFormat, string>
> {
  const fallback = {
    vancouver: ruleBasedVancouver(meta),
    apa: ruleBasedApa(meta),
    harvard: ruleBasedHarvard(meta),
  };

  if (!isLlmConfigured()) return fallback;

  const system = `Jsi bibliografický asistent. Generuj přesné citace ve formátech Vancouver, APA a Harvard z poskytnutých metadat. JSON only.`;

  const user = `Title: ${meta.title}
Authors: ${meta.authors}
Journal: ${meta.journal}
Year: ${meta.year ?? ""}
DOI: ${meta.doi ?? ""}
URL: ${meta.url}

JSON:
{
  "vancouver": "...",
  "apa": "...",
  "harvard": "..."
}`;

  try {
    const raw = await generateJsonFromLlm({ system, user, maxTokens: 900 });
    if (!raw) return fallback;
    const p = JSON.parse(raw) as Record<string, string>;
    return {
      vancouver: p.vancouver ?? fallback.vancouver,
      apa: p.apa ?? fallback.apa,
      harvard: p.harvard ?? fallback.harvard,
    };
  } catch {
    return fallback;
  }
}

export async function persistCitationsForArticle(
  articleId: string,
  meta: PubMedMetadata,
  citations: Record<CitationFormat, string>
): Promise<void> {
  const admin = createServiceRoleClient();
  const url = meta.doi ? doiToUrl(meta.doi) : meta.url;

  for (const format of ["vancouver", "apa", "harvard"] as CitationFormat[]) {
    await admin
      .from("medical_citations")
      .delete()
      .eq("article_id", articleId)
      .eq("citation_format", format);
    await admin.from("medical_citations").insert({
      article_id: articleId,
      citation_format: format,
      citation_text: citations[format],
      doi: meta.doi,
      url,
    });
  }
}
