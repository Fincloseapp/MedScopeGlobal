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

export async function generateJsonFromLlm({ system, user, maxTokens = 2500 }) {
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

export function fallbackArticle({ topic, topicLabel, seed, writerName }) {
  const title = `${seed}: praktické rady pro každodenní zdraví`;
  return {
    title,
    excerpt: `Přehled tématu ${seed.toLowerCase()} pro širokou veřejnost — srozumitelně a bez zbytečného strašení.`,
    bodyHtml: `<p>V oblasti <strong>${seed.toLowerCase()}</strong> platí jednoduché pravidlo: prevence a včasná péče se vyplácí.</p>
<h2>Co byste měli vědět</h2>
<p>Tento článek připravila redakce MedScopeGlobal pro sekci ${topicLabel}. Obsah je určen pro širokou veřejnost a nenahrazuje odbornou konzultaci.</p>
<h2>Praktické kroky</h2>
<ul>
<li>Sledujte příznaky a v případě pochybností kontaktujte praktického lékaře.</li>
<li>Udržujte zdravé návyky — spánek, pohyb a vyvážená strava.</li>
<li>Informace ověřujte u důvěryhodných zdrojů (MZČR, ÚZIS, odborné společnosti).</li>
</ul>
<p><em>Autor: ${writerName} · Sekce: ${topicLabel}</em></p>`,
    keywords: [seed, topicLabel, "zdraví", "prevence"],
    metaDescription: `Praktické informace o ${seed.toLowerCase()} pro veřejnost.`,
  };
}

export async function generatePublicArticle({ topic, topicLabel, seed, writerName, angle }) {
  const system = `Jsi český zdravotnický redaktor pro širokou veřejnost (sekce ${topicLabel}).
Piš srozumitelně, bez strašení, bez diagnóz — doporuč kontakt s lékařem.
Vrať JSON: { "title": string, "excerpt": string, "bodyHtml": string (HTML s <p>, <h2>, <ul>), "keywords": string[], "metaDescription": string }`;
  const user = `Napiš článek na téma: ${seed}. Úhel: ${angle}. Délka 400–600 slov.`;

  const parsed = await generateJsonFromLlm({ system, user });
  const base = parsed ?? fallbackArticle({ topic, topicLabel, seed, writerName });
  const slug = `verejnost-${topic}-${slugify(base.title || seed)}`;
  return {
    ...base,
    slug,
    topic,
    topicLabel,
    writerName,
    hash: topicHash(base.title ?? seed, topic),
    generatedAt: new Date().toISOString(),
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
    source_name: `MedScopeGlobal · ${article.writerName}`,
    meta_description: article.metaDescription ?? article.excerpt?.slice(0, 160),
    ai_generated: true,
    hash_dedup: article.hash,
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
