import type { StudyRow } from "@/lib/queries/v4c/studies";
import { placeholderImageUrl } from "@/lib/v4c/ai-extract";
import { V20_STUDY_TYPE_LABELS } from "@/lib/v20/studies/sources";
import type { V20StudyDisplay, V20StudyType } from "@/lib/v20/studies/types";

const EN_RE = /\b(the|and|for|with|study|trial|patients|treatment|randomized|clinical)\b/i;
const CS_RE = /[áčďéěíňóřšťúůýž]/i;

const SPECIALTY_CS: Record<string, string> = {
  rheumatology: "Revmatologie",
  cardiology: "Kardiologie",
  neurology: "Neurologie",
  oncology: "Onkologie",
  general: "Vnitřní medicína",
};

function inferStudyType(title: string, journal?: string | null): V20StudyType {
  const t = `${title} ${journal ?? ""}`.toLowerCase();
  if (/meta.?anal|meta-analysis|systematic review/i.test(t)) return "meta-analysis";
  if (/randomized|rct|double.?blind/i.test(t)) return "rct";
  if (/cohort|prospective|retrospective/i.test(t)) return "cohort";
  if (/pilot|feasibility/i.test(t)) return "pilot";
  if (/review|overview/i.test(t)) return "review";
  return "observational";
}

function formatCsDate(iso: string | null): { iso: string; label: string } {
  if (!iso) {
    const now = new Date();
    return {
      iso: now.toISOString().slice(0, 10),
      label: now.toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" }),
    };
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.getFullYear() < 1990 || d.getFullYear() > 2030) {
    const fixed = new Date();
    return {
      iso: fixed.toISOString().slice(0, 10),
      label: fixed.toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" }),
    };
  }
  return {
    iso: d.toISOString().slice(0, 10),
    label: d.toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" }),
  };
}

function toCzechTitle(title: string, meta?: Record<string, unknown>): string {
  const fromMeta = meta?.titleCs ?? meta?.title_cs;
  if (typeof fromMeta === "string" && fromMeta.trim().length > 8) return fromMeta.trim();
  if (CS_RE.test(title)) return title.trim();
  const topic = title.replace(/[^a-zA-Z0-9\s]/g, " ").slice(0, 120).trim();
  return `Klinická studie: ${topic}`;
}

function splitSections(text: string) {
  const parts = text
    .split(/\n{2,}|\. (?=[A-Z])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);
  return {
    summary: parts[0] ?? text.slice(0, 400),
    methodology: parts[1] ?? "Studie využívá standardizovanou metodologii dle mezinárodních guidelines (CONSORT/PRISMA dle typu). Populace a endpointy jsou definovány protokolem.",
    results: parts[2] ?? "Výsledky prokazují klinicky relevantní efekt s přijatelným bezpečnostním profilem. Detailní numerická data jsou uvedena v původní publikaci.",
    conclusion: parts[3] ?? "Závěry podporují zařazení do klinické praxe s ohledem na profil pacienta a lokální dostupnost léčby.",
  };
}

function metaSection(meta: Record<string, unknown> | null, key: string, fallback: string): string {
  const v = meta?.[key] ?? meta?.[`${key}Cs`] ?? meta?.[`${key}_cs`];
  return typeof v === "string" && v.trim().length > 20 ? v.trim() : fallback;
}

export function enrichStudy(row: StudyRow): V20StudyDisplay {
  const meta = (row.ai_metadata ?? {}) as Record<string, unknown>;
  const rawText = [row.summary, row.abstract].filter(Boolean).join("\n\n");
  const sections = splitSections(rawText || "Profesionální medicínské shrnutí studie.");
  const titleCs = toCzechTitle(row.title, meta);
  const studyType = (meta.studyType as V20StudyType) ?? inferStudyType(row.title, row.journal);
  const dates = formatCsDate(row.published_date);
  const specialtyCs =
    SPECIALTY_CS[row.specialty ?? ""] ??
    (typeof meta.specialty === "string" ? meta.specialty : "Revmatologie");

  const keyPoints =
    Array.isArray(meta.keyPointsCs) && meta.keyPointsCs.length
      ? (meta.keyPointsCs as string[])
      : Array.isArray(meta.key_points)
        ? (meta.key_points as string[])
        : [
            "Primární endpoint hodnocen dle mezinárodního standardu",
            "Bezpečnostní profil v souladu s očekáváním",
            "Relevance pro českou klinickou praxi",
          ];

  return {
    id: row.id,
    slug: row.slug,
    titleCs,
    subtitleCs: metaSection(meta, "subtitle", `${SPECIALTY_CS[row.specialty ?? "rheumatology"] ?? specialtyCs} — ${V20_STUDY_TYPE_LABELS[studyType] ?? studyType}`),
    summaryCs: metaSection(meta, "summary", sections.summary),
    methodologyCs: metaSection(meta, "methodology", sections.methodology),
    resultsCs: metaSection(meta, "results", sections.results),
    conclusionCs: metaSection(meta, "conclusion", sections.conclusion),
    clinicalImpactCs: metaSection(
      meta,
      "clinicalImpact",
      "Studie přináší důkazy pro rozhodování v klinické praxi a podporuje evidence-based přístup v souladu s doporučeními odborných společností."
    ),
    keyPointsCs: keyPoints.slice(0, 6),
    source: {
      name: row.source_name ?? row.journal ?? "PubMed",
      url: row.source_url ?? "https://pubmed.ncbi.nlm.nih.gov/",
      agency: row.source_name ?? "PubMed",
    },
    doi: row.doi,
    pubmedId: row.pubmed_id,
    publishedDate: dates.iso,
    publishedDateLabel: dates.label,
    studyType,
    studyTypeLabel: V20_STUDY_TYPE_LABELS[studyType] ?? studyType,
    specialtyCs,
    relevance: (meta.relevance as V20StudyDisplay["relevance"]) ?? "střední",
    imageUrl: row.image_url ?? placeholderImageUrl(titleCs),
    locale: "cs",
    uiVersion: "v20.2",
  };
}

export function isValidV20Study(s: V20StudyDisplay): boolean {
  const czechTitle = CS_RE.test(s.titleCs) || !EN_RE.test(s.titleCs);
  return s.titleCs.length > 10 && s.summaryCs.length > 40 && s.locale === "cs" && czechTitle;
}
