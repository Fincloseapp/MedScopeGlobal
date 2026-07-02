/**
 * Runs SQL files against Supabase using service role (PostgREST won't run DDL).
 * For DDL use Management API token via db:setup, or paste in SQL Editor.
 */
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

const files = process.argv.slice(2);
if (files.length === 0) {
  console.log("Usage: node scripts/apply-sql-via-api.mjs <file.sql>");
  process.exit(1);
}

console.log("DDL must be run in Supabase SQL Editor or: npm run db:setup");
console.log("Checking tables via service role...\n");

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

for (const f of files) {
  const name = path.basename(f);
  const table = name.includes("article_translations")
    ? "article_translations"
    : name.includes("storage")
      ? "storage.buckets"
      : null;
  if (table === "article_translations") {
    const { error } = await admin.from("article_translations").select("article_id").limit(1);
    console.log(`${name}: ${error ? "MISSING — run in SQL Editor" : "OK"}`);
    if (error) {
      console.log(fs.readFileSync(path.join(root, f), "utf8"));
    }
  }
}
