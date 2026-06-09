#!/usr/bin/env node
/**
 * Full auto git workflow: watch changes → add → commit → push → Vercel deploy
 *
 * Usage:
 *   npm run autogit
 *   node scripts/auto-git-commit-push.js
 *   node scripts/auto-git-commit-push.js --push-only
 *   node scripts/auto-git-commit-push.js --watch
 */
const { spawnSync } = require("node:child_process");
const { existsSync, mkdirSync, readFileSync, appendFileSync, unlinkSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { parsePorcelain, generateCommitMessage } = require("./lib/auto-commit-message.js");

const root = join(__dirname, "..");
const stateDir = join(root, ".cursor/hooks");
const LOCK_FILE = join(stateDir, ".auto-git.lock");
const PENDING_PUSH_FILE = join(stateDir, ".auto-git-pending-push");
const LOG_FILE = join(stateDir, "auto-git.log");
const pushOnly = process.argv.includes("--push-only");
const watchMode = process.argv.includes("--watch");
const PUSH_RETRIES = 3;
const PUSH_RETRY_DELAY_MS = 10_000;

mkdirSync(stateDir, { recursive: true });

function timestamp() {
  return new Date().toISOString();
}

function writeLog(level, msg) {
  const line = `[${timestamp()}] [${level}] ${msg}`;
  if (level === "ERROR") console.error(`[autogit] ${msg}`);
  else if (level === "WARN") console.warn(`[autogit] ${msg}`);
  else console.log(`[autogit] ${msg}`);
  try {
    appendFileSync(LOG_FILE, `${line}\n`, "utf8");
  } catch {
    /* ignore */
  }
}

function git(args) {
  return spawnSync("git", args, { cwd: root, encoding: "utf8" });
}

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* sync wait */
  }
}

function isGitRepo() {
  return git(["rev-parse", "--is-inside-work-tree"]).status === 0;
}

function currentBranch() {
  return git(["rev-parse", "--abbrev-ref", "HEAD"]).stdout.trim();
}

function acquireLock() {
  if (existsSync(LOCK_FILE)) {
    const age = Date.now() - Number(readFileSync(LOCK_FILE, "utf8") || "0");
    if (age < 120_000) return false;
  }
  writeFileSync(LOCK_FILE, String(Date.now()));
  return true;
}

function releaseLock() {
  try {
    unlinkSync(LOCK_FILE);
  } catch {
    /* ignore */
  }
}

function isNetworkError(text = "") {
  return /Could not resolve host|unable to access|Connection timed out|Failed to connect|Network is unreachable|TLS|Could not read from remote|Connection reset/i.test(
    text
  );
}

function isPushConflict(text = "") {
  return /non-fast-forward|rejected|fetch first|conflict|CONFLICT|cannot lock ref/i.test(text);
}

function commitsAheadOfOrigin() {
  const r = git(["rev-list", "--count", "origin/main..HEAD"]);
  if (r.status !== 0) return 0;
  return Number(r.stdout.trim()) || 0;
}

function watchChanges() {
  const status = git(["status", "--porcelain"]);
  return parsePorcelain(status.stdout || "");
}

function tryPushWithRetry() {
  for (let attempt = 1; attempt <= PUSH_RETRIES; attempt++) {
    const push = git(["push", "origin", "main"]);
    if (push.status === 0) {
      if (existsSync(PENDING_PUSH_FILE)) unlinkSync(PENDING_PUSH_FILE);
      writeLog("OK", "Push origin/main → Vercel deploy (medscopeglobal.com)");
      return true;
    }

    const err = `${push.stderr || ""}\n${push.stdout || ""}`.trim();

    if (isPushConflict(err)) {
      writeLog("ERROR", "Push konflikt — zastaveno. Vyřešte: git pull --rebase origin main");
      process.exit(2);
    }

    if (isNetworkError(err)) {
      if (attempt < PUSH_RETRIES) {
        writeLog("WARN", `Retry ${attempt}/${PUSH_RETRIES} za ${PUSH_RETRY_DELAY_MS / 1000}s`);
        sleepSync(PUSH_RETRY_DELAY_MS);
        continue;
      }
      writeFileSync(PENDING_PUSH_FILE, timestamp());
      writeLog("WARN", "Offline — commit lokálně, push při dalším save");
      return false;
    }

    writeLog("ERROR", `Push selhal: ${err || "unknown"}`);
    return false;
  }
  return false;
}

function runCommitAndPush() {
  const changes = watchChanges();

  if (!changes.length) {
    writeLog("INFO", "Prázdný diff — commit přeskočen");
    return;
  }

  const message = generateCommitMessage(changes);
  if (!message) {
    writeLog("INFO", "Prázdný diff — commit přeskočen");
    return;
  }

  const add = git(["add", "-A"]);
  if (add.status !== 0) {
    writeLog("ERROR", `git add selhal: ${(add.stderr || "").trim()}`);
    process.exit(1);
  }

  const commit = git(["commit", "-m", message]);
  if (commit.status !== 0) {
    const err = `${commit.stderr || ""}${commit.stdout || ""}`;
    if (/nothing to commit|no changes added/i.test(err)) {
      writeLog("INFO", "Nic k commitu");
      return;
    }
    writeLog("ERROR", `git commit selhal: ${err.trim()}`);
    process.exit(1);
  }

  writeLog("OK", `Commit: ${message}`);
  tryPushWithRetry();
}

function main() {
  writeLog("INFO", "=== auto-git start ===");

  if (!isGitRepo()) {
    writeLog("WARN", "Není git repozitář");
    process.exit(0);
  }

  if (watchMode) {
    writeLog("INFO", "Watcher aktivní — Cursor hook spouští autogit při uložení");
  }

  if (!acquireLock()) {
    writeLog("INFO", "Paralelní běh — přeskočeno");
    process.exit(0);
  }

  try {
    if (currentBranch() !== "main") {
      writeLog("WARN", `Jen větev main — aktuální: ${currentBranch()}`);
      process.exit(0);
    }

    if (pushOnly || existsSync(PENDING_PUSH_FILE)) {
      const ahead = commitsAheadOfOrigin();
      if (ahead === 0 && !existsSync(PENDING_PUSH_FILE)) {
        writeLog("INFO", "Žádné commity k pushi");
        process.exit(0);
      }
      tryPushWithRetry();
      return;
    }

    runCommitAndPush();
  } finally {
    releaseLock();
    writeLog("INFO", "=== auto-git end ===");
  }
}

main();
