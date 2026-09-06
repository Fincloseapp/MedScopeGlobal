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
  buildSeniorSpecialistPrompt,
  buildSoftUtilityPrompt,
} from "../../v26/editorial-prompts.mjs";
import { reviewPublicArticle, buildMultiEditorGatePrompt } from "./editorial-review.mjs";
import { buildNativeLocalePrompt } from "./native-locale-brief.mjs";
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
import {
  PUBLIC_ARTICLE_MIN_WORDS,
  PUBLIC_ARTICLE_TARGET_WORDS,
  PUBLIC_ARTICLE_MAX_TOKENS,
  PUBLIC_ARTICLE_SOFT_MIN_WORDS,
  PUBLIC_ARTICLE_LENGTH_RANGE,
} from "../../ecosystem/editorial/article-length.mjs";

export { PUBLIC_ARTICLE_MIN_WORDS, PUBLIC_ARTICLE_TARGET_WORDS };

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
export function getEnrichedWriterSeeds(seeds, topic, writerIndex = 0, date = new Date(), extras = {}) {
  return enrichSeedsWithCalendar(seeds, {
    topic,
    writerIndex,
    date,
    includeLongevity:
      extras.includeLongevity ??
      (topic === "dlouhovekost" || topic === "zivotni-styl" || topic === "prevence"),
    includeTrends: extras.includeTrends === true,
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

export function normalizeWriterSeed(seed) {
  return String(seed ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function seedText(item) {
  return typeof item === "string" ? item : String(item?.seed ?? "");
}

export function seedMatchesSlug(seed, slug) {
  const s = slugify(seed);
  const hay = String(slug || "");
  if (!s || !hay) return false;
  if (s.length >= 16 && hay.includes(s.slice(0, 16))) return true;
  const parts = s.split("-").filter((p) => p.length > 6);
  return parts.some((p) => hay.includes(p.slice(0, 10)));
}

/** Seeds already used today for this locale — from metadata, slug, or title. */
export function collectUsedWriterSeeds(recent = [], { locale, date = new Date(), seeds = [] } = {}) {
  const day = todayDateTag(date);
  const used = new Set();
  const loc = locale ? String(locale).toLowerCase() : null;
  for (const a of recent) {
    if (loc && a.locale && String(a.locale).toLowerCase() !== loc) continue;
    const at = String(a.published_at || "").slice(0, 10);
    if (at && at !== day) continue;
    const metaSeed = a.metadata?.writer_seed ?? a.writer_seed ?? a.seed;
    if (metaSeed) used.add(normalizeWriterSeed(metaSeed));
    for (const item of seeds) {
      const raw = seedText(item);
      if (raw && seedMatchesSlug(raw, a.slug)) used.add(normalizeWriterSeed(raw));
    }
  }
  return used;
}

const GENERIC_WELLNESS_TITLE_RE =
  /jak zlepšit zdraví|praktické rady pro každého|průvodce zdravím|co byste měli vědět|how to improve your health without stress/i;

export function lockTitleToSeed(title, seed) {
  const t = String(title || "").trim();
  if (!t || GENERIC_WELLNESS_TITLE_RE.test(t)) return String(seed || t).trim();
  return t;
}

/** Pick `limit` unused seeds starting at a day-rotated index (unique per writer). */
export function pickRotatedSeeds(seeds, limit, writerIndex = 0, date = new Date(), extras = {}) {
  const n = seeds.length;
  if (n === 0 || limit <= 0) return [];
  const used = extras.usedSeeds instanceof Set
    ? extras.usedSeeds
    : new Set(
        [...(extras.usedSeeds ?? [])].map((item) => normalizeWriterSeed(seedText(item))),
      );
  const start = (daySeedOffset(date) + writerIndex) % n;
  const picked = [];
  for (let i = 0; i < n && picked.length < limit; i++) {
    const item = seeds[(start + i) % n];
    const key = normalizeWriterSeed(seedText(item));
    if (key && used.has(key)) continue;
    picked.push(item);
    if (key) used.add(key);
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
  const locale =
    String(system ?? "").match(/locale\s+([a-z]{2}(?:-[A-Za-z]{2})?)/i)?.[1] ?? "cs";
  const seed =
    text.match(/téma:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    text.match(/téma:\s*(.+)/i)?.[1]?.trim() ??
    text.match(/topic:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    "zdraví";
  const angle =
    text.match(/úhel pohledu:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    text.match(/angle:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    "praktické rady pro každého";
  const section =
    text.match(/sekce redakce:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    text.match(/Sekce redakce:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    text.match(/section:\s*(.+?)(?:\.|\n|$)/i)?.[1]?.trim() ??
    "Veřejnost";

  if (locale !== "cs") {
    return {
      system: `You are a senior MedScopeGlobal magazine editor (section ${section}, locale ${locale}).
${buildNativeLocalePrompt(locale)}
No scare tactics, no diagnoses. Length ${PUBLIC_ARTICLE_LENGTH_RANGE} words — professional magazine with local examples for this edition (slim health, longevity, lifestyle, evidence-based biohacking).
Structure: hook → body (2–3 sections) → practical tips → summary → Sources.
Return JSON: { "title", "excerpt", "bodyHtml", "keywords", "metaDescription" }.
bodyHtml: HTML with <p>, 5–6× <h2>, <ul> or <h3>, including a Sources heading in this language.`,
      user: `Topic: ${seed}. Angle: ${angle}. Section: ${section}. Write a longer native article (${PUBLIC_ARTICLE_LENGTH_RANGE} words) for this edition — not a Czech translation.`,
    };
  }

  return {
    system: `Jsi český zdravotnický redaktor MedScopeGlobal v26.3 (sekce ${section}).
Piš česky, bez strašení, bez diagnóz. Délka ${PUBLIC_ARTICLE_LENGTH_RANGE} slov — profesionální magazínový text s konkrétními českými příklady.
Struktura: úvod (hook) → tělo (2–3 sekce kontextu) → praktické tipy (checklist/týdenní plán) → shrnutí → Zdroje.
Vrať JSON: { "title", "excerpt", "bodyHtml", "keywords", "metaDescription" }.
bodyHtml: HTML s <p>, 5–6× <h2>, <ul> nebo <h3>, včetně <h2>Zdroje</h2>.`,
    user: `Téma: ${seed}. Úhel: ${angle}. Sekce: ${section}. Napiš delší článek (${PUBLIC_ARTICLE_LENGTH_RANGE} slov): scéna v úvodu, bohaté tělo, praktické tipy, shrnutí, týdenní plán.`,
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
      for (let retryAttempt = 0; retryAttempt < 3; retryAttempt++) {
        await sleep(4000 * (retryAttempt + 1));
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
            appendLog("v25-public-writers.log", `provider gemini OK (retry ${retryAttempt + 1})`);
            return parsed;
          }
        }
        appendLog("v25-public-writers.log", `gemini retry HTTP ${retry.status}`);
        if (retry.status !== 429 && retry.status !== 503) break;
      }
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

/** Public articles should read as full magazine pieces (800–1500 words). */
const softMinWords = (minWords) => Math.min(minWords, PUBLIC_ARTICLE_SOFT_MIN_WORDS);

function depthLocalePack(locale) {
  const loc = String(locale || "cs");
  if (loc === "cs") return "cs";
  if (loc === "sk") return "sk";
  return "en";
}

function alreadyHasDepthPlan(html) {
  return /Týdenní plán v české praxi|Týždenný plán v slovenskej praxi|A weekly plan that fits real life/i.test(
    html
  );
}

/** Deterministic magazine depth when LLM expansion is rate-limited. Czech pad stays on /cs only. */
export function appendMagazineDepthSections(
  bodyHtml,
  { title = "", topicLabel = "Veřejnost", locale = "cs" } = {}
) {
  const pack = depthLocalePack(locale);
  const topic = String(title || topicLabel).trim() || (pack === "en" ? "this topic" : "téma");
  let html = String(bodyHtml ?? "");

  const insertBeforeSources = (current, extra) => {
    const sourcesIdx = current.search(/<h2[^>]*>\s*(Zdroje|Sources|Zdroje)\s*<\/h2>/i);
    if (sourcesIdx >= 0) {
      return `${current.slice(0, sourcesIdx).trim()}\n${extra}\n${current.slice(sourcesIdx)}`;
    }
    return `${current.trim()}\n${extra}`;
  };

  const PLAN = {
    cs: `
<h2>Týdenní plán v české praxi</h2>
<p>Nečekejte na „dokonalý pondělní restart“. U tématu <strong>${topic}</strong> funguje spíš malá, opakovatelná rutina. Pondělí a úterý si zvolte jednu konkrétní změnu (čas, porce, pohyb nebo spánkové okno). Ve středu a ve čtvrtek stejnou změnu jen udržte — bez přidávání dalších cílů. Pátek si nechte na krátké zhodnocení: co šlo samo, co drhlo a co lze zjednodušit o víkendu.</p>
<p>Víkend není trest. Pokud máte rodinu, směny nebo dojíždění, plánujte realisticky: kratší bloky (10–20 minut), nákup dopředu a jedno jídlo nebo návyk, které zvládnete i unavení. Důležité je, aby se změna vešla do běžného týdne v Česku — ne do ideálního scénáře z magazínu.</p>
<ul>
<li>Jedna změna týdně je lepší než pět odložených předsevzetí.</li>
<li>Pište si jen to, co opravdu uděláte — ne ideál.</li>
<li>Když týden selže, vraťte se k nejmenší verzi návyku, ne k nule.</li>
</ul>
<h2>Časté mýty a realistické odpovědi</h2>
<p><strong>Mýtus:</strong> „Buď to dělám naprosto správně, nebo to nemá cenu.“ <strong>Realita:</strong> u většiny životního stylu a prevence rozhoduje konzistence. I 70% dodržení plánu je často užitečnější než krátký perfektní sprint a pak návrat ke starým návykům.</p>
<p><strong>Mýtus:</strong> „Když to nejde hned vidět, nic se neděje.“ <strong>Realita:</strong> spánek, stres, pohyb i strava se projevují postupně. Sledujte spíš energii, chuť k jídlu, soustředění a spánkovou kvalitu než jediné číslo na váze nebo v aplikaci.</p>
<p><strong>Mýtus:</strong> „Musím koupit speciální produkty a doplňky.“ <strong>Realita:</strong> základ je obvykle běžná česká kuchyně, pravidelný režim a pohyb, který vydržíte. Doplňky dávají smysl jen tam, kde je doporučí lékař nebo kde máte jasně zjištěný deficit.</p>
<h2>Kdy má smysl řešit to s lékařem</h2>
<p>Texty pro veřejnost nenahrazují vyšetření. K lékaři jděte dřív, pokud se objeví nové nebo zhoršující se příznaky, bolest na hrudi, dušnost, opakované mdloby, náhlé otoky, nevysvětlitelný úbytek váhy, dlouhodobá únava, nebo pokud už máte chronické onemocnění a chystáte větší změnu režimu či stravy.</p>
<p>Praktický tip do ordinace: napište si 5–7 dní poznámky (spánek, pohyb, jídlo, stres, léky) a dvě konkrétní otázky. Lékař pak snáz pozná, co je běžná variabilita a co stojí za kontrolu. V akutních stavech volejte 155 — nečekejte na článek ani na chat.</p>
<h2>Jak téma uchopit bez zbytečného tlaku</h2>
<p>U <strong>${topic}</strong> je užitečný přístup „nejmenší udržitelné zlepšení“. Nejdřív odstraňte největší brzdu (pozdní usínání, přesolené jídlo, nulový pohyb, chronický stres z práce), teprve potom laděte detaily. Sdílejte plán s partnerem nebo kolegou — sociální opora často vydrží déle než motivace z pondělního rána.</p>
<p>MedScopeGlobal píše pro laickou veřejnost: srozumitelně, bez strašení a bez diagnóz přes obrazovku. Berte tento článek jako mapu pro každodenní rozhodování — a rozhodnutí o léčbě nechte na zdravotnících, kteří znají váš kontext.</p>`,
    sk: `
<h2>Týždenný plán v slovenskej praxi</h2>
<p>Nečakajte na dokonalý pondelňajší reštart. Pri téme <strong>${topic}</strong> funguje skôr malá, opakovaná rutina. V pondelok a utorok si vyberte jednu konkrétnu zmenu. V stredu a štvrtok ju len udržte. Piatok nechajte na krátke zhodnotenie.</p>
<p>Víkend nie je trest. Ak máte rodinu, zmeny alebo dochádzanie, plánujte realisticky: kratšie bloky (10–20 minút) a jeden návyk, ktorý zvládnete aj unavení. Zmena sa musí vojsť do bežného týždňa na Slovensku.</p>
<ul>
<li>Jedna zmena týždenne je lepšia než päť odložených predsavzatí.</li>
<li>Píšte si len to, čo naozaj urobíte.</li>
<li>Keď týždeň zlyhá, vráťte sa k najmenšej verzii návyku, nie k nule.</li>
</ul>
<h2>Časté mýty a realistické odpovede</h2>
<p><strong>Mýtus:</strong> „Buď to robím úplne správne, alebo to nemá cenu.“ <strong>Realita:</strong> pri životnom štýle rozhoduje konzistencia, nie perfektný šprint.</p>
<p><strong>Mýtus:</strong> „Keď to hneď nevidno, nič sa nedeje.“ <strong>Realita:</strong> spánok, stres, pohyb aj strava sa prejavujú postupne.</p>
<p><strong>Mýtus:</strong> „Musím kúpiť špeciálne doplnky.“ <strong>Realita:</strong> základ je bežná kuchyňa, režim a pohyb, ktorý vydržíte. Doplnky len tam, kde ich odporučí lekár.</p>
<h2>Kedy to riešiť s lekárom</h2>
<p>Texty pre verejnosť nenahrádzajú vyšetrenie. K lekárovi choďte skôr pri nových alebo zhoršujúcich sa príznakoch, bolesti na hrudi, dýchavičnosti, mdlobách, nevysvetliteľnom úbytku hmotnosti alebo ak plánujete väčšiu zmenu režimu pri chronickom ochorení.</p>
<p>Do ambulancie si prineste 5–7 dní poznámok a dve konkrétne otázky. V akútnych stavoch volajte 155 alebo 112.</p>
<h2>Ako tému uchopiť bez zbytočného tlaku</h2>
<p>Pri <strong>${topic}</strong> pomáha najmenšie udržateľné zlepšenie. Najprv odstráňte najväčšiu brzdu, až potom ladíte detaily. Rozhodnutie o liečbe nechajte na zdravotníkoch, ktorí poznajú váš kontext.</p>`,
    en: `
<h2>A weekly plan that fits real life</h2>
<p>Do not wait for a perfect Monday reset. On <strong>${topic}</strong>, a small repeatable routine beats a long list of resolutions. Pick one change for Monday and Tuesday. Keep the same change on Wednesday and Thursday. Use Friday to review what was easy and what to simplify.</p>
<p>The weekend is not a punishment. If you have family, shifts or a commute, plan shorter blocks (10–20 minutes) and one habit you can still do when tired.</p>
<ul>
<li>One change a week is better than five postponed resolutions.</li>
<li>Write down only what you will actually do.</li>
<li>If the week fails, return to the smallest version of the habit — not to zero.</li>
</ul>
<h2>Common myths and realistic answers</h2>
<p><strong>Myth:</strong> “I must do it perfectly or it is pointless.” <strong>Reality:</strong> consistency beats a short perfect sprint.</p>
<p><strong>Myth:</strong> “If I cannot see a result immediately, nothing is happening.” <strong>Reality:</strong> sleep, stress, movement and food change gradually.</p>
<p><strong>Myth:</strong> “I need special products.” <strong>Reality:</strong> the base is ordinary food, a regular routine and movement you can keep. Supplements only if a clinician recommends them or a deficit is confirmed.</p>
<h2>When to speak with a clinician</h2>
<p>Public articles are not an examination. See a clinician sooner for new or worsening symptoms, chest pain, breathlessness, fainting, sudden swelling, unexplained weight loss, lasting fatigue, or if you have a long-term condition and plan a large change in diet or routine.</p>
<p>Bring 5–7 days of notes and two concrete questions. In an emergency use the local emergency number — do not wait for an article or a chat.</p>
<h2>How to hold the topic without extra pressure</h2>
<p>For <strong>${topic}</strong>, start with the smallest sustainable improvement. Remove the biggest obstacle first. Treatment decisions stay with clinicians who know your context.</p>`,
  };

  if (!alreadyHasDepthPlan(html)) {
    html = insertBeforeSources(html, PLAN[pack]);
  }

  const extraMarker =
    pack === "cs"
      ? /Mini-příručka na nákup a přípravu/i
      : pack === "sk"
        ? /Mini-príručka na nákup a prípravu/i
        : /A short shopping and prep note/i;

  if (countPublicArticleWords(html) < PUBLIC_ARTICLE_MIN_WORDS && !extraMarker.test(html)) {
    const EXTRA = {
      cs: `
<h2>Mini-příručka na nákup a přípravu</h2>
<p>Než začnete měnit všechno najednou, připravte si „základní sadu“ pro téma <strong>${topic}</strong>. Do nákupního seznamu dejte věci, které vydrží několik dní a nevyžadují složitou přípravu: zeleninu sezóny, luštěniny, celozrnné přílohy, kvalitní tuk (olivový olej, ořechy), bílkovinu podle vaší kuchyně a bylinky místo další soli.</p>
<p>Večeři nebo svačinu si rozmyslete večer předem — ne v momentě, kdy jste unavení a saháte po nejrychlejším řešení. Pokud vaříte pro rodinu, držte jedno jídlo a upravujte jen přílohy: někdo dostane víc zeleniny, někdo víc přílohy, někdo menší porci. Nemusíte vařit dvě úplně jiná jídla.</p>
<ul>
<li>Nákup: 70 % základ, 20 % sezónní novinky, 10 % „radost“ bez výčitek.</li>
<li>Příprava: 15 minut večer ušetří 30 minut stresu druhý den.</li>
<li>Rezerva: jedno hotové jídlo v lednici nebo mrazáku na krizové dny.</li>
</ul>
<h2>Co sledovat 14 dní — bez posedlosti čísly</h2>
<p>Vyberte si tři ukazatele, které dávají smysl právě vám: kvalita spánku, energie odpoledne, chuť k jídlu, počet kroků, klidnější večery, nebo méně „záchranných“ sladkých svačin. Zapisujte jen ano/ne nebo krátkou poznámku — ne excelovou tabulku na celý život.</p>
<p>Po dvou týdnech se zeptejte: co bylo nejjednodušší udržet? Co se sypalo vždy ve stejný čas (po práci, po večeři, o víkendu)? Právě tam patří další drobná úprava. Pokud se celkově cítíte hůř, máte bolesti, závratě nebo jiné varovné příznaky, plán přerušte a konzultujte lékaře — články nejsou diagnóza.</p>
<h2>Proč to v Česku často drhne</h2>
<p>Nejsme Středomoří s celoroční zeleninou na trhu a dlouhou siestou. Máme zimu, směny, školku, dojíždění a rychlé obědy. Proto u <strong>${topic}</strong> vyhrává adaptace: mražená zelenina, konzervované luštěniny, jednoduché pečené porce a pohyb, který nevyžaduje posilovnu. Cíl není kopírovat Instagram, ale převést principy do českého týdne tak, aby vydržely i v listopadu.</p>`,
      sk: `
<h2>Mini-príručka na nákup a prípravu</h2>
<p>Než zmeníte všetko naraz, pripravte si základnú sadu pre <strong>${topic}</strong>: sezónnu zeleninu, strukoviny, celozrnné prílohy, kvalitný tuk a bielkovinu podľa vašej kuchyne.</p>
<p>Večeru alebo olovrant si rozmyslite večer vopred — nie v momente únavy. Pre rodinu držte jedno jedlo a upravujte len prílohy.</p>
<ul>
<li>Nákup: 70 % základ, 20 % sezóna, 10 % radosť bez výčitiek.</li>
<li>Príprava: 15 minút večer ušetrí 30 minút stresu na druhý deň.</li>
<li>Rezerva: jedno hotové jedlo v chladničke alebo mrazničke.</li>
</ul>
<h2>Čo sledovať 14 dní — bez posadnutosti číslami</h2>
<p>Vyberte si tri ukazovatele, ktoré dávajú zmysel vám: spánok, popoludňajšia energia, chuť do jedla, počet krokov. Zapisujte áno/nie, nie excel na celý život.</p>
<p>Ak sa cítite horšie, máte bolesti alebo závraty, plán prerušte a konzultujte lekára — články nie sú diagnóza.</p>
<h2>Prečo to na Slovensku často viazne</h2>
<p>Máme zimu, zmeny, školu a rýchle obedy. Pri <strong>${topic}</strong> vyhráva adaptácia: mrazená zelenina, konzervované strukoviny a pohyb, ktorý nevyžaduje posilňovňu.</p>`,
      en: `
<h2>A short shopping and prep note</h2>
<p>Before changing everything at once, prepare a basic set for <strong>${topic}</strong>: seasonal vegetables, legumes, wholegrain sides, a quality fat and a protein that fits your kitchen.</p>
<p>Decide dinner or a snack the evening before — not when you are tired. For a household, keep one meal and adjust the sides.</p>
<ul>
<li>Shopping: 70% staples, 20% seasonal, 10% joy without guilt.</li>
<li>Prep: 15 minutes in the evening often saves 30 minutes of stress the next day.</li>
<li>Backup: one ready meal in the fridge or freezer.</li>
</ul>
<h2>What to watch for 14 days — without obsessing over numbers</h2>
<p>Pick three signals that matter to you: sleep quality, afternoon energy, appetite, steps, calmer evenings. Mark yes/no — not a lifetime spreadsheet.</p>
<p>If you feel worse, have pain or dizziness, pause the plan and speak with a clinician. Articles are not a diagnosis.</p>
<h2>Why plans stall in ordinary weeks</h2>
<p>Winter, shifts, school runs and quick lunches are normal. For <strong>${topic}</strong>, adaptation wins: frozen vegetables, tinned legumes and movement that does not require a gym.</p>`,
    };
    html = insertBeforeSources(html, EXTRA[pack]);
  }

  return html;
}

/** Expansion pass when draft is below minWords — keeps HTML structure, targets magazine length. */
export async function expandPublicArticleIfShort(
  article,
  {
    minWords = PUBLIC_ARTICLE_MIN_WORDS,
    targetWords = PUBLIC_ARTICLE_TARGET_WORDS,
    topicLabel = "Veřejnost",
    maxAttempts = 2,
    locale = "cs",
  } = {}
) {
  const priorWords = countPublicArticleWords(article.bodyHtml);
  if (priorWords >= minWords) {
    return { ...article, expanded: false, wordCount: priorWords, priorWordCount: priorWords };
  }

  const system =
    locale !== "cs"
      ? `You are a senior MedScopeGlobal editor (section ${topicLabel}, locale ${locale}).
${buildNativeLocalePrompt(locale)}
Expand the existing article to at least ${targetWords} words — never shorten below ${minWords} (range ${PUBLIC_ARTICLE_LENGTH_RANGE}).
Keep HTML structure. Add local examples for this edition (slim health, longevity, lifestyle, evidence-based biohacking). No Czech-only institutions.
No scare tactics, no diagnoses.
Return JSON: { "title", "excerpt", "bodyHtml", "keywords", "metaDescription" }`
      : `Jsi český zdravotnický redaktor MedScopeGlobal v26.3 (sekce ${topicLabel}).
Rozšiř existující článek na minimálně ${targetWords} slov — NIKDY nezkracuj pod ${minWords} slov (cílové pásmo ${PUBLIC_ARTICLE_LENGTH_RANGE}).
Cíl: delší, zajímavý magazínový text — ne suchý přehled ani krátký fluff.
Zachovej strukturu HTML (<p>, <h2>, <h3>, <ul>, včetně <h2>Zdroje</h2>).
Povinné sekce: úvod → tělo → praktické tipy → shrnutí → Zdroje.
Přidej: konkrétní české příklady (nákup, rodina, směny), mini-recepty nebo jídelníček, mýty vs. realita, kdy k lékaři.
Piš jen latinkou s českou diakritikou — žádné čínské/jiné cizí znaky v textu.
Bez strašení, bez diagnóz.
Vrať JSON: { "title", "excerpt", "bodyHtml", "keywords", "metaDescription" }`;

  let best = { ...article, wordCount: priorWords, priorWordCount: priorWords };

  const applyDeterministicDepth = () => {
    const withDepth = appendMagazineDepthSections(best.bodyHtml ?? article.bodyHtml, {
      title: best.title ?? article.title,
      topicLabel,
      locale,
    });
    const depthWords = countPublicArticleWords(withDepth);
    if (depthWords > best.wordCount) {
      appendLog(
        "v25-public-writers.log",
        `deterministic depth ${best.wordCount}→${depthWords} for "${String(article.title ?? "").slice(0, 60)}"`
      );
      best = {
        ...best,
        bodyHtml: withDepth,
        expanded: true,
        wordCount: depthWords,
        priorWordCount: priorWords,
        deterministicDepth: true,
      };
    }
  };

  // When already mid-length, prefer reliable depth sections over slow rate-limited LLM loops.
  if (priorWords >= 500 && priorWords < minWords) {
    applyDeterministicDepth();
    if (best.wordCount >= minWords) {
      return {
        ...best,
        expanded: best.wordCount > priorWords,
        expandFailed: best.wordCount < minWords,
        priorWordCount: priorWords,
      };
    }
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await sleep(4000 * attempt);

    const user =
      locale !== "cs"
        ? `Expand this article to ${targetWords}+ words (currently ${best.wordCount}). Keep the topic and editorial tone.
Write only in the edition language. Never add Czech headings, Czech-only institutions, or the section “Týdenní plán v české praxi”.
Add 2–3 practical sections and local examples — longer and more useful, not repetition.

Title: ${article.title ?? ""}
Dek: ${article.excerpt ?? ""}

Current HTML:
${best.bodyHtml ?? article.bodyHtml ?? ""}`
        : `Rozšiř tento článek na ${targetWords}+ slov (aktuálně ${best.wordCount}). Zachovej téma a redakční tón.
Původní titulek neměň — vrať přesně: ${article.title ?? ""}
Nevymýšlej statistiky, procenta ani názvy programů (žádné Mammo-Czech).
Přidej 2–3 praktické sekce (např. nákupní seznam, týdenní plán, časté chyby) a živé příklady — text musí být delší a zajímavější, ne jen opakování.

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
      maxTokens: PUBLIC_ARTICLE_MAX_TOKENS,
      temperature: 0.42 + attempt * 0.06,
    });
    if (!parsed?.bodyHtml) {
      applyDeterministicDepth();
      if (best.wordCount >= softMinWords(minWords)) break;
      continue;
    }

    const wordCount = countPublicArticleWords(parsed.bodyHtml);
    if (wordCount <= best.wordCount) {
      appendLog("v25-public-writers.log", `expansion rejected shorter output ${wordCount} <= ${best.wordCount}`);
      applyDeterministicDepth();
      if (best.wordCount >= softMinWords(minWords)) break;
      continue;
    }

    const polishedInput = {
      ...article,
      title: article.title,
      excerpt: parsed.excerpt ?? article.excerpt,
      bodyHtml: parsed.bodyHtml,
      keywords: parsed.keywords ?? article.keywords,
      metaDescription: parsed.metaDescription ?? article.metaDescription,
    };
    const polished = locale === "cs" ? polishCzechArticle(polishedInput) : polishedInput;

    best = {
      ...article,
      ...polished,
      title: article.title,
      expanded: true,
      wordCount,
      priorWordCount: priorWords,
    };
    if (wordCount >= minWords) break;
    applyDeterministicDepth();
    if (best.wordCount >= minWords) break;
  }

  if (best.wordCount < minWords) {
    applyDeterministicDepth();
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
  // Groq/small models stay at 4k; OpenAI/Gemini can use higher for long public articles.
  const cappedTokens = Math.min(maxTokens, 8192);
  const groqKey = process.env.GROQ_API_KEY?.trim();

  // Long magazine expansions: Gemini/OpenAI first; Groq last (often ~600–800 words but better than nothing).
  const preferLongContext = cappedTokens > 4096;

  async function tryGroqChain({ asLastResort = false } = {}) {
    if (!groqKey?.startsWith("gsk_")) return null;
    if (asLastResort) {
      appendLog("v25-public-writers.log", "preferLongContext — groq last-resort after Gemini/OpenAI");
    }
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
            maxTokens: Math.min(cappedTokens, 4096),
            temperature,
          });
          if (parsed) {
            appendLog(
              "v25-public-writers.log",
              `provider groq model=${model} compact=${compact}${asLastResort ? " lastResort" : ""}`
            );
            return parsed;
          }
          appendLog(
            "v25-public-writers.log",
            `groq ${model} HTTP ${status}${compact ? " (compact)" : ""}`
          );
          if (status === 429) {
            await sleep(asLastResort ? 8000 : 2500);
            break;
          }
          if (status === 413 && !compact) continue;
        } catch (e) {
          appendLog("v25-public-writers.log", `groq ${model} error: ${e.message}`);
        }
      }
    }
    appendLog("v25-public-writers.log", "groq chain exhausted — trying secondary providers");
    return null;
  }

  if (!preferLongContext) {
    const groqHit = await tryGroqChain();
    if (groqHit) return groqHit;
  } else {
    appendLog("v25-public-writers.log", "preferLongContext — Gemini/OpenAI first, Groq last");
  }

  const secondaryProviders = preferLongContext
    ? [
        ["gemini", () => geminiJsonCall({ system, user, maxTokens: cappedTokens, temperature })],
        ["openai", () => openaiJsonCall({ system, user, maxTokens: cappedTokens, temperature })],
      ]
    : [
        ["openai", () => openaiJsonCall({ system, user, maxTokens: cappedTokens, temperature })],
        ["gemini", () => geminiJsonCall({ system, user, maxTokens: cappedTokens, temperature })],
      ];

  for (const [provider, call] of secondaryProviders) {
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

  if (preferLongContext) {
    const groqHit = await tryGroqChain({ asLastResort: true });
    if (groqHit) return groqHit;
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
  specialty = "practice",
  locale = "cs",
}) {
  const rotated = pickEditorialUnitForArticle(`${topic}:${seed}`, new Date(), writerIndex);
  const unitId = rotated.primary;
  const authorLabel = formatEditorialUnitDisplay(unitId, "cs", true);
  const compactSystem = `Jsi seniorní zdravotnický redaktor MedScopeGlobal v26.3 (sekce ${topicLabel}, locale ${locale}).
${buildNativeLocalePrompt(locale)}
${buildV26StructurePrompt("public", topic === "dlouhovekost" ? "dlouhovekost" : topic, locale)}
${buildSeniorSpecialistPrompt(specialty)}
${buildPersonaStylePrompt(persona, topic === "dlouhovekost" ? "dlouhovekost" : topic)}
${buildBlocklistPrompt()}
${buildSoftUtilityPrompt()}
Bez strašení, bez diagnóz. Délka ${PUBLIC_ARTICLE_LENGTH_RANGE} slov — profesionální magazín, ne krátký fluff. Vrať JSON: { "title", "excerpt", "bodyHtml", "keywords", "metaDescription" }`;

  const czechVoice =
    locale === "cs"
      ? `Piš v redakčním stylu ${persona.id}, ne jako generická AI. Vlastní redakční hlas — inspirace BMJ/NYT Well/Harvard Health, ale česky.
Délka ${PUBLIC_ARTICLE_LENGTH_RANGE} slov (cíl ~${PUBLIC_ARTICLE_TARGET_WORDS}). Článek musí být zajímavý ke čtení: scéna nebo otázka v úvodu, bohaté tělo, konkrétní české příklady, praktické tipy, shrnutí — ne suchý výčet ani krátký fluff.
Jen latinka s českou diakritikou — žádné čínské/japonské/korejské znaky.`
      : `Write in the editorial voice of ${persona.id}, not generic AI. Native to locale ${locale} — BMJ / NYT Well / Harvard Health calibre, never Czech.
Length ${PUBLIC_ARTICLE_LENGTH_RANGE} words (target ~${PUBLIC_ARTICLE_TARGET_WORDS}). Local examples for this country: slim/metabolic health, longevity, healthy lifestyle, evidence-based biohacking.
Do not give Czech-only advice (VZP, SÚKL-as-local-care, přijímačky). Foreign MedScopeGlobal desks may be cited by name.`;

  const system = `Jsi autonomní seniorní zdravotnický redaktor MedScopeGlobal v26.3 (sekce ${topicLabel}, locale ${locale}).
${buildNativeLocalePrompt(locale)}
${buildV26StructurePrompt("public", topic === "dlouhovekost" ? "dlouhovekost" : topic, locale)}
${buildSeniorSpecialistPrompt(specialty)}
${buildPersonaStylePrompt(persona, topic === "dlouhovekost" ? "dlouhovekost" : topic)}
${buildForeignMagazineStylePrompt(locale)}
${buildSoftUtilityPrompt()}
${buildMultiEditorGatePrompt()}
${buildBlocklistPrompt()}
Bez strašení, bez diagnóz — vždy doporuč kontakt s lékařem u nejasných příznaků.
${czechVoice}
Nikdy nepoužívej osobní jméno autora — podpis je redakční jednotka MedScopeGlobal.
Struktura povinně: úvod → tělo (2–3 <h2>) → praktické tipy (<h2> + checklist) → shrnutí (<h2>) → <h2>Zdroje</h2>.
Excerpt: 2–3 věty teaser — unikátní pro každý článek, bez opakovaných frází typu „Srozumitelně a bez zbytečného strašení".
Vrať JSON: { "title": string, "excerpt": string (2–3 věty teaser), "bodyHtml": string (HTML s <p>, 5–6× <h2>, <ul> nebo <h3>, včetně <h2>Zdroje</h2>), "keywords": string[], "metaDescription": string }`;
  const user = buildArticleUserPrompt({ seed, angle, topicLabel, persona, attempt, locale });

  let base = null;
  let lastParsed = null;
  for (let llmAttempt = 0; llmAttempt < MAX_LLM_RETRIES; llmAttempt++) {
    if (llmAttempt > 0) await sleep(3000 * llmAttempt);
    const temperature = (attempt === 0 ? 0.55 : 0.72) + llmAttempt * 0.04;
    const activeSystem = llmAttempt >= 1 ? compactSystem : system;
    const parsed = await generateJsonFromLlm({ system: activeSystem, user, maxTokens: PUBLIC_ARTICLE_MAX_TOKENS, temperature });
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
    base.bodyHtml = appendSourcesFallback(base.bodyHtml, topicLabel, locale);
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
  const polished = locale === "cs" ? polishCzechArticle(base) : base;
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
  writerId = null,
  specialty = "practice",
  locale = "cs",
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
      specialty,
      locale,
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

  if (!lastResult) {
    throw new Error(`generation-empty:${topic}/${seed}`);
  }

  if (lastSim?.duplicate) {
    throw new Error(`similarity-exhausted:${slugify(lastResult.base?.title || seed)}`);
  }

  const { base, authorLabel, persona, editorialAssignment } = lastResult;
  const lockedTitle = lockTitleToSeed(base.title, seed);
  const dateTag = todayDateTag();
  const storedTopic = dbPublicTopic ?? topic;
  const slugLocale = locale && locale !== "cs" ? `verejnost-${String(locale).toLowerCase()}` : "verejnost";
  const slug = `${slugLocale}-${storedTopic}-${dateTag}-${slugify(lockedTitle || seed)}`.slice(0, 120);

  // Enforce magazine length on every new public article (daily cron + regenerate).
  const expanded = await expandPublicArticleIfShort(
    {
      title: lockedTitle,
      excerpt: base.excerpt,
      bodyHtml: base.bodyHtml,
      keywords: base.keywords,
      metaDescription: base.metaDescription,
    },
    {
      minWords: PUBLIC_ARTICLE_MIN_WORDS,
      targetWords: PUBLIC_ARTICLE_TARGET_WORDS,
      topicLabel,
      maxAttempts: 3,
      locale,
    }
  );

  const reviewed = reviewPublicArticle(
    {
      title: lockedTitle,
      excerpt: expanded.excerpt ?? base.excerpt,
      bodyHtml: expanded.bodyHtml ?? base.bodyHtml,
    },
    { topic, specialty, locale }
  );

  const finalBase = {
    ...base,
    title: lockedTitle,
    excerpt: expanded.excerpt ?? base.excerpt,
    bodyHtml: reviewed.bodyHtml,
    keywords: expanded.keywords ?? base.keywords,
    metaDescription: expanded.metaDescription ?? base.metaDescription,
  };

  return {
    ...finalBase,
    seed,
    slug,
    topic: storedTopic,
    internalTopic: topic,
    contentPillar: contentPillar ?? (topic === "dlouhovekost" ? "dlouhovekost" : null),
    topicLabel,
    writerId: writerId ?? null,
    specialty,
    locale,
    writerName: authorLabel,
    writerPersona: persona.id,
    editorialReview: {
      passed: reviewed.passed,
      version: reviewed.version,
      editors: reviewed.editors,
      flags: reviewed.flags,
    },
    writerDisplayName: lastResult.base.writerDisplayName,
    writerByline: lastResult.base.writerByline,
    editorialUnit: editorialAssignment?.primary,
    editorialUnitReviewer: editorialAssignment?.reviewer,
    hash: topicHash(`${dateTag}:${finalBase.title ?? seed}:${persona.id}`, storedTopic),
    generatedAt: new Date().toISOString(),
    editorialVersion: "26.3.0",
    wordCount: countPublicArticleWords(finalBase.bodyHtml),
    expanded: Boolean(expanded.expanded),
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
      locale: article.locale ?? "cs",
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
    locale: article.locale ?? "cs",
    audience: "public",
    public_topic: article.topic,
    source_name: article.writerByline ?? editorialMeta.author_byline,
    meta_description: article.metaDescription ?? article.excerpt?.slice(0, 160),
    ai_generated: true,
    hash_dedup: article.hash,
    metadata: {
      editorial_version: article.editorialVersion ?? "26.3.0",
      writer_id: article.writerId ?? null,
      writer_specialty: article.specialty ?? null,
      writing_style: article.writerPersona ?? null,
      content_pillar: article.contentPillar ?? (article.internalTopic === "dlouhovekost" ? "dlouhovekost" : null),
      internal_topic: article.internalTopic ?? null,
      similarity_check: article.similarityCheck ?? null,
      editorial_review: article.editorialReview ?? null,
      writer_seed: article.seed ?? null,
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
