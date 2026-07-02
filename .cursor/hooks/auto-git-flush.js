#!/usr/bin/env node
/** Cursor sessionStart — flush pending push (offline queue) */
const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const hooksDir = join(__dirname);
const root = join(hooksDir, "../..");
const pending = join(hooksDir, ".auto-git-pending-push");

try {
  readFileSync(0, "utf8");
} catch {
  /* stdin optional */
}

if (!existsSync(pending)) process.exit(0);

spawnSync(process.execPath, [join(root, "scripts/auto-git-commit-push.js"), "--push-only"], {
  cwd: root,
  stdio: "inherit",
  windowsHide: true,
});

process.exit(0);
