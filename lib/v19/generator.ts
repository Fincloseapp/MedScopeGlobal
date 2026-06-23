import { groqChatCompletion } from "@/lib/ai/groq";
import { pickTopic, type V19SourceTopic } from "@/lib/v19/sources";
import { specialtyLabel } from "@/lib/v19/specialties";
import { languageNameForPrompt } from "@/lib/v19/localize";
import { applyV19Safety, validateV19Article } from "@/lib/v19/safety";
import { withV19GroqSlot } from "@/lib/v19/concurrency";
import type {
  V19ArticlePayload,
  V19ArticleType,
  V19ContentMode,
  V19GeneratedArticle,
  V19ModeLayers,
  V19Relevance,
  V19Specialty,
} from "@/lib/v19/types";
import { buildV19DedupHash } from "@/lib/v19/dedup";
import { formatV19ContentHtml } from "@/lib/v19/format-content";
import {
  formatSourceAttribution,
  isSciencePublicationSource,
  NZIP_LICENSE_NOTICE,
  SCIENCE_PUBLICATION_NOTICE,
} from "@/lib/v19/legal";
import { isNzipTopic } from "@/lib/v19/nzip";
import { findNzipIndexEntry } from "@/lib/v19/nzip-index";
import { buildV19SeoMeta } from "@/lib/v19/seo";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";

type RawModeLayer = {
  summary?: string;
  keyPoints?: string[];
  clinicalImpact?: string;
  scientificContext?: string;
  patientEducation?: string;
};

type RawLlmArticle = {
  title?: string;
  summary?: string;
  keyPoints?: string[];
  clinicalImpact?: string;
  scientificContext?: string;
  patientEducation?: string;
  nzipContext?: string;
  nzipTopicTags?: string[];
  nzipCategoryTags?: string[];
  keywords?: string[];
  articleType?: string;
  relevance?: string;
  angle?: string;
  modes?: {
    doctor?: RawModeLayer;
    patient?: RawModeLayer;
    scientist?: RawModeLayer;
  };
};

function parseArticleType(raw?: string): V19ArticleType {
  const allowed: V19ArticleType[] = [
    "brief",
    "education",
    "science-note",
    "prevention",
    "clinical-context",
  ];
  if (raw && allowed.includes(raw as V19ArticleType)) return raw as V19ArticleType;
  return "brief";
}

function parseRelevance(raw?: string): V19Relevance {
  if (raw === "high" || raw === "medium" || raw === "contextual") return raw;
  return "high";
}

function buildModeLayers(raw: RawLlmArticle, base: V19ArticlePayload): V19ModeLayers {
  const m = raw.modes ?? {};
  const doctor = m.doctor ?? {};
  const patient = m.patient ?? {};
  const scientist = m.scientist ?? {};

  return {
    doctor: {
      summary: doctor.summary ?? base.summary,
      keyPoints: doctor.keyPoints?.length ? doctor.keyPoints : base.keyPoints,
      clinicalImpact: doctor.clinicalImpact ?? base.clinicalImpact,
      scientificContext: doctor.scientificContext ?? base.scientificContext,
    },
    patient: {
      summary: patient.summary ?? (base.patientEducation.slice(0, 300) || base.summary),
      keyPoints: patient.keyPoints?.length
        ? patient.keyPoints
        : base.keyPoints.map((p) => p.replace(/\b\w{12,}\b/g, (w) => w)),
      patientEducation: patient.patientEducation ?? base.patientEducation,
      clinicalImpact: patient.clinicalImpact ?? base.clinicalImpact,
    },
    scientist: {
      summary: scientist.summary ?? (base.scientificContext.slice(0, 300) || base.summary),
      keyPoints: scientist.keyPoints?.length ? scientist.keyPoints : base.keyPoints,
      scientificContext: scientist.scientificContext ?? base.scientificContext,
      clinicalImpact: scientist.clinicalImpact ?? base.clinicalImpact,
    },
  };
}

export async function generateV19Article(params: {
  specialty: V19Specialty;
  locale: string;
  topic: V19SourceTopic;
  existingTitles: string[];
  angleHint?: string;
  mode?: V19ContentMode;
}): Promise<{ article: V19GeneratedArticle | null; model?: string; skipped?: boolean }> {
  const { specialty, locale, topic, existingTitles, angleHint, mode = "doctor" } = params;
  const lang = languageNameForPrompt(locale);
  const date = new Date().toISOString();
  const specLabel = specialtyLabel(specialty, locale);
  const sourceAttribution = formatSourceAttribution(topic.sourceName, topic.sourceUrl);
  const isNzip = isNzipTopic(topic);
  const isScience = topic.tier === "science" || isSciencePublicationSource(topic.sourceName);

  const nzipEntry = isNzip ? findNzipIndexEntry(topic.id) : undefined;

  const system = `Jsi odborný medicínský editor MedScope v19.8.
Piš v jazyce: ${lang}.
Vytvoř VLASTNÍ shrnutí — nikdy nekopíruj texty ze zdrojů (GDPR, autorský zákon).
${isNzip ? NZIP_LICENSE_NOTICE : ""}
${isScience ? SCIENCE_PUBLICATION_NOTICE : ""}
Bez dávkování léků, bez konkrétních léčebných postupů, bez klinických instrukcí.
Žádná osobní data. Pouze odborné shrnutí a kontext.
Vrať pouze validní JSON objekt.`;

  const user = `Obor: ${specLabel}
Zdroj (pouze kontext, nepřebírej text): ${topic.sourceName} — ${topic.sourceUrl}
Atribuce ve výstupu: ${sourceAttribution}
Téma: ${topic.topic}
${topic.nzipCategory ? `NZIP kategorie: ${topic.nzipCategory}` : ""}
Kontext: ${topic.briefingHint}
${topic.keywords?.length ? `Klíčová slova: ${topic.keywords.join(", ")}` : ""}
${angleHint ? `Nový úhel: ${angleHint}` : ""}
${existingTitles.length ? `Vyhni se podobnosti těmto titulům: ${existingTitles.slice(0, 8).join(" | ")}` : ""}

Vrať JSON:
{
  "title": "max 60 znaků",
  "summary": "2-3 věty odborné shrnutí",
  "keyPoints": ["3-6 bodů"],
  "clinicalImpact": "1-2 věty dopadu na praxi",
  "scientificContext": "1-2 věty vědeckého kontextu",
  "patientEducation": "2-3 věty srozumitelné pro laiky",
  "nzipContext": "1-2 věty NZIP kontextu (pouze pokud zdroj NZIP, jinak prázdný řetězec)",
  "nzipTopicTags": ["tagy tématu NZIP"],
  "nzipCategoryTags": ["tagy kategorie NZIP"],
  "keywords": ["3-6 klíčových slov"],
  "articleType": "brief|education|science-note|prevention|clinical-context",
  "relevance": "high|medium|contextual",
  "angle": "stručný popis úhlu",
  "modes": {
    "doctor": { "summary": "...", "keyPoints": ["..."], "clinicalImpact": "..." },
    "patient": { "summary": "...", "keyPoints": ["..."], "patientEducation": "..." },
    "scientist": { "summary": "...", "keyPoints": ["..."], "scientificContext": "..." }
  }
}`;

  const result = await withV19GroqSlot(() =>
    groqChatCompletion({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.35,
      maxTokens: 2000,
      jsonMode: true,
    })
  );

  if (!result?.content) return { article: null };

  let raw: RawLlmArticle;
  try {
    raw = JSON.parse(result.content) as RawLlmArticle;
  } catch {
    return { article: null, model: result.model };
  }

  const keywords = [
    ...(raw.keywords ?? []),
    ...(topic.keywords ?? []),
    topic.topic,
    specLabel,
  ]
    .filter(Boolean)
    .slice(0, 8);

  const basePayload: V19ArticlePayload = {
    title: (raw.title ?? topic.topic).slice(0, 60),
    date,
    specialty,
    specialtyLabel: specLabel,
    summary: raw.summary ?? "",
    keyPoints: (raw.keyPoints ?? []).slice(0, 6),
    clinicalImpact: raw.clinicalImpact ?? "",
    scientificContext: raw.scientificContext ?? "",
    patientEducation: raw.patientEducation ?? "",
    nzipContext: isNzip ? (raw.nzipContext ?? "") : undefined,
    nzipCategory: topic.nzipCategory,
    nzipRegistryId: isNzip ? topic.id : undefined,
    nzipTopicTags: isNzip
      ? (raw.nzipTopicTags?.length ? raw.nzipTopicTags : nzipEntry?.topicTags)
      : undefined,
    nzipCategoryTags: isNzip
      ? (raw.nzipCategoryTags?.length ? raw.nzipCategoryTags : nzipEntry?.categoryTags)
      : undefined,
    sourceUrl: topic.sourceUrl,
    sourceName: sourceAttribution,
    sourceTier: topic.tier,
    topic: topic.topic,
    locale,
    angle: raw.angle ?? angleHint,
    keywords,
    articleType: parseArticleType(raw.articleType),
    relevance: parseRelevance(raw.relevance),
    engineVersion: V19_ENGINE_VERSION,
  };

  basePayload.modeLayers = buildModeLayers(raw, basePayload);

  const payload: V19ArticlePayload = applyV19Safety(basePayload);

  const validation = validateV19Article(payload);
  if (!validation.safe || payload.keyPoints.length < 3) {
    return { article: null, model: result.model };
  }

  const hashDedup = buildV19DedupHash(
    payload.title,
    payload.topic,
    payload.sourceUrl,
    payload.date,
    payload.keywords,
    topic.publicationRef
  );

  const seo = buildV19SeoMeta(payload, locale);

  const article: V19GeneratedArticle = {
    ...payload,
    hashDedup,
    contentHtml: formatV19ContentHtml(payload, locale, mode),
    model: result.model,
    seo: {
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl,
    },
  };

  return { article, model: result.model };
}

export function pickTopicForSpecialty(
  specialty: V19Specialty,
  used: Set<string>
): V19SourceTopic | null {
  return pickTopic(specialty, used);
}
