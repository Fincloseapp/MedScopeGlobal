#!/usr/bin/env node
/** @deprecated Use scripts/sync-logos.mjs */
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { projectPath } from "../lib/config/paths.mjs";

const root = projectPath();
const result = spawnSync(process.execPath, [join(root, "scripts", "sync-logos.mjs")], {
  cwd: root,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
