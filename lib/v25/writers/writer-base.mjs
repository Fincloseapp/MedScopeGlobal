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
  validateV26Structure,
  wrapContentInV26Structure,
} from "../../v26/editorial-prompts.mjs";
import { pickPersonaForArticle } from "../../v26/personas.mjs";

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

export async function generateJsonFromLlm({ system, user, maxTokens = 4500 }) {
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
            temperature: 0.4,
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
        temperature: 0.4,
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

export function fallbackArticle({ topic, topicLabel, seed, writerName, angle = "praktické rady pro každého" }) {
  const title = buildFallbackTitle({ topic, topicLabel, seed, angle });
  return {
    title,
    excerpt: `${seed} — srozumitelný průvodce pro každého, kdo chce pečovat o zdraví bez zbytečného strašení. Praktické tipy, které můžete zkusit hned.`,
    bodyHtml: `<p><strong>${seed}</strong> je téma, které dnes řeší tisíce lidí v Česku. Není třeba být expert — stačí pár jasných kroků a vědomé rozhodování.</p>
<h2>Proč na tom záleží právě teď</h2>
<p>Prevence a včasná péče se vyplácí víc než kdy dřív. Tento článek připravila redakce MedScopeGlobal pro sekci ${topicLabel}. Obsah je určen pro širokou veřejnost a nenahrazuje odbornou konzultaci.</p>
<h2>Co si odnést do praxe</h2>
<ul>
<li>Sledujte příznaky a v případě pochybností kontaktujte praktického lékaře — raději dřív než později.</li>
<li>Udržujte zdravé návyky: pravidelný spánek, denní pohyb a vyvážená strava bez extrémů.</li>
<li>Informace ověřujte u důvěryhodných zdrojů (MZČR, ÚZIS, odborné společnosti).</li>
<li>Neodkládejte preventivní prohlídky — mnoho potíží se dá zachytit včas.</li>
</ul>
<h2>Kdy vyhledat odbornou pomoc</h2>
<p>Při přetrvávajících nebo zhoršujících se potížích, náhlé bolesti na hrudi, dušnosti nebo silné úzkosti neváhejte kontaktovat lékaře nebo linku 155.</p>
<p><em>Autor: ${writerName} · Sekce: ${topicLabel} · MedScopeGlobal</em></p>`,
    keywords: [seed, topicLabel, "zdraví", "prevence"],
    metaDescription: `Praktické informace o ${seed.toLowerCase()} pro veřejnost — srozumitelně a bez strašení.`,
  };
}

export async function generatePublicArticle({ topic, topicLabel, seed, writerName, angle }) {
  const persona = pickPersonaForArticle(`${topic}:${seed}`);
  const authorLabel = `${persona.displayName} · ${topicLabel}`;
  const system = `Jsi český zdravotnický redaktor MedScopeGlobal v26 (sekce ${topicLabel}).
${buildV26StructurePrompt("public")}
${buildPersonaStylePrompt(persona)}
${buildBlocklistPrompt()}
Bez strašení, bez diagnóz — vždy doporuč kontakt s lékařem u nejasných příznaků.
Vrať JSON: { "title": string, "excerpt": string (2–3 věty teaser), "bodyHtml": string (HTML s <p>, <h2>, <ul>), "keywords": string[], "metaDescription": string }`;
  const user = `Napiš článek na aktuální téma: ${seed}. Úhel: ${angle}. Délka 900–1200 slov v češtině. Titulek má být lákavý a srozumitelný.`;

  const parsed = await generateJsonFromLlm({ system, user, maxTokens: 4500 });
  let base = parsed ?? fallbackArticle({ topic, topicLabel, seed, writerName: authorLabel, angle });
  if (base.bodyHtml && !validateV26Structure(base.bodyHtml).ok) {
    base = {
      ...base,
      bodyHtml: wrapContentInV26Structure({
        title: base.title,
        excerpt: base.excerpt,
        bodyHtml: base.bodyHtml,
        personaName: persona.displayName,
      }),
    };
  }
  base.writerPersona = persona.id;
  base.writerDisplayName = persona.displayName;
  const dateTag = todayDateTag();
  const slug = `verejnost-${topic}-${dateTag}-${slugify(base.title || seed)}`.slice(0, 120);
  return {
    ...base,
    slug,
    topic,
    topicLabel,
    writerName: authorLabel,
    writerPersona: persona.id,
    writerDisplayName: persona.displayName,
    hash: topicHash(`${dateTag}:${base.title ?? seed}`, topic),
    generatedAt: new Date().toISOString(),
    editorialVersion: "26",
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
    source_name: `MedScopeGlobal · ${article.writerDisplayName ?? article.writerName}`,
    meta_description: article.metaDescription ?? article.excerpt?.slice(0, 160),
    ai_generated: true,
    hash_dedup: article.hash,
    metadata: {
      editorial_version: article.editorialVersion ?? "26",
      author_persona: article.writerPersona ?? null,
      author_display_name: article.writerDisplayName ?? article.writerName,
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
