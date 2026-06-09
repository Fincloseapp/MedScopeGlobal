#!/usr/bin/env node
/** @deprecated Use scripts/sync-logos.mjs */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(process.execPath, [join(root, "scripts", "sync-logos.mjs")], {
  cwd: root,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
