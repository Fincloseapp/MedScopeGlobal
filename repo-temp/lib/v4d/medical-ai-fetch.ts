import { createServiceRoleClient } from "@/lib/supabase/service";
import { fetchPubMedItems } from "@/lib/ingestion/pubmed";
import { categorizeMedicalText } from "@/lib/v4d/categorize";
import {
  MAX_TEXTS_PER_RUN,
  SPECIALTY_PUBMED_QUERIES,
  type V4dSpecialty,
} from "@/lib/v4d/constants";
import {
  detectLanguage,
  isAllowedLanguage,
  isMedicalRelevant,
  matchesSpecialty,
} from "@/lib/v4d/filters";
import { processMedicalTextWithAi } from "@/lib/v4d/medical-ai-process";
import { evaluateQuality, persistQuality } from "@/lib/v4d/quality";
import { enrichMedicalArticleWithEvidence } from "@/lib/v5plus/enrich-article";
import { extractFirstDoi } from "@/lib/ai/doi";

export type MedicalAiFetchResult = {
  runId: string;
  created: number;
  skipped: number;
  errors: string[];
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

function matchSourceId(
  sources: { id: string; name: string; region: string }[],
  itemTitle: string,
  itemDesc: string
): string | null {
  const blob = `${itemTitle} ${itemDesc}`.toLowerCase();
  for (const s of sources) {
    const key = s.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((w) => w.length > 3)[0];
    if (key && blob.includes(key)) return s.id;
  }
  const cz = sources.find((s) => s.region === "cz");
  return cz?.id ?? sources[0]?.id ?? null;
}

async function logEvent(
  runId: string,
  logType: string,
  message: string,
  details?: Record<string, unknown>,
  refs?: { study_source_id?: string; text_id?: string }
) {
  const admin = createServiceRoleClient();
  await admin.from("medical_ai_logs").insert({
    run_id: runId,
    log_type: logType,
    message,
    details: details ?? null,
    study_source_id: refs?.study_source_id ?? null,
    text_id: refs?.text_id ?? null,
  });
}

export async function runMedicalAiFetch(): Promise<MedicalAiFetchResult> {
  const admin = createServiceRoleClient();
  const runId = crypto.randomUUID();
  const errors: string[] = [];
  let created = 0;
  let skipped = 0;

  await logEvent(runId, "ingest_run", "V4d medical-ai-fetch started");

  const { data: sources } = await admin
    .from("study_sources")
    .select("id, name, region, slug, specialties")
    .eq("active", true);

  const sourceList = sources ?? [];

  const specialties = Object.keys(SPECIALTY_PUBMED_QUERIES) as V4dSpecialty[];

  for (const specialty of specialties) {
    if (created >= MAX_TEXTS_PER_RUN) break;

    const query = SPECIALTY_PUBMED_QUERIES[specialty];
    let items: Awaited<ReturnType<typeof fetchPubMedItems>> = [];

    try {
      items = await fetchPubMedItems(query, `V4d ${specialty}`, 3);
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      errors.push(`${specialty}: ${(e as Error).message}`);
      continue;
    }

    for (const item of items) {
      if (created >= MAX_TEXTS_PER_RUN) break;

      const desc = item.description ?? item.title;
      if (!isMedicalRelevant(desc)) {
        skipped++;
        continue;
      }
      if (!matchesSpecialty(desc, specialty)) {
        skipped++;
        continue;
      }

      const lang = detectLanguage(`${item.title} ${desc}`);
      if (!isAllowedLanguage(lang)) {
        skipped++;
        continue;
      }

      const qualityPreview = await evaluateQuality({
        title: item.title,
        description: desc,
        sourceUrl: item.link,
        doi: null,
        originalLanguage: lang,
      });

      if (!qualityPreview.passed && qualityPreview.duplicateScore >= 95) {
        skipped++;
        continue;
      }

      try {
        const categories = await categorizeMedicalText({
          title: item.title,
          raw: desc,
          specialty,
          originalLanguage: lang,
        });

        const processed = await processMedicalTextWithAi({
          title: item.title,
          description: desc,
          sourceUrl: item.link,
          sourceName: item.sourceName ?? "PubMed",
          originalLanguage: lang,
          specialty,
          categories,
        });

        const sourceId = matchSourceId(sourceList, item.title, desc);
        const slug = slugify(processed.title || item.title);

        const { data: inserted, error } = await admin
          .from("medical_ai_texts")
          .insert({
            study_source_id: sourceId,
            title: processed.title,
            slug,
            original_language: lang,
            content_cs: processed.content_cs,
            summary_clinician: processed.summary_clinician,
            summary_patient: processed.summary_patient,
            source_url: item.link,
            source_name: item.sourceName ?? "PubMed",
            pubmed_id: item.link?.match(/(\d+)\/?$/)?.[1] ?? null,
            specialty,
            categories,
            metadata: processed.metadata,
            ai_metadata: { run_id: runId, categories },
            published: true,
            quality_passed: false,
          })
          .select("id")
          .single();

        if (error) {
          if (error.code === "23505") {
            skipped++;
            continue;
          }
          errors.push(error.message);
          continue;
        }

        const finalQuality = await evaluateQuality({
          title: processed.title,
          description: processed.content_cs,
          sourceUrl: item.link,
          originalLanguage: lang,
        });
        await persistQuality(inserted.id, finalQuality);

        try {
          const doiFromText = extractFirstDoi(`${item.title} ${desc}`);
          if (doiFromText) {
            await admin
              .from("medical_ai_texts")
              .update({ doi: doiFromText })
              .eq("id", inserted.id);
          }
          await enrichMedicalArticleWithEvidence(inserted.id);
        } catch (enrichErr) {
          errors.push(`enrich: ${(enrichErr as Error).message}`);
        }

        await logEvent(
          runId,
          "article",
          `Created: ${processed.title}`,
          { specialty, lang },
          { study_source_id: sourceId ?? undefined, text_id: inserted.id }
        );

        created++;
      } catch (e) {
        errors.push((e as Error).message);
        await logEvent(runId, "error", (e as Error).message, { specialty });
      }
    }
  }

  await logEvent(runId, "ingest_run", "V4d medical-ai-fetch finished", {
    created,
    skipped,
    error_count: errors.length,
  });

  return { runId, created, skipped, errors };
}
