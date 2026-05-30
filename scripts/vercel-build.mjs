#!/usr/bin/env node
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";

console.log("MedScopeGlobal Vercel build");
execSync("prisma generate", { stdio: "inherit" });

if (process.env.VERCEL === "1" && !process.env.DATABASE_URL) {
  console.warn("");
  console.warn("⚠️  DATABASE_URL / DIRECT_URL not set on Vercel.");
  console.warn("   Portal writes (save, rate, publish) will fail until Supabase is connected.");
  console.warn("   Run: npm run setup:production");
  console.warn("");
}

if (process.env.VERCEL === "1" && !process.env.AUTH_SECRET) {
  console.warn("⚠️  AUTH_SECRET not set – generating ephemeral build secret.");
  process.env.AUTH_SECRET = randomBytes(32).toString("base64");
}
