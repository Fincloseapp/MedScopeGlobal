#!/usr/bin/env node
/**
 * MedScopeGlobal logo sync + WebP/@2x pipeline (v23.2.3)
 * D:\MedScopeGlobal\logo → public/assets/logo/
 */
import { syncLogosFromSource } from "./lib/logo-sync-core.mjs";
import { projectPath } from "../lib/config/paths.mjs";

const root = projectPath();

try {
  const { log } = await syncLogosFromSource({ root });

  for (const entry of log) {
    if (entry.src) console.log(`✓ ${entry.src} → public/assets/logo/${entry.dest}`);
    else if (entry.derived) console.log(`  ↳ ${entry.derived}`);
    else if (entry.warn) console.warn(`⚠ ${entry.warn}`);
    else if (entry.missing) console.warn(`⚠ missing: ${entry.missing} (checked ${entry.sources.join(", ")})`);
  }

  console.log("Logo sync + derivatives done (v23.2.3).");
} catch (e) {
  if (e.log) {
    for (const entry of e.log) {
      if (entry.src) console.log(`✓ ${entry.src} → ${entry.dest}`);
    }
  }
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
