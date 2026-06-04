import { createServiceRoleClient } from "@/lib/supabase/service";
import { categorizeMedicalText } from "@/lib/v4d/categorize";
import { enrichMedicalArticleWithEvidence } from "@/lib/v5plus/enrich-article";
import { evaluateQuality, persistQuality } from "@/lib/v4d/quality";
import type { V4dSpecialty } from "@/lib/v4d/constants";
import { processMedicalTextWithAi } from "@/lib/v4d/medical-ai-process";

export type AutopublishInput = {
  title: string;
  content_cs?: string;
  summary_clinician?: string;
  summary_patient?: string;
  source_name: string;
  source_url: string;
  specialty?: V4dSpecialty;
  categories?: Record<string, unknown>;
  study_source_id?: string | null;
  pubmed_id?: string | null;
  doi?: string | null;
};

function slugify(title: string): string {
  return `${title}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70)
    .concat(`-${Date.now().toString(36)}`);
}

/**
 * V6 autopublish — generates article, citations, evidence, metadata; stores in medical_ai_texts (medical_articles view).
 */
export async function runAutopublishFromSource(
  input: AutopublishInput
): Promise<{ articleId: string; published: boolean }> {
  const admin = createServiceRoleClient();
  const specialty = (input.specialty ?? "rheumatology") as V4dSpecialty;

  const categories = await categorizeMedicalText({
    title: input.title,
    raw: input.content_cs ?? input.summary_clinician ?? input.title,
    specialty,
    originalLanguage: "en",
  });

  const mergedCategories = {
    ...categories,
    ...(input.categories ?? {}),
    v6_autopublish: true,
  };

  let processed = {
    title: input.title,
    content_cs: input.content_cs ?? "",
    summary_clinician: input.summary_clinician ?? "",
    summary_patient: input.summary_patient ?? "",
    metadata: { v6: "autopublish", source: input.source_name } as Record<string, unknown>,
  };

  if (!input.content_cs || input.content_cs.length < 200) {
    processed = await processMedicalTextWithAi({
      title: input.title,
      description: input.summary_clinician ?? input.title,
      sourceUrl: input.source_url,
      sourceName: input.source_name,
      originalLanguage: "en",
      specialty,
      categories: mergedCategories,
    });
  }

  const slug = slugify(processed.title);
  const { data: inserted, error } = await admin
    .from("medical_ai_texts")
    .insert({
      study_source_id: input.study_source_id ?? null,
      title: processed.title,
      slug,
      original_language: "en",
      content_cs: processed.content_cs,
      summary_clinician: processed.summary_clinician,
      summary_patient: processed.summary_patient,
      doi: input.doi ?? null,
      pubmed_id: input.pubmed_id ?? null,
      source_url: input.source_url,
      source_name: input.source_name,
      specialty,
      categories: mergedCategories,
      metadata: {
        ...processed.metadata,
        autopublish_at: new Date().toISOString(),
      },
      ai_metadata: { engine: "v6-autopilot" },
      quality_passed: false,
      published: true,
      archived: false,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await admin
        .from("medical_ai_texts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (existing) return { articleId: existing.id, published: true };
    }
    throw new Error(error.message);
  }

  const articleId = inserted.id as string;

  const quality = await evaluateQuality({
    title: processed.title,
    description: processed.content_cs || processed.summary_clinician,
    sourceUrl: input.source_url,
    doi: input.doi ?? null,
    originalLanguage: "en",
  });
  await persistQuality(articleId, quality);

  await admin
    .from("medical_ai_texts")
    .update({ quality_passed: quality.passed, updated_at: new Date().toISOString() })
    .eq("id", articleId);

  await enrichMedicalArticleWithEvidence(articleId);

  return { articleId, published: true };
}

export async function runDailyAutopublish(): Promise<{
  published: number;
  errors: string[];
}> {
  const admin = createServiceRoleClient();
  const { data: sources } = await admin
    .from("medical_sources")
    .select("id, title, abstract, url, doi, pubmed_id, source_type")
    .eq("validated", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const errors: string[] = [];
  let published = 0;

  for (const src of sources ?? []) {
    try {
      const r = await runAutopublishFromSource({
        title: src.title,
        content_cs: src.abstract ?? undefined,
        summary_clinician: src.abstract?.slice(0, 500),
        source_name: src.source_type?.toUpperCase() ?? "SOURCE",
        source_url: src.url ?? `https://pubmed.ncbi.nlm.nih.gov/${src.pubmed_id ?? ""}`,
        study_source_id: null,
        pubmed_id: src.pubmed_id,
        doi: src.doi,
        specialty: "rheumatology",
      });
      if (r.articleId) published++;
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  return { published, errors };
}
