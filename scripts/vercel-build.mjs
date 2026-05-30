#!/usr/bin/env node
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const hasDatabase = Boolean(process.env.DIRECT_URL || process.env.DATABASE_URL);

function runStep(label, command) {
  try {
    execSync(command, { stdio: "inherit", env: process.env });
    console.log(`✓ ${label}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  ${label} failed – build continues (runtime will use existing schema).`);
    if (error instanceof Error && error.message) console.warn(error.message);
    return false;
  }
}

console.log("MedScopeGlobal Vercel build");
execSync("prisma generate", { stdio: "inherit" });

if (hasDatabase) {
  console.log("Database detected – running migrations and seed...");
  runStep("Prisma migrate deploy", "prisma migrate deploy");
  runStep("Portal seed", "node prisma/seed.mjs");
} else if (process.env.VERCEL === "1") {
  console.warn("");
  console.warn("⚠️  DATABASE_URL / DIRECT_URL not set on Vercel.");
  console.warn("   Portal writes (save, rate, publish) will fail until Supabase is connected.");
  console.warn("   Run: npm run setup:production");
  console.warn("");
} else {
  console.log("Skipping DB setup – no DATABASE_URL (local build).");
}

if (process.env.VERCEL === "1" && !process.env.AUTH_SECRET) {
  console.warn("⚠️  AUTH_SECRET not set – generating ephemeral build secret.");
  process.env.AUTH_SECRET = randomBytes(32).toString("base64");
}
