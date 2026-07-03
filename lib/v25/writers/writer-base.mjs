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

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..", "..");

export const PUBLIC_TOPICS = {
  "zivotni-styl": "Životní styl",
  nemoci: "Nemoci",
  prevence: "Prevence",
  rozhovory: "Rozhovory",
};

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

export async function generateJsonFromLlm({ system, user, maxTokens = 4500, temperature = 0.4 }) {
  loadEnvLocal();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey?.startsWith("gsk_")) {
    const models = [
      process.env.GROQ_MODEL_PRIMARY ?? "llama-3.3-70b-versatile",
      process.env.GROQ_MODEL_FALLBACK ?? "llama-3.1-8b-instant",
    ];
    for (const model of models) {
      try {
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
          signal: AbortSignal.timeout(90000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      } catch {
        /* try next model */
      }
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey?.startsWith("sk-")) {
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
      signal: AbortSignal.timeout(90000),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) return JSON.parse(content);
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
    excerpt: `${seed} — ${angle}. Srozumitelně a bez zbytečného strašení.`,
    bodyHtml,
    keywords: [seed, topicLabel, "zdraví", "prevence"],
    metaDescription: `Praktické informace o ${seed.toLowerCase()} pro veřejnost — srozumitelně a bez strašení.`,
  };
}

const MAX_SIMILARITY_RETRIES = 3;

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
}) {
  const unitId = editorialUnitForPersonaStyle(persona.id, topic);
  const authorLabel = formatEditorialUnitDisplay(unitId, "cs", true);
  const system = `Jsi autonomní český zdravotnický redaktor MedScopeGlobal v26.1 (sekce ${topicLabel}).
${buildV26StructurePrompt("public", topic)}
${buildPersonaStylePrompt(persona, topic)}
${buildForeignMagazineStylePrompt()}
${buildBlocklistPrompt()}
Bez strašení, bez diagnóz — vždy doporuč kontakt s lékařem u nejasných příznaků.
Piš v redakčním stylu ${persona.id}, ne jako generická AI. Vlastní redakční hlas — inspirace Healthline/WebMD, ale česky.
Nikdy nepoužívej osobní jméno autora — podpis je redakční jednotka MedScopeGlobal.
Vrať JSON: { "title": string, "excerpt": string (2–3 věty teaser), "bodyHtml": string (HTML s <p>, <h2>, <ul> nebo <h3>, včetně <h2>Zdroje</h2>), "keywords": string[], "metaDescription": string }`;
  const user = buildArticleUserPrompt({ seed, angle, topicLabel, persona, attempt });

  const temperature = attempt === 0 ? 0.55 : 0.72;
  const parsed = await generateJsonFromLlm({ system, user, maxTokens: 4500, temperature });
  let base = parsed ?? fallbackArticle({ topic, topicLabel, seed, writerName: authorLabel, angle, persona });

  if (base.bodyHtml && isBoilerplateContent(base.bodyHtml)) {
    base = fallbackArticle({ topic, topicLabel, seed, writerName: authorLabel, angle, persona });
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
      bodyHtml: buildPersonaFallbackHtml({ topic, topicLabel, seed, persona, angle }),
    };
  }

  const structure = validateV26Structure(base.bodyHtml);
  if (base.bodyHtml && !structure.hasSources) {
    base.bodyHtml = appendSourcesFallback(base.bodyHtml, topicLabel);
  }

  base.bodyHtml = appendEditorialByline(base.bodyHtml, persona, topicLabel, topic);
  base.writerPersona = persona.id;
  const editorialAssignment = assignEditorialUnits({
    locale: "cs",
    audience: "public",
    rubric_slug: "verejnost",
    public_topic: topic,
    ai_generated: true,
    metadata: { author_persona: persona.id },
  });
  base.editorialUnit = editorialAssignment.primary;
  base.writerDisplayName = formatEditorialUnitDisplay(editorialAssignment.primary, "cs", editorialAssignment.aiAssisted);
  base.writerByline = base.writerDisplayName;
  const polished = polishCzechArticle(base);
  return { base: polished, authorLabel, persona };
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

    const { base, authorLabel } = await generatePublicArticleDraft({
      topic,
      topicLabel,
      seed,
      angle,
      persona,
      attempt,
    });

    lastResult = { base, authorLabel, persona };

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

  const { base, authorLabel, persona } = lastResult;
  const dateTag = todayDateTag();
  const slug = `verejnost-${topic}-${dateTag}-${slugify(base.title || seed)}`.slice(0, 120);

  return {
    ...base,
    slug,
    topic,
    topicLabel,
    writerName: authorLabel,
    writerPersona: persona.id,
    writerDisplayName: lastResult.base.writerDisplayName,
    writerByline: lastResult.base.writerByline,
    hash: topicHash(`${dateTag}:${base.title ?? seed}:${persona.id}`, topic),
    generatedAt: new Date().toISOString(),
    editorialVersion: "26.2.1",
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

  const editorialAssignment = assignEditorialUnits({
    locale: "cs",
    audience: "public",
    rubric_slug: "verejnost",
    public_topic: article.topic,
    ai_generated: true,
    metadata: { author_persona: article.writerPersona ?? null },
  });
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
      editorial_version: article.editorialVersion ?? "26.2.1",
      writing_style: article.writerPersona ?? null,
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
