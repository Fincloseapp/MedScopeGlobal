/**
 * Applies SQL migration files via Postgres (Supabase → Settings → Database → URI).
 * Set DATABASE_URL in .env.local (use "Session" or direct connection, not pooler for DDL).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const url = env.DATABASE_URL || env.SUPABASE_DB_URL;
if (!url) {
  console.log(`
No DATABASE_URL in .env.local.

Supabase Dashboard → Project Settings → Database → Connection string (URI)
Add to .env.local:
  DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@...

Then run:
  npm run db:apply-pg

Or paste SQL in SQL Editor:
  supabase/migrations/20240525000004_article_translations.sql
`);
  process.exit(1);
}

const fileArg = process.argv[2];
const files = fileArg
  ? [path.isAbsolute(fileArg) ? fileArg : path.join(root, fileArg)]
  : [path.join(root, "supabase/MISSING_PRODUCTION_TABLES.sql")];

let pg;
try {
  pg = await import("pg");
} catch {
  console.error("Install pg: npm install pg --save-dev");
  process.exit(1);
}

const client = new pg.default.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

for (const file of files) {
  const sql = fs.readFileSync(file, "utf8");
  process.stdout.write(`→ ${path.basename(file)} ... `);
  try {
    await client.query(sql);
    console.log("OK");
  } catch (e) {
    console.log("FAILED");
    console.error(e.message);
    await client.end();
    process.exit(1);
  }
}

await client.end();
console.log("\nDone. Run: npm run db:verify");
