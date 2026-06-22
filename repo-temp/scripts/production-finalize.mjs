/**
 * Production finalize: migrations (if possible), content bootstrap, verify, build.
 */
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, stdio: "inherit", shell: true });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))));
  });
}

function hasEnvKey(name) {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return false;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && m[1].trim() === name && m[2].trim().length > 0) return true;
  }
  return false;
}

console.log("=== MedScopeGlobal production finalize ===\n");

if (hasEnvKey("DATABASE_URL") || hasEnvKey("SUPABASE_DB_URL")) {
  console.log("→ Applying article_translations via DATABASE_URL...");
  try {
    await run("node", ["scripts/apply-migration-pg.mjs"]);
  } catch {
    console.log("   (skipped — fix DATABASE_URL or run SQL in Supabase Editor)\n");
  }
} else if (hasEnvKey("SUPABASE_ACCESS_TOKEN")) {
  console.log("→ Applying migrations via Management API...");
  try {
    await run("node", ["scripts/apply-article-translations-table.mjs"]);
  } catch {
    console.log("   (skipped)\n");
  }
} else {
  console.log(
    "○ Add DATABASE_URL or SUPABASE_ACCESS_TOKEN to .env.local, or run SQL:\n" +
      "  supabase/migrations/20240525000004_article_translations.sql\n"
  );
}

await run("node", ["scripts/production-bootstrap.mjs"]);
await run("node", ["scripts/publish-checklist.mjs"]);

console.log("\n→ Building production bundle...");
await run("npm", ["run", "build:win"]);

console.log(`
=== Deploy (requires Vercel login) ===
  npx vercel login
  npx vercel link
  npx vercel env pull .env.vercel.local
  npx vercel --prod

Set Vercel env (Production): same keys as .env.local
Domain: medscopeglobal.com + www → Vercel → Settings → Domains
`);
