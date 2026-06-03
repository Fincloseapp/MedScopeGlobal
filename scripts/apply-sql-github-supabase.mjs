/**
 * Applies MISSING_PRODUCTION_TABLES.sql via Supabase Management API.
 * Set SUPABASE_ACCESS_TOKEN in .env.local (https://supabase.com/dashboard/account/tokens)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const ref = env.SUPABASE_PROJECT_REF || env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const token = env.SUPABASE_ACCESS_TOKEN;
if (!token || !ref) {
  console.log("Need SUPABASE_ACCESS_TOKEN in .env.local for automatic SQL.");
  process.exit(1);
}

const sql = fs.readFileSync(path.join(root, "supabase/MISSING_PRODUCTION_TABLES.sql"), "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
if (!res.ok) {
  console.error(res.status, text.slice(0, 500));
  process.exit(1);
}
console.log("✓ SQL applied");
