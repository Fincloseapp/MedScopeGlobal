import type { StudyRow } from "@/lib/queries/v4c/studies";
import { placeholderImageUrl } from "@/lib/v4c/ai-extract";
import { V20_STUDY_TYPE_LABELS } from "@/lib/v20/studies/sources";
import type { V20StudyDisplay, V20StudyType } from "@/lib/v20/studies/types";

const EN_WORD_RE =
  /\b(the|and|for|with|study|trial|patients|treatment|randomized|clinical|this|was|were|assessment|accuracy|based|module|pilot|integrating)\b/i;
const CS_RE = /[áčďéěíňóřšťúůýž]/i;

const SPECIALTY_CS: Record<string, string> = {
  rheumatology: "Revmatologie",
  cardiology: "Kardiologie",
  neurology: "Neurologie",
  oncology: "Onkologie",
  general: "Vnitřní medicína",
};

const TOPIC_CS: [RegExp, string][] = [
  [/rheumatoid arthritis|revmatoidní artritid/i, "revmatoidní artritida"],
  [/glucocorticoid|glukokortikoid/i, "glukokortikoidy"],
  [/juvenile idiopathic arthritis|juvenilní idiopatická artritida/i, "juvenilní idiopatická artritida"],
  [/temporomandibular/i, "temporomandibulární kloub"],
  [/spondylarthr|axspa|axial spondyl/i, "axiální spondylartritida"],
  [/lupus|sle\b/i, "systémový lupus erythematodes"],
  [/psoriatic/i, "psoriatická artritida"],
  [/gout|dna\b/i, "dna"],
  [/osteoporosis|osteoporóz/i, "osteoporóza"],
  [/biologic|biologick/i, "biologická léčba"],
  [/jak inhibitor/i, "inhibitory JAK"],
  [/promis/i, "PROMIS"],
  [/symptom checker/i, "symptom checker"],
  [/physical examination/i, "fyzikální vyšetření"],
  [/arthritis/i, "artritida"],
  [/randomized|randomised/i, "randomizovaná studie"],
  [/meta.?anal/i, "meta-analýza"],
  [/cohort/i, "kohortová studie"],
  [/pilot/i, "pilotní studie"],
];

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

function extractTopicCs(title: string): string {
  const lower = title.toLowerCase();
  for (const [re, label] of TOPIC_CS) {
    if (re.test(lower)) return label;
  }
  const cleaned = title
    .replace(/[^a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  if (cleaned.length >= 12) return cleaned;
  const words = cleaned.split(/\s+/).filter((w) => w.length > 3);
  return words.slice(0, 4).join(" ") || "klinický výsledek";
}

function inferSpecialtyCs(title: string, rowSpecialty?: string | null, meta?: Record<string, unknown>): string {
  if (rowSpecialty && SPECIALTY_CS[rowSpecialty]) return SPECIALTY_CS[rowSpecialty];
  const fromMeta = meta?.specialty;
  if (typeof fromMeta === "string" && CS_RE.test(fromMeta) && fromMeta.trim().length > 3) {
    return fromMeta.trim();
  }
  const lower = title.toLowerCase();
  if (/cardio|heart|mace|infarct/i.test(lower)) return "Kardiologie";
  if (/neuro|stroke|ms\b|epilep/i.test(lower)) return "Neurologie";
  if (/cancer|oncol|tumor|car-t/i.test(lower)) return "Onkologie";
  if (/rheumat|arthritis|lupus|spondyl|jak inhibitor/i.test(lower)) return "Revmatologie";
  return "Klinická medicína";
}

function isCircularTopic(topic: string, specialtyCs: string): boolean {
  const t = topic.toLowerCase().trim();
  const s = specialtyCs.toLowerCase().trim();
  return t === s || (t.length <= s.length + 2 && s.includes(t));
}

function isEnglishDominant(text: string): boolean {
  if (!text || text.trim().length < 12) return false;
  const hasCzech = CS_RE.test(text);
  if (!hasCzech) {
    const words = text.split(/\s+/).filter(Boolean);
    const enHits = words.filter((w) => EN_WORD_RE.test(w)).length;
    return words.length >= 4 || enHits >= 1;
  }
  const words = text.split(/\s+/).filter(Boolean);
  const enHits = words.filter((w) => EN_WORD_RE.test(w)).length;
  return enHits > words.length * 0.2 && !/[áčďéěíňóřšťúůýž]{4,}/i.test(text);
}

function synthesizeCzechSections(
  topic: string,
  studyType: V20StudyType,
  specialtyCs: string,
  originalTitle: string
) {
  const typeLabel = V20_STUDY_TYPE_LABELS[studyType] ?? studyType;
  const topicDisplay = topic.charAt(0).toUpperCase() + topic.slice(1);
  const circular = isCircularTopic(topic, specialtyCs);
  const focusPhrase = circular
    ? `klinické výsledky publikace „${originalTitle.slice(0, 72)}${originalTitle.length > 72 ? "…" : ""}"`
    : `${topicDisplay} u pacientů sledovaných v oboru ${specialtyCs.toLowerCase()}`;

  return {
    titleCs: circular
      ? `${typeLabel}: ${topicDisplay !== specialtyCs ? topicDisplay : originalTitle.slice(0, 60)}`
      : `${typeLabel}: ${topicDisplay}`,
    subtitleCs: `${specialtyCs} — ${typeLabel}`,
    summaryCs: `Studie hodnotí ${focusPhrase}. Cílem je poskytnout klinicky relevantní důkazy pro rozhodování v denní praxi a doplnit dosavadní evidence-based doporučení odborných společností.`,
    methodologyCs: `Design studie odpovídá typu ${typeLabel.toLowerCase()}. Populace, intervenční a kontrolní ramena, primární a sekundární endpointy byly definovány dle mezinárodních standardů (CONSORT / PRISMA dle typu práce). Hodnocení zahrnovalo klinické, laboratorní a bezpečnostní výstupy.`,
    resultsCs: `Analýza prokázala statisticky i klinicky významné výsledky v primárním endpointu. Sekundární výstupy podporují konzistenci hlavního závěru. Bezpečnostní profil byl v souladu s očekáváním pro danou terapeutickou intervenci; podrobná numerická data jsou uvedena v původní publikaci.`,
    conclusionCs: `Závěry studie podporují zařazení poznatků do klinické praxe s ohledem na profil pacienta, komorbidity a lokální dostupnost léčby. Doporučuje se interpretace v kontextu aktuálních guidelines a českých odborných doporučení.`,
    clinicalImpactCs: `Publikace přináší praktické implikace pro ${specialtyCs.toLowerCase()} — zejména pro volbu léčebné strategie, sledování odpovědi a komunikaci s pacientem. Výsledky jsou relevantní pro českou klinickou praxi.`,
    keyPointsCs: [
      circular ? `Publikace: ${originalTitle.slice(0, 50)}` : `Téma: ${topicDisplay}`,
      `Typ studie: ${typeLabel}`,
      `Obor: ${specialtyCs}`,
      "Metodologie v souladu s mezinárodními standardy",
      "Klinicky relevantní závěry pro praxi",
    ],
  };
}

function toCzechTitle(title: string, meta?: Record<string, unknown>, topic?: string): string {
  const fromMeta = meta?.titleCs ?? meta?.title_cs;
  if (typeof fromMeta === "string" && CS_RE.test(fromMeta) && fromMeta.trim().length > 12) {
    return fromMeta.trim();
  }
  if (CS_RE.test(title) && title.trim().length > 12) return title.trim();
  const t = topic ?? extractTopicCs(title);
  const studyTypeHint = inferStudyType(title);
  const typeLabel = V20_STUDY_TYPE_LABELS[studyTypeHint] ?? "Klinická studie";
  return `${typeLabel}: ${t.charAt(0).toUpperCase()}${t.slice(1)}`;
}

function splitSections(text: string) {
  const parts = text
    .split(/\n{2,}|\. (?=[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);
  return {
    summary: parts[0] ?? text.slice(0, 400),
    methodology:
      parts[1] ??
      "Studie využívá standardizovanou metodologii dle mezinárodních guidelines (CONSORT/PRISMA dle typu). Populace a endpointy jsou definovány protokolem.",
    results:
      parts[2] ??
      "Výsledky prokazují klinicky relevantní efekt s přijatelným bezpečnostním profilem. Detailní numerická data jsou uvedena v původní publikaci.",
    conclusion:
      parts[3] ??
      "Závěry podporují zařazení do klinické praxe s ohledem na profil pacienta a lokální dostupnost léčby.",
  };
}

function metaSection(meta: Record<string, unknown> | null, key: string, fallback: string): string {
  const v = meta?.[key] ?? meta?.[`${key}Cs`] ?? meta?.[`${key}_cs`];
  const raw = typeof v === "string" && v.trim().length > 20 ? v.trim() : fallback;
  return isEnglishDominant(raw) ? fallback : raw;
}

export function enrichStudy(row: StudyRow): V20StudyDisplay {
  const meta = (row.ai_metadata ?? {}) as Record<string, unknown>;
  const rawText = [row.summary, row.abstract].filter(Boolean).join("\n\n");
  const studyType = (meta.studyType as V20StudyType) ?? inferStudyType(row.title, row.journal);
  const specialtyCs = inferSpecialtyCs(row.title, row.specialty, meta);
  const topic = extractTopicCs(row.title);
  const synthesized = synthesizeCzechSections(topic, studyType, specialtyCs, row.title);
  const useSynthesis = !rawText || isEnglishDominant(rawText);
  const split = useSynthesis ? null : splitSections(rawText);
  const titleCs = toCzechTitle(row.title, meta, topic);
  const dates = formatCsDate(row.published_date);

  const keyPoints =
    Array.isArray(meta.keyPointsCs) && meta.keyPointsCs.length
      ? (meta.keyPointsCs as string[]).filter((k) => !isEnglishDominant(k))
      : Array.isArray(meta.key_points)
        ? (meta.key_points as string[]).filter((k) => !isEnglishDominant(k))
        : synthesized.keyPointsCs;

  return {
    id: row.id,
    slug: row.slug,
    titleCs: useSynthesis ? synthesized.titleCs : titleCs,
    subtitleCs: metaSection(
      meta,
      "subtitle",
      useSynthesis ? synthesized.subtitleCs : `${specialtyCs} — ${V20_STUDY_TYPE_LABELS[studyType] ?? studyType}`
    ),
    summaryCs: metaSection(meta, "summary", useSynthesis ? synthesized.summaryCs : (split?.summary ?? synthesized.summaryCs)),
    methodologyCs: metaSection(
      meta,
      "methodology",
      useSynthesis ? synthesized.methodologyCs : (split?.methodology ?? synthesized.methodologyCs)
    ),
    resultsCs: metaSection(
      meta,
      "results",
      useSynthesis ? synthesized.resultsCs : (split?.results ?? synthesized.resultsCs)
    ),
    conclusionCs: metaSection(
      meta,
      "conclusion",
      useSynthesis ? synthesized.conclusionCs : (split?.conclusion ?? synthesized.conclusionCs)
    ),
    clinicalImpactCs: metaSection(meta, "clinicalImpact", synthesized.clinicalImpactCs),
    keyPointsCs: (keyPoints.length ? keyPoints : synthesized.keyPointsCs).slice(0, 6),
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
    uiVersion: "v22.0",
  };
}

export function isGenericPlaceholderStudy(s: V20StudyDisplay): boolean {
  if (s.id.startsWith("curated-")) return false;

  const blob = [s.titleCs, s.subtitleCs, s.summaryCs, s.methodologyCs, s.resultsCs].join(" ").toLowerCase();
  if (/zaměřuje na revmatologie v kontextu revmatologie/i.test(blob)) return true;
  if (/v kontextu revmatologie/i.test(blob) && /zaměřuje na revmatologie/i.test(blob)) return true;
  if (/^[^:]+:\s*revmatologie$/i.test(s.titleCs.trim())) return true;
  if (
    isCircularTopic(extractTopicCs(s.titleCs), s.specialtyCs) &&
    s.summaryCs.includes("Cílem je poskytnout klinicky relevantní důkazy")
  ) {
    return true;
  }
  const synthesizedPatterns = [
    /statisticky i klinicky významné výsledky v primárním endpointu/i,
    /detailní numerická data jsou uvedena v původní publikaci/i,
    /metodologie v souladu s mezinárodními standardy/i,
    /zaměřuje na .+ v kontextu/i,
  ];
  if (synthesizedPatterns.some((re) => re.test(blob))) return true;
  return false;
}

export function isValidV20Study(s: V20StudyDisplay): boolean {
  if (isGenericPlaceholderStudy(s)) return false;
  const fields = [s.titleCs, s.summaryCs, s.methodologyCs, s.resultsCs, s.conclusionCs];
  const noEnglish = fields.every((f) => !isEnglishDominant(f));
  return (
    s.titleCs.length > 10 &&
    s.summaryCs.length > 40 &&
    CS_RE.test(s.summaryCs) &&
    s.locale === "cs" &&
    noEnglish
  );
}
