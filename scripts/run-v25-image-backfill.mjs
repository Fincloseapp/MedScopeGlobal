#!/usr/bin/env node
/** Nahradí legacy Unsplash obrázky v Supabase — vyžaduje .env.local */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsx = join(root, "node_modules/tsx/dist/cli.mjs");
const cli = join(root, "scripts/run-v25-image-backfill-cli.ts");

function loadEnvLocal() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  }
}

if (!existsSync(tsx)) {
  console.error("tsx missing — run npm install");
  process.exit(1);
}

loadEnvLocal();

const result = spawnSync(process.execPath, [tsx, cli, ...process.argv.slice(2)], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
