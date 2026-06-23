import fs from "fs";
import path from "path";
import { projectPath } from "../lib/config/paths.mjs";

const root = projectPath();
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const ref = env.SUPABASE_PROJECT_REF || env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const token = env.SUPABASE_ACCESS_TOKEN;

async function getTokenFromFile() {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  for (const p of [
    path.join(home, ".supabase", "access-token"),
    path.join(home, ".config", "supabase", "access-token"),
  ]) {
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8").trim();
  }
  return null;
}

const access = token || (await getTokenFromFile());
if (!access || !ref) {
  console.log("Paste into Supabase SQL Editor:\n");
  console.log(fs.readFileSync(path.join(root, "supabase/migrations/20240525000004_article_translations.sql"), "utf8"));
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(root, "supabase/migrations/20240525000004_article_translations.sql"),
  "utf8"
);

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${access}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
if (!res.ok) {
  console.error("Failed:", res.status, text.slice(0, 400));
  process.exit(1);
}
console.log("✓ article_translations table applied");
