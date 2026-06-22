import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizeForHash(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]+/g, "")
    .trim();
}

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function main() {
  const { data: rows, error } = await supabase
    .from("articles")
    .select("id, title, excerpt, content, source_url, hash_dedup")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let assigned = 0;
  let duplicates = 0;
  const seen = new Map();

  for (const row of rows ?? []) {
    const rawFingerprint = [
      normalizeForHash(row.title),
      normalizeForHash(row.source_url),
      normalizeForHash(row.excerpt),
      normalizeForHash(row.content?.slice(0, 1500)),
    ].join("|");

    const hash = sha(rawFingerprint);
    const existing = seen.get(hash);

    if (existing) {
      duplicates += 1;
      console.log(`Duplicate detected: ${row.id} matches ${existing}`);
      continue;
    }

    seen.set(hash, row.id);
    const { error: updateError } = await supabase
      .from("articles")
      .update({ hash_dedup: hash })
      .eq("id", row.id);

    if (updateError) {
      console.error(`Failed ${row.id}: ${updateError.message}`);
    } else {
      assigned += 1;
    }
  }

  console.log(JSON.stringify({ assigned, duplicates, total: rows?.length ?? 0 }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
