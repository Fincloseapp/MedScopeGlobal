#!/usr/bin/env node
/** Debounce worker — quiet period then run scripts/auto-git-commit-push.js */
const { readFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const hooksDir = join(__dirname);
const root = join(hooksDir, "../..");
const tickFile = join(hooksDir, ".auto-git-debounce");
const configPath = join(hooksDir, "auto-git.json");

const scheduledTick = process.argv[2];
const debounceMs = Number(process.argv[3]) || 8000;
if (!scheduledTick) process.exit(0);

const end = Date.now() + debounceMs;
while (Date.now() < end) {
  /* wait */
}

if (!existsSync(tickFile)) process.exit(0);
if (readFileSync(tickFile, "utf8").trim() !== scheduledTick) process.exit(0);

let script = join(root, "scripts/auto-git-commit-push.js");
if (existsSync(configPath)) {
  try {
    const cfg = JSON.parse(readFileSync(configPath, "utf8"));
    if (cfg.action?.includes("auto-git-commit-push.js")) {
      script = join(root, "scripts/auto-git-commit-push.js");
    }
  } catch {
    /* default script */
  }
}

spawnSync(process.execPath, [script], { cwd: root, stdio: "inherit", windowsHide: true });
