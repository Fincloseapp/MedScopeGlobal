#!/usr/bin/env node
/**
 * Sdílené utility pro veřejné zdravotnické writery (v25).
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { writeJson, readJson, appendLog, DATA_ROOT } from "../shared.mjs";
import {
  buildV26StructurePrompt,
  buildPersonaStylePrompt,
  buildBlocklistPrompt,
  buildArticleUserPrompt,
  validateV26Structure,
  wrapContentInV26Structure,
  appendEditorialByline,
  appendSourcesFallback,
  buildForeignMagazineStylePrompt,
  buildPersonaFallbackHtml,
  isBoilerplateContent,
} from "../../v26/editorial-prompts.mjs";
import { pickPersonaForArticle, pickAlternatePersona } from "../../v26/personas.mjs";
import {
  assignEditorialUnits,
  buildEditorialMetadataPatch,
  editorialUnitForPersonaStyle,
  formatEditorialUnitDisplay,
} from "../../editorial/units.scripts.mjs";
import {
  checkPublicArticleSimilarity,
  loadRecentPublicArticles,
  loadRecentFromPublicIndex,
} from "../../v26/public-similarity.mjs";
import { polishCzechArticle } from "../../i18n/czech-polish.mjs";
import { pickEditorialUnitForArticle } from "../../v26/editorial-unit-rotation.mjs";
import { enrichSeedsWithCalendar } from "../../v26/topic-calendar.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..", "..");

export const PUBLIC_TOPICS = {
  "zivotni-styl": "Životní styl",
  nemoci: "Nemoci",
  prevence: "Prevence",
  rozhovory: "Rozhovory",
  dlouhovekost: "Dlouhověkost",
};

/** Merge writer seeds with seasonal/current-event calendar overlays. */
export function getEnrichedWriterSeeds(seeds, topic, writerIndex = 0, date = new Date()) {
  return enrichSeedsWithCalendar(seeds, {
    topic,
    writerIndex,
    date,
    includeLongevity: topic === "dlouhovekost" || topic === "zivotni-styl" || topic === "prevence",
  });
}

export function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function topicHash(title, topic) {
  return createHash("sha256").update(`${topic}:${title}`).digest("hex").slice(0, 12);
}

/** Day-of-year (1–366) for rotating writer seeds daily. */
export function daySeedOffset(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

/** Pick `limit` seeds starting at a day-rotated index (unique per writer). */
export function pickRotatedSeeds(seeds, limit, writerIndex = 0, date = new Date()) {
  const n = seeds.length;
  if (n === 0 || limit <= 0) return [];
  const start = (daySeedOffset(date) + writerIndex) % n;
  const picked = [];
  for (let i = 0; i < limit; i++) {
    picked.push(seeds[(start + i) % n]);
  }
  return picked;
}

export function todayDateTag(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export const DEFAULT_PUBLIC_WRITER_LIMIT = Number(process.env.PUBLIC_WRITER_LIMIT ?? 4);

function loadEnvLocal() {
  for (const name of [".env", ".env.local"]) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

export function getSupabaseAdmin() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function parseLlmJsonContent(content) {
  if (!content?.trim()) return null;
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = String(content).match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

const SMALL_GROQ_MODEL = /8b|instant|gpt-oss/i;

/** Short system + excerpt-only user — fits llama-3.1-8b context when full prompt returns 413. */
function buildCompactPrompts(system, user) {
  const text = String(user ?? "");
  const seed =
    text.match(/téma:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    text.match(/téma:\s*(.+)/i)?.[1]?.trim() ??
    "zdraví";
  const angle =
    text.match(/úhel pohledu:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ?? "praktické rady pro každého";
  const section =
    text.match(/sekce redakce:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    text.match(/Sekce redakce:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    "Veřejnost";

  return {
    system: `Jsi český zdravotnický redaktor MedScopeGlobal v26.3 (sekce ${section}).
Piš česky, bez strašení, bez diagnóz. Délka 800–1100 slov.
Vrať JSON: { "title", "excerpt", "bodyHtml", "keywords", "metaDescription" }.
bodyHtml: HTML s <p>, <h2>, <ul> nebo <h3>, včetně <h2>Zdroje</h2>.`,
    user: `Téma: ${seed}. Úhel: ${angle}. Sekce: ${section}. Napiš podrobný článek.`,
  };
}

async function groqJsonCall({ groqKey, model, system, user, maxTokens, temperature }) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) return { parsed: null, status: res.status };
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return { parsed: parseLlmJsonContent(content), status: 200 };
}

async function openaiJsonCall({ system, user, maxTokens, temperature }) {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openaiKey?.startsWith("sk-")) return null;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    appendLog("v25-public-writers.log", `openai HTTP ${res.status}`);
    return null;
  }
  const data = await res.json();
  return parseLlmJsonContent(data?.choices?.[0]?.message?.content);
}

async function geminiJsonCall({ system, user, maxTokens, temperature }) {
  const geminiKey = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_AI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  ]
    .map((k) => k?.trim())
    .find((k) => k && k.length > 20 && (k.startsWith("AIza") || k.startsWith("AQ.")));
  if (!geminiKey) return null;

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `SYSTEM:\n${system}\n\nUSER:\n${user}` }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    appendLog("v25-public-writers.log", `gemini HTTP ${res.status}`);
    if (res.status === 503 || res.status === 429) {
      await sleep(2000);
      const retry = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `SYSTEM:\n${system}\n\nUSER:\n${user}` }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(120000),
      });
      if (retry.ok) {
        const retryData = await retry.json();
        const content = retryData?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = parseLlmJsonContent(content);
        if (parsed) {
          appendLog("v25-public-writers.log", "provider gemini OK (retry)");
          return parsed;
        }
      }
      appendLog("v25-public-writers.log", `gemini retry HTTP ${retry.status}`);
    }
    return null;
  }
  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return parseLlmJsonContent(content);
}

export function countPublicArticleWords(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Optional expansion pass when draft is below minWords — keeps HTML structure, targets 700+ words. */
export async function expandPublicArticleIfShort(
  article,
  { minWords = 450, targetWords = 700, topicLabel = "Veřejnost", maxAttempts = 2 } = {}
) {
  const priorWords = countPublicArticleWords(article.bodyHtml);
  if (priorWords >= minWords) {
    return { ...article, expanded: false, wordCount: priorWords, priorWordCount: priorWords };
  }

  const system = `Jsi český zdravotnický redaktor MedScopeGlobal v26.3 (sekce ${topicLabel}).
Rozšiř existující článek na minimálně ${targetWords} slov — NIKDY nezkracuj.
Zachovej strukturu HTML (<p>, <h2>, <h3>, <ul>, včetně <h2>Zdroje</h2>).
Bez strašení, bez diagnóz — doporuč kontakt s lékařem u nejasných příznaků.
Piš česky. Vrať JSON: { "title", "excerpt", "bodyHtml", "keywords", "metaDescription" }`;

  let best = { ...article, wordCount: priorWords, priorWordCount: priorWords };
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await sleep(4000 * attempt);

    const user = `Rozšiř tento článek na ${targetWords}+ slov (aktuálně ${best.wordCount}). Zachovej strukturu, téma a redakční tón. Přidej podrobnosti, příklady a praktické rady.

Nadpis: ${article.title ?? ""}
Perex: ${article.excerpt ?? ""}

Stávající HTML:
${best.bodyHtml ?? article.bodyHtml ?? ""}`;

    appendLog(
      "v25-public-writers.log",
      `expansion pass attempt ${attempt + 1} ${best.wordCount}→${targetWords}+ for "${String(article.title ?? "").slice(0, 60)}"`
    );

    const parsed = await generateJsonFromLlm({
      system,
      user,
      maxTokens: 4096,
      temperature: 0.38 + attempt * 0.06,
    });
    if (!parsed?.bodyHtml) continue;

    const wordCount = countPublicArticleWords(parsed.bodyHtml);
    if (wordCount <= best.wordCount) {
      appendLog("v25-public-writers.log", `expansion rejected shorter output ${wordCount} <= ${best.wordCount}`);
      continue;
    }

    best = {
      ...article,
      title: parsed.title ?? article.title,
      excerpt: parsed.excerpt ?? article.excerpt,
      bodyHtml: parsed.bodyHtml,
      keywords: parsed.keywords ?? article.keywords,
      metaDescription: parsed.metaDescription ?? article.metaDescription,
      expanded: true,
      wordCount,
      priorWordCount: priorWords,
    };
    if (wordCount >= minWords) break;
  }

  return {
    ...best,
    expanded: best.wordCount > priorWords,
    expandFailed: best.wordCount < minWords,
    priorWordCount: priorWords,
  };
}

export async function generateJsonFromLlm({ system, user, maxTokens = 4096, temperature = 0.4 }) {
  loadEnvLocal();
  const cappedTokens = Math.min(maxTokens, 4096);
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (groqKey?.startsWith("gsk_")) {
    const models = [
      process.env.GROQ_MODEL_PRIMARY ?? "llama-3.3-70b-versatile",
      process.env.GROQ_MODEL_FALLBACK ?? "llama-3.1-8b-instant",
      process.env.GROQ_MODEL_FALLBACK_2,
    ].filter(Boolean);

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const useCompactFirst = i > 0 || SMALL_GROQ_MODEL.test(model);
      const promptAttempts = useCompactFirst
        ? [buildCompactPrompts(system, user)]
        : [{ system, user }, buildCompactPrompts(system, user)];

      for (let ai = 0; ai < promptAttempts.length; ai++) {
        const prompts = promptAttempts[ai];
        const compact = useCompactFirst || ai > 0;
        try {
          const { parsed, status } = await groqJsonCall({
            groqKey,
            model,
            ...prompts,
            maxTokens: cappedTokens,
            temperature,
          });
          if (parsed) {
            appendLog(
              "v25-public-writers.log",
              `provider groq model=${model} compact=${compact}`
            );
            return parsed;
          }
          appendLog(
            "v25-public-writers.log",
            `groq ${model} HTTP ${status}${compact ? " (compact)" : ""}`
          );
          if (status === 429) {
            await sleep(2500);
            break;
          }
          if (status === 413 && !compact) continue;
        } catch (e) {
          appendLog("v25-public-writers.log", `groq ${model} error: ${e.message}`);
        }
      }
    }
    appendLog("v25-public-writers.log", "groq chain exhausted — trying secondary providers");
  }

  for (const [provider, call] of [
    ["openai", () => openaiJsonCall({ system, user, maxTokens: cappedTokens, temperature })],
    ["gemini", () => geminiJsonCall({ system, user, maxTokens: cappedTokens, temperature })],
  ]) {
    try {
      const parsed = await call();
      if (parsed) {
        appendLog("v25-public-writers.log", `provider ${provider} OK`);
        return parsed;
      }
    } catch (e) {
      appendLog("v25-public-writers.log", `${provider} error: ${e.message}`);
    }
  }

  return null;
}

/** Deterministic unique fallback titles — never reuse a single generic template. */
const FALLBACK_TITLE_BUILDERS = [
  (seed, angle) => `${seed} — ${angle}`,
  (seed, angle, topicLabel) => `${topicLabel}: ${seed}`,
  (seed) => `Průvodce pro veřejnost: ${seed}`,
  (seed, angle) => `${angle.charAt(0).toUpperCase()}${angle.slice(1)}: ${seed}`,
  (seed) => `Co byste měli vědět o ${seed.charAt(0).toLowerCase()}${seed.slice(1)}`,
  (seed, _angle, topicLabel) => `${seed} · ${topicLabel} bez zbytečného strašení`,
];

export function buildFallbackTitle({ topic, topicLabel, seed, angle = "praktické rady pro každého" }) {
  const hash = createHash("sha256").update(`${topic}:${seed}:${angle}`).digest();
  const idx = hash[0] % FALLBACK_TITLE_BUILDERS.length;
  return FALLBACK_TITLE_BUILDERS[idx](seed, angle, topicLabel);
}

const EXCERPT_TEASER_SUFFIXES = [
  (seed) => `${seed} — praktický průvodce pro každodenní rozhodování.`,
  (seed, angle) => `${angle.charAt(0).toUpperCase()}${angle.slice(1)}: ${seed}.`,
  (seed) => `Co stojí za ${seed.charAt(0).toLowerCase()}${seed.slice(1)} a co zvládnete sami.`,
  (seed) => `${seed} — ověřené informace bez zbytečného strašení.`,
  (seed, angle) => `${seed}. ${angle.charAt(0).toUpperCase()}${angle.slice(1)}.`,
];

function buildFallbackExcerpt({ seed, angle = "praktické rady pro každého" }) {
  const hash = createHash("sha256").update(`${seed}:${angle}`).digest();
  const idx = hash[0] % EXCERPT_TEASER_SUFFIXES.length;
  return EXCERPT_TEASER_SUFFIXES[idx](seed, angle);
}

export function fallbackArticle({
  topic,
  topicLabel,
  seed,
  writerName,
  angle = "praktické rady pro každého",
  persona = null,
}) {
  const title = buildFallbackTitle({ topic, topicLabel, seed, angle });
  const bodyHtml = buildPersonaFallbackHtml({
    topic,
    topicLabel,
    seed,
    persona,
    angle,
  });
  return {
    title,
    excerpt: buildFallbackExcerpt({ seed, angle }),
    bodyHtml,
    keywords: [seed, topicLabel, "zdraví", "prevence"],
    metaDescription: `Praktické informace o ${seed.toLowerCase()} pro veřejnost.`,
  };
}

const MAX_SIMILARITY_RETRIES = 3;
const MAX_LLM_RETRIES = 3;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let cachedRecentPublicArticles = null;
let cachedRecentPublicAt = 0;

export async function getRecentPublicArticlesForDedup() {
  const now = Date.now();
  if (cachedRecentPublicArticles && now - cachedRecentPublicAt < 60_000) {
    return cachedRecentPublicArticles;
  }
  const admin = getSupabaseAdmin();
  let recent = admin ? await loadRecentPublicArticles(admin) : [];
  if (!recent.length) recent = loadRecentFromPublicIndex(readJson);
  cachedRecentPublicArticles = recent;
  cachedRecentPublicAt = now;
  return recent;
}

export function resetRecentPublicArticlesCache() {
  cachedRecentPublicArticles = null;
  cachedRecentPublicAt = 0;
}

async function generatePublicArticleDraft({
  topic,
  topicLabel,
  seed,
  angle,
  persona,
  attempt = 0,
  writerIndex = 0,
}) {
  const rotated = pickEditorialUnitForArticle(`${topic}:${seed}`, new Date(), writerIndex);
  const unitId = rotated.primary;
  const authorLabel = formatEditorialUnitDisplay(unitId, "cs", true);
  const compactSystem = `Jsi český zdravotnický redaktor MedScopeGlobal v26.3 (sekce ${topicLabel}).
${buildV26StructurePrompt("public", topic === "dlouhovekost" ? "dlouhovekost" : topic)}
${buildPersonaStylePrompt(persona, topic === "dlouhovekost" ? "dlouhovekost" : topic)}
${buildBlocklistPrompt()}
Bez strašení, bez diagnóz. Délka 1000–1300 slov. Vrať JSON: { "title", "excerpt", "bodyHtml", "keywords", "metaDescription" }`;

  const system = `Jsi autonomní český zdravotnický redaktor MedScopeGlobal v26.3 (sekce ${topicLabel}).
${buildV26StructurePrompt("public", topic === "dlouhovekost" ? "dlouhovekost" : topic)}
${buildPersonaStylePrompt(persona, topic === "dlouhovekost" ? "dlouhovekost" : topic)}
${buildForeignMagazineStylePrompt()}
${buildBlocklistPrompt()}
Bez strašení, bez diagnóz — vždy doporuč kontakt s lékařem u nejasných příznaků.
Piš v redakčním stylu ${persona.id}, ne jako generická AI. Vlastní redakční hlas — inspirace BMJ/NYT Well/Harvard Health, ale česky.
Nikdy nepoužívej osobní jméno autora — podpis je redakční jednotka MedScopeGlobal.
Excerpt: 2–3 věty teaser — unikátní pro každý článek, bez opakovaných frází typu „Srozumitelně a bez zbytečného strašení".
Vrať JSON: { "title": string, "excerpt": string (2–3 věty teaser), "bodyHtml": string (HTML s <p>, <h2>, <ul> nebo <h3>, včetně <h2>Zdroje</h2>), "keywords": string[], "metaDescription": string }`;
  const user = buildArticleUserPrompt({ seed, angle, topicLabel, persona, attempt });

  let base = null;
  let lastParsed = null;
  for (let llmAttempt = 0; llmAttempt < MAX_LLM_RETRIES; llmAttempt++) {
    if (llmAttempt > 0) await sleep(3000 * llmAttempt);
    const temperature = (attempt === 0 ? 0.55 : 0.72) + llmAttempt * 0.04;
    const activeSystem = llmAttempt >= 1 ? compactSystem : system;
    const parsed = await generateJsonFromLlm({ system: activeSystem, user, maxTokens: 4096, temperature });
    if (parsed?.bodyHtml && parsed?.title) {
      lastParsed = parsed;
      if (!isBoilerplateContent(parsed.bodyHtml)) {
        base = parsed;
        break;
      }
      appendLog(
        "v25-public-writers.log",
        `LLM boilerplate retry ${topic}/${seed} llm=${llmAttempt + 1} sim=${attempt + 1}`
      );
    } else {
      appendLog(
        "v25-public-writers.log",
        `LLM null retry ${topic}/${seed} llm=${llmAttempt + 1} sim=${attempt + 1}`
      );
    }
  }

  if (!base) {
    if (lastParsed?.bodyHtml) {
      base = lastParsed;
    } else {
      throw new Error(
        `LLM generation failed after ${MAX_LLM_RETRIES} attempts for ${topic}/${seed} — no fallbackArticle`
      );
    }
  }

  const validation = validateV26Structure(base.bodyHtml);
  if (base.bodyHtml && !validation.ok && !validation.isBoilerplate) {
    base = {
      ...base,
      bodyHtml: wrapContentInV26Structure({
        title: base.title,
        excerpt: base.excerpt,
        bodyHtml: base.bodyHtml,
        personaName: authorLabel,
        persona,
        topic,
        topicLabel,
      }),
    };
  } else if (validation.isBoilerplate) {
    base = {
      ...base,
      bodyHtml: wrapContentInV26Structure({
        title: base.title,
        excerpt: base.excerpt,
        bodyHtml: base.bodyHtml,
        personaName: authorLabel,
        persona,
        topic,
        topicLabel,
      }),
    };
  }

  const structure = validateV26Structure(base.bodyHtml);
  if (base.bodyHtml && !structure.hasSources) {
    base.bodyHtml = appendSourcesFallback(base.bodyHtml, topicLabel);
  }

  base.bodyHtml = appendEditorialByline(base.bodyHtml, persona, topicLabel, topic, unitId);
  base.writerPersona = persona.id;
  const editorialAssignment = {
    primary: rotated.primary,
    reviewer: rotated.reviewer,
    aiAssisted: true,
  };
  base.editorialUnit = editorialAssignment.primary;
  base.editorialUnitReviewer = editorialAssignment.reviewer;
  base.writerDisplayName = formatEditorialUnitDisplay(editorialAssignment.primary, "cs", editorialAssignment.aiAssisted);
  base.writerByline = base.writerDisplayName;
  const polished = polishCzechArticle(base);
  return { base: polished, authorLabel, persona, editorialAssignment };
}

export async function generatePublicArticle({
  topic,
  topicLabel,
  seed,
  writerName,
  angle,
  writerIndex = 0,
  recentArticles = null,
  batchArticles = [],
  dbPublicTopic = null,
  contentPillar = null,
}) {
  const recent = recentArticles ?? (await getRecentPublicArticlesForDedup());
  let lastSim = null;
  let lastResult = null;

  for (let attempt = 0; attempt < MAX_SIMILARITY_RETRIES; attempt++) {
    const persona =
      attempt === 0
        ? pickPersonaForArticle(`${topic}:${seed}`, new Date(), writerIndex, topic)
        : pickAlternatePersona(
            `${topic}:${seed}`,
            lastResult?.persona?.id,
            attempt,
            new Date(),
            writerIndex,
            topic
          );

    const { base, authorLabel, editorialAssignment } = await generatePublicArticleDraft({
      topic,
      topicLabel,
      seed,
      angle,
      persona,
      attempt,
      writerIndex,
    });

    lastResult = { base, authorLabel, persona, editorialAssignment };

    const sim = checkPublicArticleSimilarity(
      { title: base.title, excerpt: base.excerpt },
      recent,
      batchArticles
    );
    lastSim = sim;

    if (!sim.duplicate) break;

    appendLog(
      "v25-public-writers.log",
      `similarity reject ${topic}/${seed} attempt ${attempt + 1}: ${sim.reason}`
    );
  }

  const { base, authorLabel, persona, editorialAssignment } = lastResult;
  const dateTag = todayDateTag();
  const storedTopic = dbPublicTopic ?? topic;
  const slug = `verejnost-${storedTopic}-${dateTag}-${slugify(base.title || seed)}`.slice(0, 120);

  return {
    ...base,
    slug,
    topic: storedTopic,
    internalTopic: topic,
    contentPillar: contentPillar ?? (topic === "dlouhovekost" ? "dlouhovekost" : null),
    topicLabel,
    writerName: authorLabel,
    writerPersona: persona.id,
    writerDisplayName: lastResult.base.writerDisplayName,
    writerByline: lastResult.base.writerByline,
    editorialUnit: editorialAssignment?.primary,
    editorialUnitReviewer: editorialAssignment?.reviewer,
    hash: topicHash(`${dateTag}:${base.title ?? seed}:${persona.id}`, storedTopic),
    generatedAt: new Date().toISOString(),
    editorialVersion: "26.3.0",
    similarityCheck: lastSim?.duplicate
      ? { passed: false, reason: lastSim.reason, score: lastSim.score }
      : { passed: true },
  };
}

export function publicDataPath(...parts) {
  return join(DATA_ROOT, "public", ...parts);
}

export function savePublicArticleFile(article) {
  writeJson(`public/articles/${article.topic}/${article.slug}.json`, article);
  return publicDataPath("articles", article.topic, `${article.slug}.json`);
}

export async function persistPublicArticleToDb(article, bodyHtml) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    appendLog("v25-public-writers.log", `skip DB persist (no supabase): ${article.slug}`);
    return { ok: false, reason: "no_supabase" };
  }

  const { data: cat } = await admin.from("categories").select("id").limit(1).maybeSingle();
  if (!cat?.id) return { ok: false, reason: "no_category" };

  let authorId = process.env.INGESTION_AUTHOR_ID ?? null;
  if (!authorId) {
    const { data: userRow } = await admin.from("users").select("id").eq("role", "admin").limit(1).maybeSingle();
    authorId = userRow?.id ?? null;
  }
  if (!authorId) return { ok: false, reason: "no_author" };

  const editorialAssignment = {
    primary: article.editorialUnit ?? assignEditorialUnits({
      locale: "cs",
      audience: "public",
      rubric_slug: "verejnost",
      public_topic: article.topic,
      ai_generated: true,
      metadata: { author_persona: article.writerPersona ?? null },
    }).primary,
    reviewer: article.editorialUnitReviewer ?? null,
    aiAssisted: true,
  };
  const editorialMeta = buildEditorialMetadataPatch(editorialAssignment);

  const row = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: bodyHtml,
    category_id: cat.id,
    author_id: authorId,
    published: true,
    published_at: new Date().toISOString(),
    vip_only: false,
    rubric_slug: "verejnost",
    min_access_level: "public",
    locale: "cs",
    audience: "public",
    public_topic: article.topic,
    source_name: article.writerByline ?? editorialMeta.author_byline,
    meta_description: article.metaDescription ?? article.excerpt?.slice(0, 160),
    ai_generated: true,
    hash_dedup: article.hash,
    metadata: {
      editorial_version: article.editorialVersion ?? "26.3.0",
      writing_style: article.writerPersona ?? null,
      content_pillar: article.contentPillar ?? (article.internalTopic === "dlouhovekost" ? "dlouhovekost" : null),
      internal_topic: article.internalTopic ?? null,
      similarity_check: article.similarityCheck ?? null,
      ...editorialMeta,
    },
  };

  const { data: existing } = await admin.from("articles").select("id").eq("slug", article.slug).maybeSingle();
  if (existing?.id) {
    const { error } = await admin.from("articles").update(row).eq("id", existing.id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true, id: existing.id, updated: true };
  }

  const { data, error } = await admin.from("articles").insert(row).select("id").single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, id: data?.id, updated: false };
}

export function updatePublicIndex(articles) {
  const prev = readJson("public/articles/index.json") ?? { articles: [] };
  const map = new Map((prev.articles ?? []).map((a) => [a.slug, a]));
  for (const a of articles) map.set(a.slug, a);
  const merged = {
    updatedAt: new Date().toISOString(),
    articles: [...map.values()].sort((a, b) => (b.generatedAt ?? "").localeCompare(a.generatedAt ?? "")),
  };
  writeJson("public/articles/index.json", merged);
  return merged;
}

export async function importAdEngine() {
  const mod = await import(pathToFileURL(join(__dir, "..", "ads", "public-ad-engine.mjs")).href);
  return mod;
}
