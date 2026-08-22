#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { loadProjectEnv } from "./load-env.mjs";
import {
  auditArticle,
  summarizeArticleAudits,
  type AuditableArticle,
} from "../lib/editorial/article-quality-audit";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BATCH_ID = "thin-evidence-2026-08-17-v2";
const HEART_SLUG =
  "beyond-the-pump-integrating-the-hearts-endocrine-function-into-early-medical-education";
const PUBLIC_WRITER_BATCH_ID = "public-writer-bypass-2026-08-17-v1";
const PAGE_SIZE = 500;
const DEFAULT_TARGET = 20;
let groqDisabledByQuota = false;
const ARTICLE_COLUMNS = [
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "metadata",
  "published",
  "published_at",
  "created_at",
  "updated_at",
  "source_url",
  "source_name",
  "audience",
  "min_access_level",
  "locale",
  "rubric_slug",
  "content_type",
  "ai_generated",
].join(",");

type SourceRecord = {
  pmid: string;
  title: string;
  abstract: string;
  journal: string;
  authors: string;
  year: number | null;
  doi: string | null;
  publicationTypes: string[];
  url: string;
};

type GeneratedBriefing = {
  czechTitle: string;
  czechExcerpt: string;
  studyQuestion: string[];
  design: string[];
  population: string[];
  interventionOrExposure: string[];
  outcomes: string[];
  sourceFindings: string[];
  editorialInterpretation: string[];
  clinicalRelevance: string[];
  limitations: string[];
  cannotConclude: string[];
};

type PreparedCandidate = {
  id: string;
  slug: string;
  beforeWordCount: number;
  afterWordCount: number;
  beforeContentHash: string;
  afterContentHash: string;
  title: string;
  excerpt: string;
  content: string;
  source: Omit<SourceRecord, "abstract"> & {
    abstractHash: string;
    abstractCharacters: number;
  };
  metadata: Record<string, unknown>;
  visibilityScore: number;
  surfaces: string[];
  validation: {
    unsupportedNumericTokens: string[];
    removedUnsupportedNumericSentences: number;
    unknownFieldCount: number;
    requiredHeadings: boolean;
    czechDominant: boolean;
  };
};

function parseArgs() {
  const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
  const candidateLimitArg = process.argv.find((arg) =>
    arg.startsWith("--candidate-limit=")
  );
  const offsetArg = process.argv.find((arg) => arg.startsWith("--offset="));
  const groqModelArg = process.argv.find((arg) =>
    arg.startsWith("--groq-model=")
  );
  const reportArg = process.argv.find((arg) => arg.startsWith("--report-dir="));
  return {
    apply: process.argv.includes("--apply"),
    verifyApplied: process.argv.includes("--verify-applied"),
    mergeParts: process.argv.includes("--merge-parts"),
    groundingReview: process.argv.includes("--grounding-review"),
    preferGemini: process.argv.includes("--prefer-gemini"),
    target: Math.min(
      25,
      Math.max(15, Number(targetArg?.split("=")[1] ?? DEFAULT_TARGET))
    ),
    candidateLimit: candidateLimitArg
      ? Math.max(1, Number(candidateLimitArg.split("=")[1]))
      : null,
    offset: Math.max(0, Number(offsetArg?.split("=")[1] ?? 0)),
    groqModel: groqModelArg?.split("=")[1] || null,
    reportDir: reportArg
      ? path.resolve(ROOT, reportArg.slice("--report-dir=".length))
      : path.join(ROOT, "reports"),
  };
}

function isGroqQuotaError(status: number, body: string) {
  return (
    status === 429 &&
    /tokens per day|tpd|daily token/i.test(body)
  );
}

function isPublicWriterQuarantined(article: AuditableArticle) {
  const quarantine = (article.metadata as Record<string, unknown> | undefined)
    ?.editorial_quarantine as Record<string, unknown> | undefined;
  return (
    quarantine?.batch_id === PUBLIC_WRITER_BATCH_ID ||
    quarantine?.route === "v25-public-writers"
  );
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function plainText(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(value: string) {
  return plainText(value).split(/\s+/).filter(Boolean).length;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/\s+/g, " ")
    .trim();
}

function firstTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function allTags(xml: string, tag: string): string[] {
  return [...xml.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "gi"))]
    .map((match) => decodeXml(match[1]))
    .filter(Boolean);
}

function parsePubMedXml(xml: string): Map<string, SourceRecord> {
  const records = new Map<string, SourceRecord>();
  for (const match of xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/gi)) {
    const articleXml = match[1];
    const citationXml = articleXml.match(/<MedlineCitation[\s\S]*?<\/MedlineCitation>/i)?.[0] ?? articleXml;
    const pmid = firstTag(citationXml, "PMID");
    if (!pmid) continue;
    const title = firstTag(citationXml, "ArticleTitle");
    const journal =
      firstTag(citationXml, "Title") ||
      firstTag(citationXml, "ISOAbbreviation");
    const abstractParts = [
      ...citationXml.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/gi),
    ].map((item) => {
      const label = item[1].match(/Label="([^"]+)"/i)?.[1];
      const text = decodeXml(item[2]);
      return label ? `${label}: ${text}` : text;
    });
    const authorBlocks = [
      ...citationXml.matchAll(/<Author(?:\s[^>]*)?>([\s\S]*?)<\/Author>/gi),
    ];
    const authorNames = authorBlocks
      .map((author) => {
        const last = firstTag(author[1], "LastName");
        const initials = firstTag(author[1], "Initials");
        const collective = firstTag(author[1], "CollectiveName");
        return collective || [last, initials].filter(Boolean).join(" ");
      })
      .filter(Boolean);
    const yearText =
      firstTag(citationXml, "Year") ||
      firstTag(citationXml, "MedlineDate").match(/\b(19|20)\d{2}\b/)?.[0] ||
      "";
    const doi =
      [...articleXml.matchAll(/<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/gi)]
        .map((item) => decodeXml(item[1]))
        .find((value) => /^10\.\d{4,9}\//i.test(value)) ?? null;
    records.set(pmid, {
      pmid,
      title,
      abstract: abstractParts.join("\n"),
      journal,
      authors:
        authorNames.length > 10
          ? `${authorNames.slice(0, 10).join(", ")} et al.`
          : authorNames.join(", "),
      year: yearText ? Number(yearText.slice(0, 4)) : null,
      doi,
      publicationTypes: allTags(citationXml, "PublicationType"),
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    });
  }
  return records;
}

async function fetchPubMedRecords(pmids: string[]) {
  const output = new Map<string, SourceRecord>();
  for (let index = 0; index < pmids.length; index += 50) {
    const endpoint = new URL(
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    );
    endpoint.searchParams.set("db", "pubmed");
    endpoint.searchParams.set("retmode", "xml");
    endpoint.searchParams.set("rettype", "abstract");
    endpoint.searchParams.set("id", pmids.slice(index, index + 50).join(","));
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "MedScopeGlobal-editorial-remediation/1.0",
        Accept: "application/xml",
      },
    });
    if (!response.ok) throw new Error(`PubMed EFetch failed: ${response.status}`);
    for (const [pmid, record] of parsePubMedXml(await response.text())) {
      output.set(pmid, record);
    }
  }
  return output;
}

async function fetchAllPublished(admin: any): Promise<AuditableArticle[]> {
  const rows: AuditableArticle[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as AuditableArticle[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function extractPmid(article: AuditableArticle) {
  const citation =
    article.metadata?.source_citation &&
    typeof article.metadata.source_citation === "object"
      ? (article.metadata.source_citation as Record<string, unknown>)
      : {};
  return `${article.source_url ?? ""}\n${citation.url ?? ""}\n${citation.pmid ?? ""}`
    .match(/(?:pubmed\.ncbi\.nlm\.nih\.gov\/)?\b(\d{7,9})\b/)?.[1] ?? null;
}

function visibility(
  article: AuditableArticle,
  globalRank: Map<string, number>,
  rubricRank: Map<string, number>
) {
  const overall = globalRank.get(article.id) ?? 99999;
  const rubric = rubricRank.get(`${article.rubric_slug ?? "none"}:${article.id}`) ?? 99999;
  const surfaces: string[] = [];
  let score = 1000;
  if (overall < 4) {
    score += 1000 - overall;
    surfaces.push("recommendations");
  }
  if (overall < 16) {
    score += 700 - overall;
    surfaces.push("homepage_recent_pool");
  }
  if (rubric < 96) {
    score += 500 - rubric;
    surfaces.push("medical_section_recent_pool");
  }
  score += Math.max(0, 200 - overall);
  return { score, surfaces };
}

function buildRanks(articles: AuditableArticle[]) {
  const globalRank = new Map(articles.map((article, index) => [article.id, index]));
  const rubricRank = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const article of articles) {
    const rubric = String(article.rubric_slug ?? "none");
    const rank = counts.get(rubric) ?? 0;
    rubricRank.set(`${rubric}:${article.id}`, rank);
    counts.set(rubric, rank + 1);
  }
  return { globalRank, rubricRank };
}

function parseModelJson(value: string): GeneratedBriefing | null {
  try {
    const clean = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return JSON.parse(clean) as GeneratedBriefing;
  } catch {
    return null;
  }
}

async function generateBriefing(
  source: SourceRecord,
  geminiKey: string,
  geminiModel: string,
  groqKey: string | undefined,
  groqModel: string,
  preferGemini = false
): Promise<{ briefing: GeneratedBriefing; model: string } | null> {
  const system = `Jsi český medicínský redaktor. Pracuješ výhradně s níže vloženým PubMed záznamem a abstraktem.
Nevyužívej vlastní znalosti. Nevymýšlej čísla, endpointy, design, populaci, intervenci, doporučení ani závěry.
Chybějící údaj výslovně označ "Abstrakt tento údaj neuvádí."
Piš původní českou syntézu, nekopíruj ani těsně nepřekládej věty abstraktu.
Jasně odděl zjištění zdroje od interpretace MedScopeGlobal. Neimplikuj podporu časopisu.
Vrať pouze JSON. Každé pole typu pole obsahuje úplné české odstavce bez HTML.
studyQuestion, design, population, interventionOrExposure a outcomes: každý přesně 2 odstavce o 35–60 slovech.
sourceFindings: přesně 3 odstavce, každý 45–70 slov.
editorialInterpretation a clinicalRelevance: každý přesně 2 odstavce o 40–65 slovech.
limitations a cannotConclude: každý přesně 2 odstavce o 35–60 slovech.
Nevyplňuj délku novými fakty; při nedostatku podkladu vysvětli hranici abstraktu.
Celkový rozsah textových polí musí být 700–900 slov.
Schéma:
{"czechTitle":"", "czechExcerpt":"", "studyQuestion":[], "design":[], "population":[], "interventionOrExposure":[], "outcomes":[], "sourceFindings":[], "editorialInterpretation":[], "clinicalRelevance":[], "limitations":[], "cannotConclude":[]}`;
  const user = `PMID: ${source.pmid}
Původní název: ${source.title}
Časopis: ${source.journal}
Autoři: ${source.authors}
Rok: ${source.year ?? "neuveden"}
Typ publikace: ${source.publicationTypes.join("; ") || "neuveden"}
DOI: ${source.doi ?? "neuvedeno"}
ABSTRAKT:
${source.abstract}`;
  if (!preferGemini && !groqDisabledByQuota && groqKey?.startsWith("gsk_")) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.05,
          max_tokens: 2500,
          response_format: { type: "json_object" },
          ...(groqModel.startsWith("openai/")
            ? { reasoning_effort: "low" }
            : {}),
        }),
        signal: AbortSignal.timeout(120000),
      });
      if (response.ok) {
        const payload = await response.json();
        const parsed = parseModelJson(payload?.choices?.[0]?.message?.content ?? "");
        if (parsed) return { briefing: parsed, model: groqModel };
        console.error(
          `Groq JSON parse failed for PMID ${source.pmid}: ${String(
            payload?.choices?.[0]?.message?.content ?? ""
          ).slice(0, 180)}`
        );
      } else {
        const body = (await response.text()).slice(0, 400);
        console.error(`Groq HTTP ${response.status} for PMID ${source.pmid}: ${body}`);
        if (isGroqQuotaError(response.status, body)) {
          groqDisabledByQuota = true;
          console.error("Groq daily quota exhausted; switching remaining generation to Gemini");
          break;
        }
      }
      if (response.status !== 429 || groqDisabledByQuota) break;
      await new Promise((resolve) => setTimeout(resolve, 30000 * (attempt + 1)));
    }
  }
  if (!geminiKey) return null;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `SYSTEM:\n${system}\n\nUSER:\n${user}` }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 5000,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(120000),
    });
    if (response.ok) {
      const payload = await response.json();
      const parsed = parseModelJson(
        payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
      );
      if (parsed) return { briefing: parsed, model: geminiModel };
      console.error(`Gemini JSON parse failed for PMID ${source.pmid}`);
    } else {
      console.error(`Gemini HTTP ${response.status} for PMID ${source.pmid}`);
    }
    if (![429, 503].includes(response.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 4000 * (attempt + 1)));
  }
  return null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function normalizedGenerated(value: GeneratedBriefing): GeneratedBriefing {
  return {
    czechTitle: String(value.czechTitle ?? "").trim(),
    czechExcerpt: String(value.czechExcerpt ?? "").trim(),
    studyQuestion: stringArray(value.studyQuestion),
    design: stringArray(value.design),
    population: stringArray(value.population),
    interventionOrExposure: stringArray(value.interventionOrExposure),
    outcomes: stringArray(value.outcomes),
    sourceFindings: stringArray(value.sourceFindings),
    editorialInterpretation: stringArray(value.editorialInterpretation),
    clinicalRelevance: stringArray(value.clinicalRelevance),
    limitations: stringArray(value.limitations),
    cannotConclude: stringArray(value.cannotConclude),
  };
}

function numericTokens(value: string) {
  return [...value.matchAll(/\b\d+(?:[.,]\d+)?%?/g)].map((item) =>
    item[0].replace(",", ".")
  );
}

function isCzechDominant(value: string) {
  const czech =
    value.match(/\b(a|ale|bez|byla|byly|co|do|je|jsou|která|které|léčba|na|nebo|pacient|podle|pro|při|se|studie|u|ve|v|z|ze)\b/gi)?.length ?? 0;
  const english =
    value.match(/\b(the|and|with|for|from|study|patients|treatment|results|clinical|outcomes)\b/gi)?.length ?? 0;
  return czech >= 20 && czech > english * 2;
}

function unknownFieldCount(value: GeneratedBriefing) {
  return [
    value.design,
    value.population,
    value.interventionOrExposure,
    value.outcomes,
    value.sourceFindings,
  ].filter((parts) =>
    parts.join(" ").toLowerCase().includes("abstrakt tento údaj neuvádí")
  ).length;
}

function renderSection(heading: string, paragraphs: string[]) {
  return `<h2>${heading}</h2>\n${paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("\n")}`;
}

function renderBriefing(value: GeneratedBriefing, source: SourceRecord) {
  const citation = [
    source.authors,
    source.title,
    source.journal,
    source.year ? String(source.year) : null,
    `PMID ${source.pmid}`,
    source.doi ? `DOI ${source.doi}` : null,
  ]
    .filter(Boolean)
    .join(". ");
  return [
    `<p><strong>Redakční briefing MedScopeGlobal:</strong> Následující text je původní česká syntéza abstraktu evidovaného v PubMed. Zjištění primárního zdroje jsou oddělena od redakční interpretace; citovaný časopis není partnerem ani schvalovatelem MedScopeGlobal.</p>`,
    renderSection("Otázka a design studie", [...value.studyQuestion, ...value.design]),
    renderSection("Populace a postup", [
      ...value.population,
      ...value.interventionOrExposure,
    ]),
    renderSection("Sledované výsledky", value.outcomes),
    renderSection("Co uvádí primární zdroj", value.sourceFindings),
    renderSection("Interpretace MedScopeGlobal", value.editorialInterpretation),
    renderSection("Dopad do klinické praxe", value.clinicalRelevance),
    renderSection("Limity a nejistoty", value.limitations),
    renderSection("Co nelze uzavřít", value.cannotConclude),
    `<h2>Zdroje</h2>\n<ul><li><a href="${escapeHtml(
      source.url
    )}" target="_blank" rel="noopener noreferrer">${escapeHtml(citation)}</a></li></ul>`,
  ].join("\n");
}

function validateGenerated(value: GeneratedBriefing, source: SourceRecord) {
  const allText = [
    value.czechTitle,
    value.czechExcerpt,
    ...value.studyQuestion,
    ...value.design,
    ...value.population,
    ...value.interventionOrExposure,
    ...value.outcomes,
    ...value.sourceFindings,
    ...value.editorialInterpretation,
    ...value.clinicalRelevance,
    ...value.limitations,
    ...value.cannotConclude,
  ].join("\n");
  const support = [
    source.pmid,
    source.title,
    source.abstract,
    source.journal,
    source.authors,
    source.year,
    source.doi,
    ...source.publicationTypes,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/,/g, ".");
  const unsupportedNumericTokens = [
    ...new Set(numericTokens(allText).filter((token) => !support.includes(token))),
  ];
  const requiredArrays = [
    value.studyQuestion,
    value.design,
    value.population,
    value.interventionOrExposure,
    value.outcomes,
    value.sourceFindings,
    value.editorialInterpretation,
    value.clinicalRelevance,
    value.limitations,
    value.cannotConclude,
  ];
  return {
    unsupportedNumericTokens,
    unknownFieldCount: unknownFieldCount(value),
    requiredHeadings: requiredArrays.every((field) => field.length > 0),
    czechDominant: isCzechDominant(allText),
    forbidden:
      /\b(klinicky revidov|lékařsky ověřen|časopis podporuje|partnerem časopisu)\b/i.test(
        allText
      ),
  };
}

function removeUnsupportedNumericSentences(
  value: GeneratedBriefing,
  unsupported: string[]
) {
  if (!unsupported.length) {
    return { value, removed: 0 };
  }
  let removed = 0;
  const cleanParagraphs = (paragraphs: string[]) =>
    paragraphs
      .map((paragraph) => {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        const kept = sentences.filter((sentence) => {
          const tokens = numericTokens(sentence);
          const remove = tokens.some((token) => unsupported.includes(token));
          if (remove) removed += 1;
          return !remove;
        });
        return kept.join(" ").trim();
      })
      .filter(Boolean);
  return {
    value: {
      ...value,
      studyQuestion: cleanParagraphs(value.studyQuestion),
      design: cleanParagraphs(value.design),
      population: cleanParagraphs(value.population),
      interventionOrExposure: cleanParagraphs(value.interventionOrExposure),
      outcomes: cleanParagraphs(value.outcomes),
      sourceFindings: cleanParagraphs(value.sourceFindings),
      editorialInterpretation: cleanParagraphs(value.editorialInterpretation),
      clinicalRelevance: cleanParagraphs(value.clinicalRelevance),
      limitations: cleanParagraphs(value.limitations),
      cannotConclude: cleanParagraphs(value.cannotConclude),
    },
    removed,
  };
}

function citationMetadata(source: SourceRecord) {
  return {
    name: source.journal,
    url: source.url,
    originalTitle: source.title,
    authors: source.authors,
    year: source.year,
    pmid: source.pmid,
    ...(source.doi ? { doi: source.doi } : {}),
  };
}

function publicationTypeCzech(types: string[]) {
  const mappings: Array<[RegExp, string]> = [
    [/Randomized Controlled Trial/i, "randomizovaná kontrolovaná studie"],
    [/Meta-Analysis/i, "metaanalýza"],
    [/Systematic Review/i, "systematický přehled"],
    [/Review/i, "přehledová práce"],
    [/Observational Study/i, "observační studie"],
    [/Clinical Trial/i, "klinická studie"],
    [/Comparative Study/i, "srovnávací studie"],
    [/Journal Article/i, "časopisecký článek"],
  ];
  return (
    mappings.find(([pattern]) => types.some((type) => pattern.test(type)))?.[1] ??
    "odborná publikace"
  );
}

const CZECH_BRIEFING_FIXES: Array<[RegExp, string]> = [
  [/\bcelkový a specifický přežití\b/gi, "celkové přežití a přežití specifické pro nádor"],
  [/\bcelková přežití\b/gi, "celkové přežití"],
  [/\bcelkový míra\b/gi, "celková míra"],
  [/\bk konkrétním\b/gi, "ke konkrétním"],
  [/\bs zdravými\b/gi, "se zdravými"],
  [/\bu DN pacientů\b/gi, "u pacientů s DN"],
  [/\bpopulaci diabetik\b/gi, "populaci diabetiků"],
  [/\bk standardní péči\b/gi, "ke standardní péči"],
  [/\bvýběrové bias\b/gi, "výběrové zkreslení"],
  [/\bdrop[‑-]out\b/gi, "odchod účastníků ze studie"],
  [/\banimalních modelů\b/gi, "zvířecích modelů"],
  [/\bUmrzená MRD\b/g, "Nedetekovatelná minimální reziduální nemoc"],
  [/\bdiabetické nožní vředy\b/gi, "diabetického vředu nohy"],
  [/\bdiabetickou nožní vředou\b/gi, "diabetickým vředem nohy"],
  [/\bv diabetické nožní vředu\b/gi, "u diabetického vředu nohy"],
  [/\bpřehledovou recenzi\b/gi, "přehledovou práci"],
  [/\bstaging\b/gi, "stanovení stadia"],
  [/\bpro klinické praxi\b/gi, "pro klinickou praxi"],
  [/\bGynaekologickými\b/g, "gynekologickými"],
  [/\bpodhřbetních vyšetření\b/gi, "gynekologických vyšetření"],
  [/\bscoping review\b/gi, "mapující přehled"],
  [/\btotal neoadjuvantní\b/gi, "totální neoadjuvantní"],
  [/\bfázi II klinickou studii\b/gi, "klinickou studii fáze II"],
  [/\bpřijatelností toxicity\b/gi, "přijatelným profilem toxicity"],
  [/\bvýskytem diabetické onemocnění\b/gi, "výskytem diabetického onemocnění"],
  [/\bkoncový stádiu\b/gi, "konečné stadium"],
  [/\bMendelovsk(á|é|ou|ou|ých|ými)\b/g, "mendelovsk$1"],
];

function polishBriefingCandidate(candidate: PreparedCandidate) {
  const transform = (value: string) => {
    let next = value;
    for (const [pattern, replacement] of CZECH_BRIEFING_FIXES) {
      pattern.lastIndex = 0;
      next = next.replace(pattern, replacement);
    }
    return next;
  };
  let title = transform(candidate.title);
  let excerpt = transform(candidate.excerpt);
  let content = transform(candidate.content);
  if (
    candidate.slug ===
    "badushengji-san-a-diabetick-trojhelnkov-rany-objev-mechanismu"
  ) {
    title =
      "Badushengji San a diabetický vřed nohy: integrovaná analýza možných molekulárních cílů";
    excerpt =
      "Bioinformatická analýza a buněčný experiment zkoumají možné biomarkery diabetického vředu nohy a laboratorní působení tradiční směsi Badushengji San. Výsledky nelze bez klinických studií přenášet na léčbu pacientů.";
  }
  if (
    candidate.slug ===
    "frailty-index-and-type-2-diabetes-with-renal-complications-insights-from-mendelian-randomization-and-retrospective-observational-study"
  ) {
    title =
      "Index křehkosti a diabetes mellitus 2. typu s renálními komplikacemi: mendelovská randomizace a retrospektivní studie";
    excerpt =
      "Studie kombinuje mendelovskou randomizaci s retrospektivním pozorováním pacientů na hemodialýze. Zkoumá vztah indexu křehkosti k diabetu 2. typu s renálními komplikacemi, ale její design neumožňuje automaticky převést asociace do individuální prognózy nebo léčby.";
    content = content
      .replace(/\bzranitelností\b/gi, "křehkostí")
      .replace(/\bzranitelnosti\b/gi, "křehkosti")
      .replace(/\bzranitelnost\b/gi, "křehkost");
  }
  const afterWordCount = countWords(content);
  return {
    ...candidate,
    title,
    excerpt,
    content,
    afterWordCount,
    afterContentHash: hash(content),
  };
}

function conservatizeEditorialSections(candidate: PreparedCandidate) {
  const workType = publicationTypeCzech(candidate.source.publicationTypes);
  const interpretation = `<h2>Interpretace MedScopeGlobal</h2>
<p>MedScopeGlobal chápe zaměření této publikace takto: „${escapeHtml(
    candidate.title
  )}“. Typ práce podle záznamu PubMed: ${escapeHtml(
    workType
  )}. Výše popsané výsledky pocházejí z abstraktu primární publikace; nejde o nezávislé potvrzení výsledků redakcí ani o podporu citujícím časopisem.</p>
<p>Význam nálezu je nutné posuzovat v mezích designu, studované populace, zvolených výsledků a délky sledování. Statistická asociace nebo experimentální mechanismus samy o sobě neprokazují klinický přínos, kauzalitu ani použitelnost mimo podmínky uvedené ve zdroji.</p>`;
  const clinical = `<h2>Dopad do klinické praxe</h2>
<p>Pro klinika je práce relevantní jako podklad k odborné otázce a k dohledání plného textu. Tento briefing sám nemění diagnostický ani léčebný postup a nenahrazuje platné doporučení, regulatorní informace, lokální protokol ani individuální posouzení pacienta.</p>
<p>Před případným přenosem výsledků do praxe je třeba ověřit úplnou metodiku, předem definované endpointy, charakteristiky souboru, absolutní účinky, nežádoucí účinky a návaznost na další důkazy. Údaje, které abstrakt neobsahuje, redakce nedoplňuje.</p>`;
  const content = candidate.content
    .replace(
      /<h2>Interpretace MedScopeGlobal<\/h2>[\s\S]*?(?=<h2>Dopad do klinické praxe<\/h2>)/,
      `${interpretation}\n`
    )
    .replace(
      /<h2>Dopad do klinické praxe<\/h2>[\s\S]*?(?=<h2>Limity a nejistoty<\/h2>)/,
      `${clinical}\n`
    );
  const afterWordCount = countWords(content);
  return {
    ...candidate,
    content,
    afterWordCount,
    afterContentHash: hash(content),
    metadata: {
      ...candidate.metadata,
      editorial_remediation: {
        ...((candidate.metadata.editorial_remediation as Record<string, unknown>) ?? {}),
        method: "source-grounded-structured-v1",
        generation_model:
          ((candidate.metadata.editorial_remediation as Record<string, unknown> | undefined)
            ?.generation_model as string | undefined) || "gemini-2.5-flash-lite",
        clinician_reviewed: false,
        validation: {
          ...(((candidate.metadata.editorial_remediation as Record<string, unknown>)
            ?.validation as Record<string, unknown>) ?? {}),
          word_count: afterWordCount,
          conservative_editorial_sections: true,
        },
      },
      clinician_reviewed: false,
    },
  };
}

function removeFlaggedGroundingSentences(
  candidate: PreparedCandidate,
  unsupportedIds: string[],
  groundingModel: string
) {
  const flagged = new Set(unsupportedIds);
  let content = candidate.content;
  let removed = 0;
  const start = content.indexOf("<h2>Otázka a design studie</h2>");
  const end = content.indexOf("<h2>Interpretace MedScopeGlobal</h2>");
  if (start >= 0 && end > start) {
    let sentenceIndex = 0;
    const evidence = content
      .slice(start, end)
      .replace(/<p>([\s\S]*?)<\/p>/g, (_, paragraphHtml: string) => {
        const kept = decodeXml(paragraphHtml)
          .split(/(?<=[.!?])\s+/)
          .map((sentence) => sentence.trim())
          .filter(Boolean)
          .filter((sentence) => {
            sentenceIndex += 1;
            const remove = flagged.has(`S${sentenceIndex}`);
            if (remove) removed += 1;
            return !remove;
          });
        return kept.length
          ? `<p>${kept.map((sentence) => escapeHtml(sentence)).join(" ")}</p>`
          : "";
      });
    content = `${content.slice(0, start)}${evidence}${content.slice(end)}`;
  }
  content = content
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/\s+([,.])/g, "$1");
  const afterWordCount = countWords(content);
  return {
    ...candidate,
    content,
    afterWordCount,
    afterContentHash: hash(content),
    metadata: {
      ...candidate.metadata,
      editorial_remediation: {
        ...((candidate.metadata.editorial_remediation as Record<string, unknown>) ?? {}),
        grounding_review: {
          model: groundingModel,
          unsupported_sentence_ids: unsupportedIds,
          removed_sentences: removed,
        },
      },
    },
  };
}

function hasAllPopulatedSections(content: string) {
  const headings = [
    "Otázka a design studie",
    "Populace a postup",
    "Sledované výsledky",
    "Co uvádí primární zdroj",
    "Interpretace MedScopeGlobal",
    "Dopad do klinické praxe",
    "Limity a nejistoty",
    "Co nelze uzavřít",
    "Zdroje",
  ];
  return headings.every((heading) => {
    const start = content.indexOf(`<h2>${heading}</h2>`);
    if (start < 0) return false;
    const sectionStart = start + `<h2>${heading}</h2>`.length;
    const next = content.indexOf("<h2>", sectionStart);
    return plainText(content.slice(sectionStart, next < 0 ? content.length : next)).length > 30;
  });
}

function reportPaths(reportDir: string) {
  const date = new Date().toISOString().slice(0, 10);
  return {
    dry: path.join(reportDir, `thin-evidence-remediation-${date}-dry-run.json`),
    part: (offset: number) =>
      path.join(
        reportDir,
        `thin-evidence-remediation-${date}-part-${String(offset).padStart(2, "0")}.json`
      ),
    apply: path.join(reportDir, `thin-evidence-remediation-${date}-apply.json`),
    verify: path.join(reportDir, `thin-evidence-remediation-${date}-idempotency.json`),
    grounding: path.join(
      reportDir,
      `thin-evidence-remediation-${date}-grounding-review.json`
    ),
  };
}

function evidenceSentences(content: string) {
  const start = content.indexOf("<h2>Otázka a design studie</h2>");
  const end = content.indexOf("<h2>Interpretace MedScopeGlobal</h2>");
  const section = content.slice(Math.max(0, start), end > start ? end : content.length);
  return [...section.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .flatMap((match) => decodeXml(match[1]).split(/(?<=[.!?])\s+/))
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function parseGroundingReview(
  value: string,
  sentenceCount: number
): {
  approved: boolean;
  unsupportedIds: string[];
  reason: string;
} | null {
  const parsed = parseModelJson(value) as unknown as {
    unsupportedIds?: unknown;
    reason?: unknown;
  } | null;
  if (!parsed || !Array.isArray(parsed.unsupportedIds)) return null;
  const validIds = new Set(
    Array.from({ length: sentenceCount }, (_, index) => `S${index + 1}`)
  );
  const unsupportedIds = parsed.unsupportedIds
    .map(String)
    .filter((id) => validIds.has(id));
  return {
    approved: unsupportedIds.length === 0,
    unsupportedIds,
    reason: String(parsed.reason ?? ""),
  };
}

async function reviewGrounding(
  candidate: PreparedCandidate,
  source: SourceRecord,
  options: {
    groqKey?: string;
    groqModel: string;
    geminiKey?: string;
    geminiModel: string;
    preferGemini: boolean;
  }
) {
  const sentences = evidenceSentences(candidate.content);
  const prompt = `Posuď pouze oporu tvrzení v dodaném abstraktu. Nepoužívej vlastní znalosti.
Každá věta S1, S2... musí být přímo podpořena abstraktem nebo jeho bezprostřední opatrnou parafrází.
Za nepodpořené označ doplněné metody, populace, mechanismy, výsledky nebo klinické důsledky, které abstrakt neobsahuje.
Nevyžaduj doslovnou shodu a neoznačuj pouhé opatrné konstatování, že abstrakt údaj neuvádí.
Vrať JSON: {"unsupportedIds":["S3"],"reason":"stručně"}.

NÁZEV: ${source.title}
ABSTRAKT:
${source.abstract}

VĚTY:
${sentences.map((sentence, index) => `S${index + 1}: ${sentence}`).join("\n")}`;
  if (
    !options.preferGemini &&
    !groqDisabledByQuota &&
    options.groqKey?.startsWith("gsk_")
  ) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.groqModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 800,
        response_format: { type: "json_object" },
        ...(options.groqModel.startsWith("openai/")
          ? { reasoning_effort: "low" }
          : {}),
      }),
      signal: AbortSignal.timeout(120000),
    });
    if (response.ok) {
      const payload = await response.json();
      const parsed = parseGroundingReview(
        payload?.choices?.[0]?.message?.content ?? "",
        sentences.length
      );
      if (parsed) return { ...parsed, model: options.groqModel };
    } else {
      const body = (await response.text()).slice(0, 400);
      console.error(`Groq grounding HTTP ${response.status}: ${body}`);
      if (isGroqQuotaError(response.status, body)) {
        groqDisabledByQuota = true;
      }
    }
  }
  if (options.geminiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${options.geminiModel}:generateContent?key=${options.geminiKey}`;
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 1200,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(120000),
      });
      if (response.ok) {
        const payload = await response.json();
        const parsed = parseGroundingReview(
          payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
          sentences.length
        );
        if (parsed) return { ...parsed, model: options.geminiModel };
        return {
          approved: false,
          unsupportedIds: [] as string[],
          reason: "verification_invalid_json",
          model: options.geminiModel,
        };
      }
      console.error(`Gemini grounding HTTP ${response.status} (attempt ${attempt + 1})`);
      if (![429, 503].includes(response.status) || attempt === 2) {
        return {
          approved: false,
          unsupportedIds: [] as string[],
          reason: `verification_http_${response.status}`,
          model: options.geminiModel,
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 20000 * (attempt + 1)));
    }
  }
  return {
    approved: false,
    unsupportedIds: [] as string[],
    reason: "verification_unavailable",
    model: "none",
  };
}

async function main() {
  const options = parseArgs();
  const env: Record<string, string | undefined> = {
    ...loadProjectEnv(ROOT),
    ...process.env,
  };
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase service-role credentials");
  }
  const geminiKey = [
    env.GEMINI_API_KEY,
    env.GOOGLE_AI_API_KEY,
    env.GOOGLE_GENERATIVE_AI_API_KEY,
  ].find((value) => value && value.length > 20);
  const model = env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const groqKey = env.GROQ_API_KEY;
  const groqModel =
    options.groqModel ||
    env.GROQ_REMEDIATION_MODEL ||
    "openai/gpt-oss-120b";
  const admin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
  const articles = await fetchAllPublished(admin);
  const before = summarizeArticleAudits(articles.map((article) => auditArticle(article)));
  const paths = reportPaths(options.reportDir);

  if (options.groundingReview) {
    if (!groqKey?.startsWith("gsk_") && !geminiKey) {
      throw new Error("Missing Groq or Gemini key for independent grounding review");
    }
    const partFiles = (await readdir(options.reportDir))
      .filter((name) => /^thin-evidence-remediation-\d{4}-\d{2}-\d{2}-part-\d+\.json$/.test(name))
      .sort();
    const sourceFiles = partFiles.length
      ? partFiles
      : (await readdir(options.reportDir))
          .filter((name) => /^thin-evidence-remediation-\d{4}-\d{2}-\d{2}-dry-run\.json$/.test(name))
          .sort();
    const parts = await Promise.all(
      sourceFiles.map(async (name) =>
        JSON.parse(await readFile(path.join(options.reportDir, name), "utf8"))
      )
    ) as Array<{ prepared: PreparedCandidate[] }>;
    const candidates = [
      ...new Map(
        parts
          .flatMap((part) => part.prepared ?? [])
          .map((candidate) => [candidate.id, candidate])
      ).values(),
    ].slice(0, options.target);
    const sources = await fetchPubMedRecords(
      candidates.map((candidate) => candidate.source.pmid)
    );
    const reviews: Array<{
      id: string;
      slug: string;
      approved: boolean;
      unsupportedIds: string[];
      reason: string;
      model?: string;
    }> = [];
    for (const candidate of candidates) {
      const source = sources.get(candidate.source.pmid);
      if (!source) {
        reviews.push({
          id: candidate.id,
          slug: candidate.slug,
          approved: false,
          unsupportedIds: [],
          reason: "source_unavailable",
        });
        continue;
      }
      const result = await reviewGrounding(candidate, source, {
        groqKey,
        groqModel,
        geminiKey,
        geminiModel: model,
        preferGemini: options.preferGemini,
      });
      reviews.push({ id: candidate.id, slug: candidate.slug, ...result });
      await new Promise((resolve) =>
        setTimeout(resolve, options.preferGemini || groqDisabledByQuota ? 12000 : 25000)
      );
    }
    const usedModels = [...new Set(reviews.map((review) => review.model).filter(Boolean))];
    const report = {
      generatedAt: new Date().toISOString(),
      mode: "grounding-review",
      model: usedModels.join("; ") || (options.preferGemini ? model : groqModel),
      reviewed: reviews.length,
      approved: reviews.filter((review) => review.approved).length,
      rejected: reviews.filter((review) => !review.approved).length,
      reviews,
    };
    await writeFile(paths.grounding, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ...report, report: paths.grounding }, null, 2));
    return;
  }

  if (options.mergeParts) {
    const partFiles = (await readdir(options.reportDir))
      .filter((name) => /^thin-evidence-remediation-\d{4}-\d{2}-\d{2}-part-\d+\.json$/.test(name))
      .sort();
    const sourceFiles = partFiles.length
      ? partFiles
      : (await readdir(options.reportDir))
          .filter((name) => /^thin-evidence-remediation-\d{4}-\d{2}-\d{2}-dry-run\.json$/.test(name))
          .sort();
    const parts = await Promise.all(
      sourceFiles.map(async (name) =>
        JSON.parse(await readFile(path.join(options.reportDir, name), "utf8"))
      )
    ) as Array<{
      prepared: PreparedCandidate[];
      eligibleCandidates: number;
      skipped: {
        missingAbstract: number;
        abstractTooShort: number;
        generationFailed: number;
        validationFailed: Array<{ slug: string; reasons: string[] }>;
      };
      model: string;
    }>;
    const unique = new Map<string, PreparedCandidate>();
    let groundingReviews:
      | Map<
          string,
          { approved: boolean; unsupportedIds: string[]; reason: string }
        >
      | null = null;
    let groundingModel = "not_available";
    try {
      const grounding = JSON.parse(await readFile(paths.grounding, "utf8")) as {
        model?: string;
        reviews?: Array<{
          id: string;
          approved: boolean;
          unsupportedIds: string[];
          reason: string;
        }>;
      };
      groundingReviews = new Map(
        (grounding.reviews ?? []).map((review) => [review.id, review])
      );
      groundingModel = grounding.model ?? "not_recorded";
    } catch {
      groundingReviews = null;
    }
    for (const part of parts) {
      for (const candidate of part.prepared ?? []) {
        if (unique.size >= options.target) break;
        const review = groundingReviews?.get(candidate.id);
        if (groundingReviews && !review) continue;
        if (review && !review.approved && !review.unsupportedIds.length) continue;
        const grounded =
          review && review.unsupportedIds.length
            ? removeFlaggedGroundingSentences(
                candidate,
                review.unsupportedIds,
                groundingModel
              )
            : candidate;
        const conservativeDraft = polishBriefingCandidate(
          conservatizeEditorialSections(grounded)
        );
        const conservative = {
          ...conservativeDraft,
          metadata: {
            ...conservativeDraft.metadata,
            editorial_remediation: {
              ...((conservativeDraft.metadata
                .editorial_remediation as Record<string, unknown>) ?? {}),
              batch_id: BATCH_ID,
              evaluated_at: new Date().toISOString(),
              grounding_review: {
                model: groundingModel,
                unsupported_sentence_ids: review?.unsupportedIds ?? [],
                removed_sentences: review?.unsupportedIds.length ?? 0,
              },
              clinician_reviewed: false,
            },
            clinician_reviewed: false,
          },
        };
        if (
          conservative.afterWordCount < 600 ||
          !hasAllPopulatedSections(conservative.content)
        ) {
          continue;
        }
        unique.set(candidate.id, conservative);
      }
    }
    const prepared = [...unique.values()];
    const byId = new Map(articles.map((article) => [article.id, article]));
    for (const candidate of prepared) {
      const article = byId.get(candidate.id);
      if (!article) continue;
      article.title = candidate.title;
      article.excerpt = candidate.excerpt;
      article.content = candidate.content;
      article.metadata = candidate.metadata;
      article.source_name = candidate.source.journal;
      article.source_url = candidate.source.url;
    }
    const after = summarizeArticleAudits(articles.map((article) => auditArticle(article)));
    const report = {
      generatedAt: new Date().toISOString(),
      mode: "dry-run",
      batchId: BATCH_ID,
      target: options.target,
      model: [...new Set(parts.map((part) => part.model))].join("; "),
      before,
      after,
      eligibleCandidates: Math.max(
        0,
        ...parts.map((part) => part.eligibleCandidates ?? 0)
      ),
      preparedCount: prepared.length,
      wordRanges: {
        before: prepared.length
          ? {
              min: Math.min(...prepared.map((item) => item.beforeWordCount)),
              max: Math.max(...prepared.map((item) => item.beforeWordCount)),
            }
          : null,
        after: prepared.length
          ? {
              min: Math.min(...prepared.map((item) => item.afterWordCount)),
              max: Math.max(...prepared.map((item) => item.afterWordCount)),
            }
          : null,
      },
      skipped: {
        missingAbstract: parts.reduce((sum, part) => sum + part.skipped.missingAbstract, 0),
        abstractTooShort: parts.reduce((sum, part) => sum + part.skipped.abstractTooShort, 0),
        generationFailed: parts.reduce((sum, part) => sum + part.skipped.generationFailed, 0),
        validationFailed: parts.flatMap((part) => part.skipped.validationFailed),
        targetReached: Math.max(
          0,
          parts.flatMap((part) => part.prepared ?? []).length - prepared.length
        ),
      },
      partFiles: sourceFiles,
      prepared,
    };
    await writeFile(paths.dry, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(
      JSON.stringify(
        {
          ...report,
          prepared: prepared.map(({ slug, beforeWordCount, afterWordCount }) => ({
            slug,
            beforeWordCount,
            afterWordCount,
          })),
          report: paths.dry,
        },
        null,
        2
      )
    );
    return;
  }

  if (options.verifyApplied) {
    const appliedReport = JSON.parse(await readFile(paths.apply, "utf8")) as {
      prepared: PreparedCandidate[];
    };
    const byId = new Map(articles.map((article) => [article.id, article]));
    const mismatches: string[] = [];
    for (const prepared of appliedReport.prepared) {
      const article = byId.get(prepared.id);
      if (
        !article ||
        hash(String(article.content ?? "")) !== prepared.afterContentHash ||
        auditArticle(article).issues.some((issue) => issue.code === "thin_content")
      ) {
        mismatches.push(prepared.slug);
      }
    }
    const report = {
      generatedAt: new Date().toISOString(),
      mode: "verify-applied",
      checked: appliedReport.prepared.length,
      mismatches,
      before,
      after: before,
    };
    await writeFile(paths.verify, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ...report, report: paths.verify }, null, 2));
    if (mismatches.length) process.exitCode = 1;
    return;
  }

  if (options.apply) {
    const dryReport = JSON.parse(await readFile(paths.dry, "utf8")) as {
      prepared: PreparedCandidate[];
      before: ReturnType<typeof summarizeArticleAudits>;
    };
    let previousAppliedHashes = new Map<string, string>();
    try {
      const previous = JSON.parse(await readFile(paths.apply, "utf8")) as {
        prepared?: PreparedCandidate[];
      };
      previousAppliedHashes = new Map(
        (previous.prepared ?? []).map((candidate) => [
          candidate.id,
          candidate.afterContentHash,
        ])
      );
    } catch {
      previousAppliedHashes = new Map();
    }
    const byId = new Map(articles.map((article) => [article.id, article]));
    const applied = {
      updated: 0,
      revisedApplied: 0,
      alreadyApplied: 0,
      skippedChanged: 0,
      errors: [] as string[],
    };
    const beforeWords: number[] = [];
    const afterWords: number[] = [];
    for (const prepared of dryReport.prepared) {
      const article = byId.get(prepared.id);
      if (!article || article.slug === HEART_SLUG || isPublicWriterQuarantined(article)) continue;
      const currentHash = hash(String(article.content ?? ""));
      if (currentHash === prepared.afterContentHash) {
        applied.alreadyApplied += 1;
        continue;
      }
      const isPriorBatchVersion =
        previousAppliedHashes.get(prepared.id) === currentHash;
      if (currentHash !== prepared.beforeContentHash && !isPriorBatchVersion) {
        applied.skippedChanged += 1;
        continue;
      }
      const { error } = await admin
        .from("articles")
        .update({
          title: prepared.title,
          excerpt: prepared.excerpt,
          content: prepared.content,
          metadata: prepared.metadata,
          source_name: prepared.source.journal,
          source_url: prepared.source.url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prepared.id)
        .eq("published", true)
        .neq("slug", HEART_SLUG);
      if (error) {
        applied.errors.push(`${prepared.slug}: ${error.message}`);
        continue;
      }
      article.title = prepared.title;
      article.excerpt = prepared.excerpt;
      article.content = prepared.content;
      article.metadata = prepared.metadata;
      article.source_name = prepared.source.journal;
      article.source_url = prepared.source.url;
      beforeWords.push(prepared.beforeWordCount);
      afterWords.push(prepared.afterWordCount);
      applied.updated += 1;
      if (isPriorBatchVersion) applied.revisedApplied += 1;
    }
    const after = summarizeArticleAudits(articles.map((article) => auditArticle(article)));
    const report = {
      generatedAt: new Date().toISOString(),
      mode: "apply",
      batchId: BATCH_ID,
      batchBefore: dryReport.before,
      before,
      after,
      applied,
      wordRanges: {
        before: beforeWords.length
          ? { min: Math.min(...beforeWords), max: Math.max(...beforeWords) }
          : null,
        after: afterWords.length
          ? { min: Math.min(...afterWords), max: Math.max(...afterWords) }
          : null,
      },
      prepared: dryReport.prepared,
    };
    await writeFile(paths.apply, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(
      JSON.stringify(
        { ...report, prepared: report.prepared.map(({ slug, beforeWordCount, afterWordCount }) => ({
          slug,
          beforeWordCount,
          afterWordCount,
        })), report: paths.apply },
        null,
        2
      )
    );
    return;
  }

  if (!geminiKey) throw new Error("Missing Gemini key for source-grounded dry-run");
  const { globalRank, rubricRank } = buildRanks(articles);
  const candidateRows = articles
    .filter((article) => {
      const audit = auditArticle(article);
      return (
        article.slug !== HEART_SLUG &&
        !isPublicWriterQuarantined(article) &&
        audit.physicianAudience &&
        audit.wordCount >= 350 &&
        audit.wordCount < 600 &&
        audit.issues.some((issue) => issue.code === "thin_content") &&
        Boolean(extractPmid(article))
      );
    })
    .map((article) => ({
      article,
      pmid: extractPmid(article)!,
      ...visibility(article, globalRank, rubricRank),
    }))
    .sort((a, b) => b.score - a.score);
  const sources = await fetchPubMedRecords([
    ...new Set(candidateRows.map((candidate) => candidate.pmid)),
  ]);
  const prepared: PreparedCandidate[] = [];
  const skipped = {
    missingAbstract: 0,
    abstractTooShort: 0,
    generationFailed: 0,
    validationFailed: [] as Array<{ slug: string; reasons: string[] }>,
    targetReached: 0,
  };

  for (const candidate of candidateRows.slice(
    options.offset,
    options.candidateLimit
      ? options.offset + options.candidateLimit
      : candidateRows.length
  )) {
    if (prepared.length >= options.target) {
      skipped.targetReached += 1;
      continue;
    }
    const source = sources.get(candidate.pmid);
    if (!source?.abstract) {
      skipped.missingAbstract += 1;
      continue;
    }
    if (countWords(source.abstract) < 200) {
      skipped.abstractTooShort += 1;
      continue;
    }
    const generatedRaw = await generateBriefing(
      source,
      geminiKey,
      model,
      groqKey,
      groqModel,
      options.preferGemini
    );
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        generatedRaw?.model.includes("gemini") || groqDisabledByQuota || options.preferGemini
          ? 4000
          : 25000
      )
    );
    if (!generatedRaw) {
      skipped.generationFailed += 1;
      continue;
    }
    const normalized = normalizedGenerated(generatedRaw.briefing);
    const initialValidation = validateGenerated(normalized, source);
    const sanitized = removeUnsupportedNumericSentences(
      normalized,
      initialValidation.unsupportedNumericTokens
    );
    const generated = sanitized.value;
    const validation = validateGenerated(generated, source);
    const content = renderBriefing(generated, source);
    const afterWordCount = countWords(content);
    const reasons = [
      ...(validation.unsupportedNumericTokens.length
        ? [`unsupported_numbers:${validation.unsupportedNumericTokens.join(",")}`]
        : []),
      ...(validation.unknownFieldCount > 2
        ? [`too_many_unknown_fields:${validation.unknownFieldCount}`]
        : []),
      ...(!validation.requiredHeadings ? ["missing_structured_fields"] : []),
      ...(!validation.czechDominant ? ["not_czech_dominant"] : []),
      ...(validation.forbidden ? ["forbidden_review_or_endorsement_claim"] : []),
      ...(afterWordCount < 600 || afterWordCount > 1100
        ? [`word_count:${afterWordCount}`]
        : []),
      ...(generated.czechTitle.length < 20 ? ["title_too_short"] : []),
      ...(generated.czechExcerpt.length < 80 ? ["excerpt_too_short"] : []),
    ];
    if (reasons.length) {
      skipped.validationFailed.push({ slug: String(candidate.article.slug), reasons });
      continue;
    }
    const metadata: Record<string, unknown> = {
      ...(candidate.article.metadata ?? {}),
      source_citation: citationMetadata(source),
      ...(source.doi ? { primary_doi: source.doi } : {}),
      editorial_remediation: {
        batch_id: BATCH_ID,
        evaluated_at: new Date().toISOString(),
        method: generatedRaw.model.includes("gemini")
          ? "source-grounded-gemini-v1"
          : "source-grounded-structured-v1",
        generation_model: generatedRaw.model,
        source_verification: "NCBI PubMed EFetch abstract and bibliographic XML",
        source_abstract_sha256: hash(source.abstract),
        validation: {
          unsupported_numeric_tokens: validation.unsupportedNumericTokens,
          unknown_field_count: validation.unknownFieldCount,
          removed_unsupported_numeric_sentences: sanitized.removed,
          word_count: afterWordCount,
        },
        clinician_reviewed: false,
      },
      clinician_reviewed: false,
    };
    if (!source.doi) delete metadata.primary_doi;
    prepared.push({
      id: candidate.article.id,
      slug: String(candidate.article.slug),
      beforeWordCount: auditArticle(candidate.article).wordCount,
      afterWordCount,
      beforeContentHash: hash(String(candidate.article.content ?? "")),
      afterContentHash: hash(content),
      title: generated.czechTitle,
      excerpt: generated.czechExcerpt,
      content,
      source: {
        pmid: source.pmid,
        title: source.title,
        journal: source.journal,
        authors: source.authors,
        year: source.year,
        doi: source.doi,
        publicationTypes: source.publicationTypes,
        url: source.url,
        abstractHash: hash(source.abstract),
        abstractCharacters: source.abstract.length,
      },
      metadata,
      visibilityScore: candidate.score,
      surfaces: candidate.surfaces,
      validation: {
        unsupportedNumericTokens: validation.unsupportedNumericTokens,
        removedUnsupportedNumericSentences: sanitized.removed,
        unknownFieldCount: validation.unknownFieldCount,
        requiredHeadings: validation.requiredHeadings,
        czechDominant: validation.czechDominant,
      },
    });
    candidate.article.title = generated.czechTitle;
    candidate.article.excerpt = generated.czechExcerpt;
    candidate.article.content = content;
    candidate.article.metadata = metadata;
    candidate.article.source_name = source.journal;
    candidate.article.source_url = source.url;
  }

  const after = summarizeArticleAudits(articles.map((article) => auditArticle(article)));
  const report = {
    generatedAt: new Date().toISOString(),
    mode: "dry-run",
    batchId: BATCH_ID,
    target: options.target,
    model: `${groqModel} (Gemini fallback: ${model})`,
    before,
    after,
    eligibleCandidates: candidateRows.length,
    preparedCount: prepared.length,
    wordRanges: {
      before: prepared.length
        ? {
            min: Math.min(...prepared.map((item) => item.beforeWordCount)),
            max: Math.max(...prepared.map((item) => item.beforeWordCount)),
          }
        : null,
      after: prepared.length
        ? {
            min: Math.min(...prepared.map((item) => item.afterWordCount)),
            max: Math.max(...prepared.map((item) => item.afterWordCount)),
          }
        : null,
    },
    skipped,
    prepared,
  };
  await mkdir(options.reportDir, { recursive: true });
  const dryPath = options.candidateLimit ? paths.part(options.offset) : paths.dry;
  await writeFile(dryPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        ...report,
        prepared: prepared.map(
          ({ slug, beforeWordCount, afterWordCount, source, validation }) => ({
            slug,
            beforeWordCount,
            afterWordCount,
            pmid: source.pmid,
            doi: source.doi,
            validation,
          })
        ),
        report: dryPath,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
