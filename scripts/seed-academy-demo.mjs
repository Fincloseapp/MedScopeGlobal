#!/usr/bin/env node
/**
 * Seed MedScope Academy demo content (course, lesson, quiz, simulation).
 * Uses Supabase service role from .env.local
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};

for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

async function ensureCourse() {
  const { data: existing } = await admin.from("courses").select("id").eq("slug", "uvod-do-anatomie").maybeSingle();
  if (existing?.id) return existing.id;

  const { data, error } = await admin
    .from("courses")
    .insert({
      slug: "uvod-do-anatomie",
      title: "Úvod do anatomie",
      description: "Základní přehled lidské anatomie pro studenty prvního ročníku LF.",
      summary: "Kostra, svaly a orientace v těle.",
      status: "published",
      level: "beginner",
      category: "anatomie",
      duration_minutes: 45,
      xp_reward: 100,
      is_public: true,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

async function main() {
  console.log("=== Academy demo seed ===");
  const courseId = await ensureCourse();
  console.log("course:", courseId);

  const { data: lessonExists } = await admin
    .from("lessons")
    .select("id")
    .eq("course_id", courseId)
    .eq("slug", "kosterni-system")
    .maybeSingle();

  if (!lessonExists) {
    const { error } = await admin.from("lessons").insert({
      course_id: courseId,
      slug: "kosterni-system",
      title: "Kosterní systém",
      content: "Kosterní systém tvoří vnitřní opěrnou konstrukci těla.",
      sort_order: 1,
      duration_minutes: 20,
      status: "published",
    });
    if (error) throw new Error(error.message);
    console.log("lesson: created");
  }

  let quizId;
  const { data: quizExists } = await admin
    .from("quizzes")
    .select("id")
    .eq("course_id", courseId)
    .eq("title", "Kvíz: Kosterní systém")
    .maybeSingle();

  if (quizExists?.id) {
    quizId = quizExists.id;
  } else {
    const { data, error } = await admin
      .from("quizzes")
      .insert({ course_id: courseId, title: "Kvíz: Kosterní systém", passing_score: 70, status: "published" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    quizId = data.id;
    console.log("quiz: created");
  }

  const { count } = await admin.from("quiz_questions").select("id", { count: "exact", head: true }).eq("quiz_id", quizId);
  if (!count) {
    await admin.from("quiz_questions").insert({
      quiz_id: quizId,
      question_text: "Kolik párů žeber má typický dospělý člověk?",
      question_type: "multiple_choice",
      options: [
        { label: "10 párů", value: "10" },
        { label: "12 párů", value: "12" },
        { label: "14 párů", value: "14" },
      ],
      correct_answer: { value: "12" },
      sort_order: 1,
      explanation: "Dospělý člověk má 12 párů žeber.",
    });
    console.log("quiz question: created");
  }

  console.log("=== Academy demo seed OK ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
