#!/usr/bin/env node
/** Debounce worker — 8s quiet period then run autogit */
const { readFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const hooksDir = join(__dirname);
const root = join(hooksDir, "../..");
const tickFile = join(hooksDir, ".auto-git-debounce");
const DEBOUNCE_MS = 8000;

const scheduledTick = process.argv[2];
if (!scheduledTick) process.exit(0);

const end = Date.now() + DEBOUNCE_MS;
while (Date.now() < end) {
  /* wait */
}

if (!existsSync(tickFile)) process.exit(0);
if (readFileSync(tickFile, "utf8").trim() !== scheduledTick) process.exit(0);

spawnSync(process.execPath, [join(root, "scripts/auto-git-commit-push.js")], {
  cwd: root,
  stdio: "inherit",
  windowsHide: true,
});
