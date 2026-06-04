import { extractFirstDoi } from "@/lib/ai/doi";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { generateCitationsWithAi, persistCitationsForArticle } from "@/lib/v5plus/citations";
import {
  persistEvidenceForArticle,
  scoreEvidenceWithAi,
} from "@/lib/v5plus/evidence-scoring";
import {
  fetchPubMedMetadata,
  upsertMedicalSourceFromPubMed,
} from "@/lib/v5plus/pubmed-metadata";

export async function enrichMedicalArticleWithEvidence(
  articleId: string
): Promise<{ ok: boolean; doi?: string | null }> {
  const admin = createServiceRoleClient();
  const { data: article } = await admin
    .from("medical_ai_texts")
    .select("id, title, content_cs, summary_clinician, doi, pubmed_id, source_url, categories, metadata")
    .eq("id", articleId)
    .maybeSingle();

  if (!article) return { ok: false };

  const blob = [
    article.title,
    article.content_cs,
    article.summary_clinician,
    article.source_url,
  ]
    .filter(Boolean)
    .join("\n");

  const doi =
    article.doi ?? extractFirstDoi(blob) ?? null;
  const pubmedId = article.pubmed_id ?? undefined;

  let meta = await fetchPubMedMetadata({ doi: doi ?? undefined, pubmedId });

  if (!meta && (doi || pubmedId)) {
    await upsertMedicalSourceFromPubMed({ doi: doi ?? undefined, pubmedId });
    meta = await fetchPubMedMetadata({ doi: doi ?? undefined, pubmedId });
  } else if (meta) {
    await upsertMedicalSourceFromPubMed({ doi: meta.doi ?? undefined, pubmedId: meta.pubmedId });
  }

  const abstract =
    meta?.abstract ??
    article.summary_clinician ??
    article.content_cs?.replace(/<[^>]+>/g, "").slice(0, 2000) ??
    "";

  const evidence = await scoreEvidenceWithAi({
    title: article.title,
    abstract,
    categories: article.categories as Record<string, unknown>,
  });
  await persistEvidenceForArticle(articleId, evidence);

  if (meta) {
    const citations = await generateCitationsWithAi(meta);
    await persistCitationsForArticle(articleId, meta, citations);
  }

  const metaPatch = {
    ...(article.metadata as Record<string, unknown>),
    v5plus: {
      doi: meta?.doi ?? doi,
      pubmed_id: meta?.pubmedId ?? pubmedId,
      evidence_level: evidence.evidence_level,
      enriched_at: new Date().toISOString(),
    },
  };

  await admin
    .from("medical_ai_texts")
    .update({
      doi: meta?.doi ?? doi ?? article.doi,
      pubmed_id: meta?.pubmedId ?? pubmedId ?? article.pubmed_id,
      metadata: metaPatch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  return { ok: true, doi: meta?.doi ?? doi };
}
