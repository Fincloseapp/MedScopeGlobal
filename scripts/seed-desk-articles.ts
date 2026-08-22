/**
 * Insert student / physician / research desk articles into Supabase.
 * Usage: npx tsx scripts/seed-desk-articles.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seedDeskArticles } from "../lib/editorial/seed-desk-articles";

function loadDotEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
loadDotEnv(join(root, ".env.local"));
loadDotEnv(join(root, ".env"));

async function main() {
  const result = await seedDeskArticles();
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
