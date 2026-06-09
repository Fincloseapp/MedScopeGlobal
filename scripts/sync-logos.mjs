#!/usr/bin/env node
/**
 * MedScopeGlobal logo sync — entry point (v23.2.0)
 * Zkopíruje loga z D:\MedScopeGlobal\logo → public/assets/logo/
 *
 * Usage: node scripts/sync-logos.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { syncLogosFromSource } from "./lib/logo-sync-core.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { log } = syncLogosFromSource({ root });

for (const entry of log) {
  if (entry.src) {
    console.log(`✓ ${entry.src} → public/assets/logo/${entry.dest}`);
  } else if (entry.missing) {
    console.warn(`⚠ missing: ${entry.missing} (checked ${entry.sources.join(", ")})`);
  }
}

console.log("Logo sync done (v23.2.0).");
