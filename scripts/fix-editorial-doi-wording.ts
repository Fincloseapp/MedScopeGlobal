#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { loadProjectEnv } from "./load-env.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FROM = "Konkrétní čísla, autoři, DOI, guideline a závěry";
const TO = "Konkrétní čísla, autoři, identifikátory zdrojů, guideline a závěry";
const HEART = "beyond-the-pump-integrating-the-hearts-endocrine-function-into-early-medical-education";

const env: Record<string, string | undefined> = { ...loadProjectEnv(ROOT), ...process.env };
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

async function main() {
  const { data, error } = await admin
    .from("articles")
    .select("id,slug,content")
    .eq("published", true)
    .neq("slug", HEART)
    .like("content", "%DOI%");
  if (error) throw new Error(error.message);

  const replacements: Array<[string, string]> = [
    [FROM, TO],
    [
      "konkrétní výsledky studií, DOI ani guideline proto neuvádíme",
      "konkrétní výsledky studií ani guideline proto neuvádíme",
    ],
  ];
  let updated = 0;
  for (const row of data ?? []) {
    let next = String(row.content);
    for (const [from, to] of replacements) next = next.replaceAll(from, to);
    if (next === row.content) continue;
    const { error: updateError } = await admin
      .from("articles")
      .update({ content: next, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updateError) throw new Error(`${row.slug}: ${updateError.message}`);
    updated += 1;
  }
  console.log(JSON.stringify({ scanned: data?.length ?? 0, updated }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
