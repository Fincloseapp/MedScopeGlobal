#!/usr/bin/env node
/**
 * Cursor afterFileEdit — debounced trigger for auto-git-commit-push.js
 */
const { readFileSync, writeFileSync, mkdirSync } = require("node:fs");
const { join } = require("node:path");
const { spawn } = require("node:child_process");

const hooksDir = join(__dirname);
const root = join(hooksDir, "../..");
const tickFile = join(hooksDir, ".auto-git-debounce");

mkdirSync(hooksDir, { recursive: true });

try {
  readFileSync(0, "utf8");
} catch {
  /* stdin optional */
}

const tick = String(Date.now());
writeFileSync(tickFile, tick);

spawn(process.execPath, [join(hooksDir, "auto-git-debounce-worker.js"), tick], {
  cwd: root,
  detached: true,
  stdio: "ignore",
  windowsHide: true,
}).unref();

process.exit(0);
