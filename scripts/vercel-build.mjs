#!/usr/bin/env node
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";

function hasDatabaseEnv() {
  const candidates = [
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL,
    process.env.DIRECT_URL
  ];
  return candidates.some((value) => value && !/\[(PASSWORD|REF|HESLO)\]/i.test(value));
}

console.log("MedScopeGlobal Vercel build");
execSync("prisma generate", { stdio: "inherit" });

if (process.env.VERCEL === "1" && hasDatabaseEnv()) {
  try {
    console.log("Supabase database detected – running migrations...");
    execSync("prisma migrate deploy", { stdio: "inherit", env: process.env });
    console.log("Running seed...");
    execSync("node prisma/seed.mjs", { stdio: "inherit", env: process.env });
  } catch (migrateError) {
    console.warn("⚠️  Migrate/seed skipped:", migrateError.message);
  }
} else if (process.env.VERCEL === "1") {
  console.warn("");
  console.warn("⚠️  Supabase database env vars not found on Vercel.");
  console.warn("   Connect Supabase via Vercel Marketplace integration.");
  console.warn("");
}

if (process.env.VERCEL === "1" && !process.env.AUTH_SECRET) {
  console.warn("⚠️  AUTH_SECRET not set – generating ephemeral build secret.");
  process.env.AUTH_SECRET = randomBytes(32).toString("base64");
}
