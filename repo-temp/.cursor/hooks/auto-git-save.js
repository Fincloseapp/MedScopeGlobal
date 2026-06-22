#!/usr/bin/env node
/**
 * Cursor afterFileEdit — debounced onSave → auto-git-commit-push.js
 */
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawn } = require("node:child_process");

const hooksDir = join(__dirname);
const root = join(hooksDir, "../..");
const configPath = join(hooksDir, "auto-git.json");
const tickFile = join(hooksDir, ".auto-git-debounce");

mkdirSync(hooksDir, { recursive: true });

try {
  readFileSync(0, "utf8");
} catch {
  /* stdin optional */
}

let debounceMs = 8000;
if (existsSync(configPath)) {
  try {
    const cfg = JSON.parse(readFileSync(configPath, "utf8"));
    if (cfg.debounceMs) debounceMs = cfg.debounceMs;
  } catch {
    /* use default */
  }
}

const tick = String(Date.now());
writeFileSync(tickFile, tick);

spawn(process.execPath, [join(hooksDir, "auto-git-debounce-worker.js"), tick, String(debounceMs)], {
  cwd: root,
  detached: true,
  stdio: "ignore",
  windowsHide: true,
}).unref();

process.exit(0);
