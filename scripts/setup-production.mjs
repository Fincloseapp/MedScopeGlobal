#!/usr/bin/env node
/**
 * Production setup helper for Supabase + Vercel.
 *
 * Usage:
 *   1. Copy .env.production.local.example → .env.production.local
 *   2. Fill Supabase connection strings from dashboard
 *   3. Run: npm run setup:production
 *   4. Redeploy on Vercel (or push to main)
 */
import { randomBytes } from "node:crypto";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";

const envFile = ".env.production.local";
const exampleFile = ".env.production.local.example";
const SUPABASE_PROJECT_REF = "xcydgqnivxfhprbmdyym";
const SUPABASE_DB_SETTINGS =
  `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/settings/database`;

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
  );
}

function ensureExample() {
  if (existsSync(exampleFile)) return;
  writeFileSync(
    exampleFile,
    `# Supabase project medscopeglobal (${SUPABASE_PROJECT_REF})
# ${SUPABASE_DB_SETTINGS}
DATABASE_URL=postgresql://postgres.${SUPABASE_PROJECT_REF}:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres
AUTH_SECRET=
NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com
`
  );
}

function main() {
  ensureExample();
  const env = loadEnvFile(envFile);

  if (!env.AUTH_SECRET) {
    env.AUTH_SECRET = randomBytes(32).toString("base64");
    console.log("Generated AUTH_SECRET");
  }

  if (!env.DATABASE_URL || !env.DIRECT_URL) {
    console.log("");
    console.log("Chybí Supabase connection stringy pro projekt medscopeglobal.");
    console.log(`1. Otevřete: ${SUPABASE_DB_SETTINGS}`);
    console.log(`2. Reset database password (pokud heslo neznáte)`);
    console.log(`3. Zkopírujte Transaction pooler (6543) → DATABASE_URL`);
    console.log(`4. Zkopírujte Direct connection (5432) → DIRECT_URL`);
    console.log(`5. Uložte do ${envFile} (vzor: ${exampleFile})`);
    console.log(`6. Spusťte znovu: npm run setup:production`);
    console.log("");
    process.exit(1);
  }

  writeFileSync(
    envFile,
    Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n"
  );

  console.log("Validating database connection...");
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, ...env } });
  execSync("node prisma/seed.mjs", { stdio: "inherit", env: { ...process.env, ...env } });

  const vercel = spawnSync("npx", ["vercel", "--version"], { encoding: "utf8" });
  if (vercel.status !== 0) {
    console.log("");
    console.log("Vercel CLI není přihlášené. Nastavte env vars ručně ve Vercel Dashboard:");
    console.log("");
    for (const key of ["DATABASE_URL", "DIRECT_URL", "AUTH_SECRET", "NEXT_PUBLIC_SITE_URL"]) {
      console.log(`${key}=${env[key] ?? "https://medscopeglobal.com"}`);
    }
    console.log("");
    return;
  }

  console.log("");
  console.log("Nastavuji Vercel environment variables (production)...");
  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    console.log(`→ ${key}`);
    execSync(`printf '%s' '${value.replace(/'/g, "'\\''")}' | npx vercel env add ${key} production --force`, {
      stdio: "inherit",
      shell: "/bin/bash"
    });
  }

  console.log("");
  console.log("Hotovo. Spusťte redeploy: npx vercel --prod");
}

main();
