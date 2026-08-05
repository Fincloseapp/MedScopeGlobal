#!/usr/bin/env node
/**
 * Rebuild content_json.slideshow from lesson markdown for all prijimacky courses.
 * Usage: node scripts/sync-prep-slideshows-from-content.mjs [--dry-run] [--course=slug]
 */
import { createClient } from "@supabase/supabase-js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = loadProjectEnv(ROOT);
for (const [k, v] of Object.entries(env)) process.env[k] = v;

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop&q=80&auto=format";

const IMAGES = {
  orientation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Human_anatomy_planes.jpg/960px-Human_anatomy_planes.jpg",
  skeleton:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Human_skeleton_front_en.svg/800px-Human_skeleton_front_en.svg.png",
  heart:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Diagram_of_the_human_heart_%28cropped%29.svg/800px-Diagram_of_the_human_heart_%28cropped%29.svg.png",
  circulation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Circulatory_System_en.svg/800px-Circulatory_System_en.svg.png",
  cell:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Animal_cell_structure_en.svg/800px-Animal_cell_structure_en.svg.png",
  genetics:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mendel-flowers.jpg/960px-Mendel-flowers.jpg",
  chemistry:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Periodic_table.svg/800px-Periodic_table.svg.png",
  physics:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop&q=80&auto=format",
  brain:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Brain_human_sagittal_section.svg/800px-Brain_human_sagittal_section.svg.png",
  lung:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lungs_diagram_detailed.svg/800px-Lungs_diagram_detailed.svg.png",
  muscle:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop&q=80&auto=format",
  exam: DEFAULT_IMG,
  default: DEFAULT_IMG,
};

const MAP = [
  [/orientac|poloh|roviny|anatom/i, "orientation"],
  [/kost|skelet/i, "skeleton"],
  [/krev|oběh|obeh|cirkul/i, "circulation"],
  [/srdce|kardi|srdec/i, "heart"],
  [/mendel|genet|alel|dna|chromosom/i, "genetics"],
  [/buněk|bunec|mitoz|organel|bunka/i, "cell"],
  [/chem|vazb|uhlik|molekul|alkohol/i, "chemistry"],
  [/fyzik|kinemat|mechan|elektr|sila|rychlost/i, "physics"],
  [/mozek|nerv|neuron/i, "brain"],
  [/plic|dych|respir/i, "lung"],
  [/sval/i, "muscle"],
  [/test|cermat|prijim|strategie/i, "exam"],
];

function pickImage(title, body, topic, index) {
  const hay = `${topic} ${title} ${body}`;
  for (const [re, key] of MAP) {
    if (re.test(hay)) return IMAGES[key] || DEFAULT_IMG;
  }
  const keys = Object.keys(IMAGES).filter((k) => k !== "default");
  return IMAGES[keys[index % keys.length]] || DEFAULT_IMG;
}

function plain(block) {
  return block
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSlideshow(title, content, topic) {
  const courseTopic = topic || title;
  const sections = [];
  const normalized = String(content || "").replace(/\r\n/g, "\n").trim();
  if (normalized) {
    const parts = normalized.split(/(?=^#{2,3}\s+)/m).map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const hm = part.match(/^#{2,3}\s+(.+?)(?:\n|$)/);
      if (hm) {
        const sectionTitle = hm[1].replace(/\*\*/g, "").trim();
        const body = plain(part.slice(hm[0].length));
        if (body.length > 25) sections.push({ title: sectionTitle.slice(0, 80), body: body.slice(0, 420) });
      } else {
        const body = plain(part);
        if (body.length > 40) sections.push({ title, body: body.slice(0, 420) });
      }
    }
  }
  const base = sections.length ? sections.slice(0, 8) : [{ title, body: `Lekce ${title}.` }];
  const slides = base.map((s, i) => ({
    title: s.title,
    body: s.body,
    imageDescription: `${courseTopic}: ${s.title}`,
    durationSeconds: 12,
    imageUrl: pickImage(s.title, s.body, courseTopic, i),
  }));
  return {
    title,
    topic: courseTopic,
    script: slides.map((s) => `${s.title}. ${s.body}`).join(" "),
    voiceoverText: slides.map((s) => s.body).join(" "),
    slides,
    alignmentScore: sections.length ? 0.92 : 0.7,
    ttsMode: "web_speech_api",
    generatedAt: new Date().toISOString(),
    provider: "static",
  };
}

const dryRun = process.argv.includes("--dry-run");
const courseArg = process.argv.find((a) => a.startsWith("--course="))?.slice("--course=".length);

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let courseQuery = admin
  .from("courses")
  .select("id,slug,title")
  .eq("category", "prijimacky")
  .eq("status", "published");
if (courseArg) courseQuery = courseQuery.eq("slug", courseArg);
const { data: courses, error } = await courseQuery;
if (error) {
  console.error(error.message);
  process.exit(1);
}

let updated = 0;
for (const course of courses ?? []) {
  const { data: lessons } = await admin
    .from("lessons")
    .select("id,slug,title,content,content_json,video_asset_id")
    .eq("course_id", course.id)
    .eq("status", "published");
  for (const lesson of lessons ?? []) {
    const manifest = buildSlideshow(lesson.title, lesson.content || "", course.title);
    console.log(`[${course.slug}/${lesson.slug}] slides=${manifest.slides.length}`);
    if (dryRun) continue;
    const existing =
      lesson.content_json && typeof lesson.content_json === "object" ? lesson.content_json : {};
    const { error: updErr } = await admin
      .from("lessons")
      .update({
        content_json: {
          ...existing,
          slideshow: manifest,
          slides: manifest.slides,
          voiceover_text: manifest.voiceoverText,
          alignment_score: manifest.alignmentScore,
          slideshow_generated_at: manifest.generatedAt,
          video_mode: "topic_slideshow",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", lesson.id);
    if (updErr) console.error(updErr.message);
    else updated += 1;
  }
}
console.log(dryRun ? "dry-run done" : `updated lessons=${updated}`);
