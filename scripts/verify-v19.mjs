#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "lib/v19/engine.ts",
  "lib/v19/generator.ts",
  "lib/v19/dedup.ts",
  "lib/v19/safety.ts",
  "lib/v19/cache.ts",
  "lib/v19/queue.ts",
  "lib/v19/monitoring.ts",
  "app/api/v19/articles/route.ts",
  "app/api/v19/monitoring/route.ts",
  "components/v19/article-brief-card.tsx",
  "supabase/migrations/20260612120000_v19_content_engine.sql",
];

let failed = 0;
for (const rel of required) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    console.error(`✗ missing ${rel}`);
    failed += 1;
  } else {
    console.log(`✓ ${rel}`);
  }
}

const header = readFileSync(join(root, "components/layout/site-header.tsx"), "utf8");
if (header.includes("LocaleSwitcher")) {
  console.error("✗ LocaleSwitcher still in site-header");
  failed += 1;
} else {
  console.log("✓ LocaleSwitcher removed from header");
}

process.exit(failed ? 1 : 0);
