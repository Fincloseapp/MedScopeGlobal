import { createServiceRoleClient } from "@/lib/supabase/service";
import type { AiMedicalAssistant, AiMedicalSearchHit } from "@/lib/ai-medical/types";

function sanitizeSearchTerm(term: string) {
  return term.replace(/[%_,.()]/g, " ").trim().slice(0, 80);
}

function ilike(term: string) {
  const s = sanitizeSearchTerm(term);
  if (!s) return "%";
  return `%${s}%`;
}

export async function searchSupabaseForAssistant(
  assistant: AiMedicalAssistant,
  query: string,
  filters: {
    specialty?: string;
    diagnosis?: string;
    studyType?: string;
    drugName?: string;
    legislationCategory?: string;
  }
): Promise<AiMedicalSearchHit[]> {
  const admin = createServiceRoleClient();
  const q = ilike(query.slice(0, 120));
  const hits: AiMedicalSearchHit[] = [];

  async function pushStudies() {
    let sb = admin
      .from("studies")
      .select("id, title, summary, abstract, source_url, specialty, published_date")
      .eq("published", true)
      .or(`title.ilike.${q},summary.ilike.${q},abstract.ilike.${q}`)
      .limit(6);
    if (filters.specialty) sb = sb.eq("specialty", filters.specialty);
    const { data } = await sb;
    for (const row of data ?? []) {
      hits.push({
        source: "studies",
        id: row.id,
        title: row.title,
        snippet: (row.summary ?? row.abstract ?? "").slice(0, 400),
        url: row.source_url,
        meta: { specialty: row.specialty, date: row.published_date },
      });
    }
  }

  async function pushMedicalAiTexts() {
    let sb = admin
      .from("medical_ai_texts")
      .select(
        "id, title, summary_clinician, summary_patient, source_url, specialty, categories"
      )
      .eq("published", true)
      .or(
        `title.ilike.${q},summary_clinician.ilike.${q},summary_patient.ilike.${q},content_cs.ilike.${q}`
      )
      .limit(6);
    if (filters.specialty) sb = sb.eq("specialty", filters.specialty);
    const { data } = await sb;
    for (const row of data ?? []) {
      const cats = JSON.stringify(row.categories ?? {});
      if (filters.diagnosis && !cats.includes(filters.diagnosis)) continue;
      if (filters.studyType && !cats.includes(filters.studyType)) continue;
      hits.push({
        source: "medical_ai_texts",
        id: row.id,
        title: row.title,
        snippet: (row.summary_clinician ?? row.summary_patient ?? "").slice(0, 400),
        url: row.source_url,
        meta: { specialty: row.specialty, categories: row.categories },
      });
    }
  }

  async function pushDrugNews() {
    let sb = admin
      .from("drug_news")
      .select("id, title, summary, slug, drug_name, agency")
      .eq("published", true)
      .or(`title.ilike.${q},summary.ilike.${q},drug_name.ilike.${q}`)
      .limit(6);
    if (filters.drugName) sb = sb.ilike("drug_name", ilike(filters.drugName));
    const { data } = await sb;
    for (const row of data ?? []) {
      hits.push({
        source: "drug_news",
        id: row.id,
        title: row.title,
        snippet: (row.summary ?? "").slice(0, 400),
        meta: { drug_name: row.drug_name, agency: row.agency },
      });
    }
  }

  async function pushLegislation() {
    let sb = admin
      .from("legislation_items")
      .select("id, title, summary, slug, category, source")
      .eq("published", true)
      .or(`title.ilike.${q},summary.ilike.${q}`)
      .limit(6);
    if (filters.legislationCategory)
      sb = sb.eq("category", filters.legislationCategory);
    const { data } = await sb;
    for (const row of data ?? []) {
      hits.push({
        source: "legislation_items",
        id: row.id,
        title: row.title,
        snippet: (row.summary ?? "").slice(0, 400),
        meta: { category: row.category, source: row.source },
      });
    }
  }

  async function pushUniversityNews() {
    const { data } = await admin
      .from("university_news")
      .select("id, title, summary, university, tag, slug")
      .eq("published", true)
      .or(`title.ilike.${q},summary.ilike.${q},university.ilike.${q}`)
      .limit(8);
    for (const row of data ?? []) {
      hits.push({
        source: "university_news",
        id: row.id,
        title: row.title,
        snippet: (row.summary ?? "").slice(0, 400),
        meta: { university: row.university, tag: row.tag },
      });
    }
  }

  async function pushStudySources() {
    const { data } = await admin
      .from("study_sources")
      .select("id, name, url, region, specialties")
      .eq("active", true)
      .or(`name.ilike.${q},slug.ilike.${q}`)
      .limit(8);
    for (const row of data ?? []) {
      hits.push({
        source: "study_sources",
        id: row.id,
        title: row.name,
        snippet: `${row.region} · ${(row.specialties ?? []).join(", ")}`,
        url: row.url,
        meta: { region: row.region },
      });
    }
  }

  async function pushArticles() {
    const { data } = await admin
      .from("articles")
      .select("id, title, excerpt, slug, category_id")
      .eq("published", true)
      .or(`title.ilike.${q},excerpt.ilike.${q}`)
      .limit(4);
    for (const row of data ?? []) {
      hits.push({
        source: "articles",
        id: row.id,
        title: row.title,
        snippet: (row.excerpt ?? "").slice(0, 400),
        meta: { slug: row.slug },
      });
    }
  }

  switch (assistant) {
    case "doctor":
    case "patient":
      await Promise.all([pushStudies(), pushMedicalAiTexts(), pushArticles()]);
      break;
    case "research":
    case "studie":
      await Promise.all([pushStudies(), pushMedicalAiTexts()]);
      break;
    case "leky":
      await pushDrugNews();
      await pushStudies();
      break;
    case "legislativa":
      await pushLegislation();
      break;
    case "univerzity":
      await Promise.all([pushUniversityNews(), pushStudySources()]);
      break;
    default:
      await pushStudies();
  }

  return hits.slice(0, 12);
}
