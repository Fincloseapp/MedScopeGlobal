import { fetchPubMedItems } from "@/lib/ingestion/pubmed";
import { extractFirstDoi } from "@/lib/ai/doi";
import { enrichMedicalArticleWithEvidence } from "@/lib/v5plus/enrich-article";
import { upsertMedicalSourceFromPubMed } from "@/lib/v5plus/pubmed-metadata";
import { SPECIALTY_PUBMED_QUERIES } from "@/lib/v4d/constants";

export async function runDailyPubmedUpdate(): Promise<{
  sources: number;
  enriched: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let sources = 0;
  let enriched = 0;

  const queries = Object.entries(SPECIALTY_PUBMED_QUERIES).slice(0, 4);

  for (const [, query] of queries) {
    try {
      const items = await fetchPubMedItems(query, "V5+ daily", 3);
      await new Promise((r) => setTimeout(r, 500));

      for (const item of items) {
        const pmid = item.link?.match(/(\d+)\/?$/)?.[1];
        const doi = extractFirstDoi(`${item.title} ${item.description}`);
        try {
          const r = await upsertMedicalSourceFromPubMed({
            pubmedId: pmid,
            doi: doi ?? undefined,
          });
          if (r) sources++;
        } catch (e) {
          errors.push((e as Error).message);
        }
      }
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  const { createServiceRoleClient } = await import("@/lib/supabase/service");
  const admin = createServiceRoleClient();
  const { data: recent } = await admin
    .from("medical_ai_texts")
    .select("id")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  for (const row of recent ?? []) {
    try {
      await enrichMedicalArticleWithEvidence(row.id);
      enriched++;
    } catch (e) {
      errors.push(`enrich ${row.id}: ${(e as Error).message}`);
    }
  }

  return { sources, enriched, errors };
}
