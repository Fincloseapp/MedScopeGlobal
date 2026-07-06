import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDeployEnv, vercelFetch } from "./deploy/vercel-api.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadDeployEnv();
const data = await vercelFetch(`/v9/projects/${env.VERCEL_PROJECT_ID}/env?decrypt=true`, { env });
const map = Object.fromEntries((data.envs || []).map((e) => [e.key, e.value]));

const candidates = [
  map.DATABASE_URL,
  map.POSTGRES_URL,
  map.POSTGRES_URL_NON_POOLING,
  map.DIRECT_URL,
].filter(Boolean);

if (map.POSTGRES_HOST && map.POSTGRES_USER && map.POSTGRES_PASSWORD && map.POSTGRES_DATABASE) {
  candidates.push(
    `postgresql://${encodeURIComponent(map.POSTGRES_USER)}:${encodeURIComponent(map.POSTGRES_PASSWORD)}@${map.POSTGRES_HOST}/${map.POSTGRES_DATABASE}?sslmode=require`
  );
}

if (!candidates.length) {
  console.error("No usable Postgres connection string from Vercel env");
  process.exit(1);
}

const pg = await import("pg");
const sql = fs.readFileSync(
  path.join(root, "supabase/migrations/20260707120000_student_materials_text_cache.sql"),
  "utf8"
);

for (let i = 0; i < candidates.length; i++) {
  const client = new pg.default.Client({
    connectionString: candidates[i],
    ssl: { rejectUnauthorized: false },
  });
  process.stdout.write(`Trying connection candidate ${i + 1}/${candidates.length} ... `);
  try {
    await client.connect();
    await client.query(sql);
    console.log("OK");
    await client.end();
    process.exit(0);
  } catch (e) {
    console.log("FAILED");
    console.error(e.message?.slice?.(0, 200) ?? e);
    await client.end().catch(() => undefined);
  }
}

process.exit(1);
