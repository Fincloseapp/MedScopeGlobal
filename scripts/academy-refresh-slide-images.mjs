#!/usr/bin/env node
/** Refresh slide imageUrl + imageKeywords for all academy lessons + osveta videos (fetch-only). */
import fs from "node:fs";
import path from "node:path";
import { MEDSCOPE_PROJECT_ROOT } from "../lib/config/paths.mjs";

const root = MEDSCOPE_PROJECT_ROOT;
const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const BASE = (env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL ?? "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!BASE || !KEY) {
  console.error("Missing SUPABASE_URL / SERVICE_ROLE_KEY");
  process.exit(1);
}

const H = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function sbGet(table, query) {
  const res = await fetch(`${BASE}/rest/v1/${table}?${query}`, { headers: H });
  if (!res.ok) throw new Error(`${table} GET ${res.status}`);
  return res.json();
}

async function sbPatch(table, query, body) {
  const res = await fetch(`${BASE}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${table} PATCH ${res.status} ${await res.text()}`);
}

const KEYWORD_IMAGES = {
  anatomy: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  skeleton: "https://images.unsplash.com/photo-1532187863486-abf9db1a4690?w=800&q=80",
  orientation: "https://images.unsplash.com/photo-1532187863486-abf9db1a4690?w=800&q=80",
  heart: "https://images.unsplash.com/photo-1628348068343-c6a848d2a385?w=800&q=80",
  blood: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  circulation: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  pharmacy: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  cell: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
  biology: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
  chemistry: "https://images.unsplash.com/photo-1532636865606-79b0b8b44644?w=800&q=80",
  physics: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  physiology: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
  brain: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  diet: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
  exam: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
  muscle: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  lung: "https://images.unsplash.com/photo-1628595357799-9c8c8fd22790?w=800&q=80",
  default: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
};

const CS_MAP = [
  [/orientac|poloh|roviny|anatom/i, "orientation"],
  [/kost|skelet|kostern/i, "skeleton"],
  [/krev|oběh|cirkul/i, "circulation"],
  [/srdce|kardi|ekg|srdeční/i, "heart"],
  [/farmak|lék|medik|dávkov/i, "pharmacy"],
  [/buněk|buně|biolog|genet|dna/i, "cell"],
  [/chem|vazb|uhlík/i, "chemistry"],
  [/fyzik|kinemat|mechan/i, "physics"],
  [/fyziolog|metabol|dych/i, "physiology"],
  [/mozek|neurolog|nerv/i, "brain"],
  [/strav|výživ|jídlo|diet|zdrav/i, "nutrition"],
  [/sval|myolog/i, "muscle"],
  [/plic|respir/i, "lung"],
  [/přijímač|test|cermat|matur/i, "exam"],
];

function matchKey(haystack) {
  const h = haystack.toLowerCase();
  for (const [re, key] of CS_MAP) {
    if (re.test(h)) return key;
  }
  for (const key of Object.keys(KEYWORD_IMAGES)) {
    if (key !== "default" && h.includes(key)) return key;
  }
  return "default";
}

function resolveImageUrl(slide, topic, i) {
  const kw = Array.isArray(slide.imageKeywords)
    ? slide.imageKeywords.join(" ")
    : slide.imageKeywords ?? "";
  const haystack = [topic, slide.title, slide.body, slide.imageDescription, kw].filter(Boolean).join(" ");
  const key = matchKey(haystack);
  if (key !== "default") return KEYWORD_IMAGES[key];
  const keys = Object.keys(KEYWORD_IMAGES).filter((k) => k !== "default");
  return KEYWORD_IMAGES[keys[i % keys.length]] ?? KEYWORD_IMAGES.default;
}

function inferKeywords(slide, topic) {
  if (slide.imageKeywords?.length) return slide.imageKeywords;
  const h = `${topic} ${slide.title} ${slide.body}`.toLowerCase();
  const out = [];
  for (const [re, key] of CS_MAP) {
    if (re.test(h)) out.push(key);
  }
  return out.length ? out : [matchKey(h)];
}

function refreshSlideshow(slideshow, topic) {
  if (!slideshow?.slides?.length) return slideshow;
  slideshow.slides = slideshow.slides.map((s, i) => ({
    ...s,
    imageKeywords: inferKeywords(s, topic),
    imageUrl: resolveImageUrl(s, topic, i),
    imageDescription: s.imageDescription || s.title,
  }));
  return slideshow;
}

let lessonCount = 0;
let osvetaCount = 0;

const lessons = await sbGet("lessons", "select=id,title,content,content_json,slug,course_id&status=eq.published");
const courses = await sbGet("courses", "select=id,title");
const courseMap = new Map(courses.map((c) => [c.id, c.title]));

for (const lesson of lessons) {
  const topic = courseMap.get(lesson.course_id) ?? "MedScope Academy";
  const cj = { ...(lesson.content_json ?? {}) };
  let slideshow = cj.slideshow ?? null;

  if (!slideshow?.slides?.length) {
    const paragraphs = (lesson.content || "")
      .replace(/[#*]/g, "")
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15)
      .slice(0, 6);
    const slides =
      paragraphs.length > 0
        ? paragraphs.map((body, i) => ({
            title: i === 0 ? lesson.title : `${lesson.title} — ${i + 1}`,
            body: body.slice(0, 280),
            imageDescription: topic,
            durationSeconds: 10,
          }))
        : [{ title: lesson.title, body: (lesson.content || lesson.title).slice(0, 280), imageDescription: topic, durationSeconds: 10 }];
    slideshow = {
      title: lesson.title,
      topic,
      script: slides.map((s) => s.body).join(" "),
      voiceoverText: slides.map((s) => s.body).join(" "),
      slides,
      alignmentScore: 0.85,
      ttsMode: "web_speech_api",
      generatedAt: new Date().toISOString(),
      provider: "static",
    };
  }

  slideshow = refreshSlideshow(slideshow, topic);
  const listenText = [lesson.title, lesson.content, ...slideshow.slides.map((s) => `${s.title}. ${s.body}`)].join("\n\n");

  await sbPatch("lessons", `id=eq.${lesson.id}`, {
    content_json: { ...cj, slideshow, slides: slideshow.slides, voiceover_text: listenText, alignment_score: slideshow.alignmentScore ?? 0.85 },
    updated_at: new Date().toISOString(),
  });
  lessonCount += 1;
  console.log(`✓ lesson ${lesson.slug}`);
}

let osvetaVideos = [];
try {
  osvetaVideos = await sbGet("public_health_videos", "select=id,title,script,metadata,slug");
} catch {
  console.warn("public_health_videos table not found — skipping osveta");
}

for (const video of osvetaVideos) {
  const topic = video.metadata?.topic_title ?? "Zdravotní osvěta";
  const meta = { ...(video.metadata ?? {}) };
  let slideshow = meta.slideshow ?? null;

  if (!slideshow?.slides?.length) {
    const paragraphs = (video.script || video.title || "")
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15)
      .slice(0, 6);
    const slides =
      paragraphs.length > 0
        ? paragraphs.map((body, i) => ({
            title: i === 0 ? video.title : `${video.title} — ${i + 1}`,
            body: body.slice(0, 280),
            imageDescription: topic,
            durationSeconds: 10,
          }))
        : [{ title: video.title, body: `${topic}: ${video.title}.`, imageDescription: topic, durationSeconds: 10 }];
    slideshow = {
      title: video.title,
      topic,
      script: slides.map((s) => s.body).join(" "),
      voiceoverText: slides.map((s) => s.body).join(" "),
      slides,
      alignmentScore: 0.85,
      ttsMode: "web_speech_api",
      generatedAt: new Date().toISOString(),
      provider: "static",
    };
  }

  slideshow = refreshSlideshow(slideshow, topic);
  meta.slideshow = slideshow;

  await sbPatch("public_health_videos", `id=eq.${video.id}`, {
    metadata: meta,
    updated_at: new Date().toISOString(),
  });
  osvetaCount += 1;
  console.log(`✓ osveta ${video.slug ?? video.id}`);
}

console.log(`\nDone: ${lessonCount} lessons, ${osvetaCount} osveta videos\n`);
