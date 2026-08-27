#!/usr/bin/env node
/**
 * Cloud-agent / Linux probe for MedScope secrets.
 *
 * Exhaustively searches for Windows D: mounts and local copies of .env files.
 * Prints KEY NAMES ONLY — never secret values.
 *
 * Usage:
 *   node scripts/find-d-drive.mjs
 *   pnpm find:d:cloud
 *
 * Exit codes:
 *   0 — probe finished (D: may still be missing)
 *   2 — unexpected I/O failure
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const NEEDED = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ACCESS_TOKEN",
  "VERCEL_TOKEN",
  "CLOUDFLARE_ENV_JSON",
];

const ENV_BASENAMES = new Set([
  ".env.local",
  ".env.production.local",
  ".env.vercel.local",
  ".dev.vars",
  ".env.cloudflare.json",
  ".env",
]);

const MOUNT_CANDIDATES = [
  "/mnt/d",
  "/mnt/D",
  "/d",
  "/media/d",
  "/media/D",
  "D:\\",
  "D:/",
];

const SEARCH_ROOTS = [
  process.cwd(),
  process.env.MEDSCOPE_PROJECT_ROOT || "",
  "/workspace",
  "/tmp",
  os.homedir(),
  "/opt",
  "/opt/cursor",
  "/cursor",
  "/mnt",
  "/media",
].filter(Boolean);

const MAX_DEPTH = 5;
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  "pnpm-store",
  ".pnpm",
  "vendor",
]);

function isPlaceholder(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v.length < 8) return true;
  return ["placeholder", "changeme", "your_", "example", "xxx", "dummy", "todo", "replace", "test-key"].some(
    (x) => v.includes(x),
  );
}

function parseEnvFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const keys = {};
  if (filePath.endsWith(".json")) {
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            keys[k] = String(v);
          }
        }
      }
    } catch {
      return null;
    }
    return keys;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const eq = trimmed.indexOf("=");
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k) keys[k] = v;
  }
  return keys;
}

function shouldKeepFile(name) {
  if (ENV_BASENAMES.has(name)) return true;
  if (name.endsWith(".env.local") || name.endsWith(".env.bak")) return true;
  if (name === "BACKUP_MANIFEST.txt") return true;
  const low = name.toLowerCase();
  if (low.includes("secret") && (low.endsWith(".txt") || low.endsWith(".env") || low.endsWith(".json"))) {
    return true;
  }
  return false;
}

function walk(root, out, depth = 0) {
  if (depth > MAX_DEPTH) return;
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(root, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walk(full, out, depth + 1);
      continue;
    }
    if (!ent.isFile()) continue;
    if (!shouldKeepFile(ent.name)) continue;
    out.push(full);
  }
}

function classify(keys) {
  const important = {};
  for (const k of NEEDED) {
    if (!(k in keys)) continue;
    important[k] = {
      len: keys[k].length,
      placeholder: isPlaceholder(keys[k]),
    };
  }
  return important;
}

function main() {
  console.log("=== MedScope D: / secrets probe (names only) ===\n");

  const mounts = [];
  for (const p of MOUNT_CANDIDATES) {
    const ok = fs.existsSync(p);
    mounts.push({ path: p, exists: ok });
    console.log(`${ok ? "OK " : " — "} mount ${p}`);
  }
  const dMounted = mounts.some((m) => m.exists);

  const stubs = [];
  for (const root of [process.cwd(), "/workspace"]) {
    if (!fs.existsSync(root)) continue;
    for (const name of fs.readdirSync(root)) {
      if (name.startsWith("D:") || name.startsWith("D\\")) {
        stubs.push(path.join(root, name));
      }
    }
  }
  if (stubs.length) {
    console.log("\nD: path stubs (NOT a real Windows mount):");
    for (const s of stubs) console.log(`  ${s}`);
  }

  console.log("\n=== process.env (set/unset only) ===");
  for (const k of NEEDED) {
    console.log(`  ${k}: ${process.env[k] ? "set" : "unset"}`);
  }

  const seen = new Set();
  const files = [];
  for (const root of SEARCH_ROOTS) {
    if (!root || !fs.existsSync(root)) continue;
    const found = [];
    walk(path.resolve(root), found);
    for (const f of found) {
      if (seen.has(f)) continue;
      seen.add(f);
      files.push(f);
    }
  }

  console.log(`\n=== env / secret files (${files.length}) ===`);
  const fillable = {};
  for (const f of files.sort()) {
    let keys;
    try {
      keys = parseEnvFile(f);
    } catch (err) {
      console.log(`  UNREADABLE ${f} (${err.message})`);
      continue;
    }
    if (!keys) {
      console.log(`  SKIP ${f} (parse failed)`);
      continue;
    }
    const important = classify(keys);
    const real = Object.entries(important)
      .filter(([, m]) => !m.placeholder)
      .map(([k]) => k);
    const ph = Object.entries(important)
      .filter(([, m]) => m.placeholder)
      .map(([k]) => k);
    console.log(`  ${f}`);
    console.log(`    keys=${Object.keys(keys).length} real=[${real.join(", ") || "—"}] placeholder=[${ph.join(", ") || "—"}]`);
    for (const [k, meta] of Object.entries(important)) {
      if (meta.placeholder) continue;
      if (!fillable[k] || meta.len > fillable[k].len) {
        fillable[k] = { from: f, len: meta.len };
      }
    }
  }

  console.log("\n=== fillable non-placeholder keys ===");
  if (Object.keys(fillable).length === 0) {
    console.log("  (none) — CLOUDFLARE_*/STRIPE_*/SUPABASE_SERVICE_ROLE_KEY not on this VM");
  } else {
    for (const [k, meta] of Object.entries(fillable)) {
      console.log(`  ${k} ← ${meta.from} (len=${meta.len})`);
    }
  }

  console.log("\n=== next steps ===");
  if (!dMounted) {
    console.log(`
D: is NOT mounted on this cloud VM (expected).

On the Windows PC run the one-shot auto restore + deploy:

  cd D:\\medscope.local
  git pull origin main
  pnpm auto:d

Or step-by-step:

  pnpm find:d
  pnpm sync:d
  pnpm db:verify
  pnpm deploy:production -- -SkipRestore

Then paste CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, SUPABASE_SERVICE_ROLE_KEY,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CRON_SECRET into Cursor Secrets
(environment medscopeglobal) and start a new agent run.
`);
  } else {
    console.log("D: mount detected — copy .env.local into workspace and run restore scripts.");
  }

  console.log("find-d-drive.mjs complete (no secret values printed)");
}

try {
  main();
} catch (err) {
  console.error("ERR", err);
  process.exit(2);
}
