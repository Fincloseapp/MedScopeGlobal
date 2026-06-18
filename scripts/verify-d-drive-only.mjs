#!/usr/bin/env node
/**
 * CI / local guard: fail if lib/ or scripts/ contain persistent C: write paths.
 * Allowed: paths.ts guard regex, %TEMP%, USERPROFILE read (Supabase token), comments.
 *
 * Usage: node scripts/verify-d-drive-only.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertNotOnCDrive,
  MEDSCOPE_DATA_ROOT,
  MEDSCOPE_LOGS_ROOT,
  MEDSCOPE_PROJECT_ROOT,
  projectPath,
  dataPath,
  logPath,
} from "../lib/config/paths.mjs";

const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = projectPath();

const SCAN_DIRS = ["lib", "scripts"].map((d) => join(projectRoot, d));
const SKIP_DIRS = new Set(["node_modules", ".next", ".deploy-tmp", ".git"]);
const EXT = /\.(ts|tsx|js|mjs|cjs)$/;

const FORBIDDEN_PATTERNS = [
  { id: "hardcoded-c-drive", re: /(?<!\/\/.*)(?<!\/\*[^*]*)(?:^|[^\\])C:\\(?!Users\\[^\\]+\\AppData\\Local\\Temp)/m },
  { id: "hardcoded-c-forward", re: /['"`]C:\//i },
  { id: "homedir-write", re: /homedir\s*\(\s*\)/ },
  { id: "appdata-data", re: /AppData.*(?:writeFile|appendFile|createWriteStream)/i },
  { id: "userprofile-write", re: /USERPROFILE.*(?:writeFile|appendFile|createWriteStream)/i },
];

const WRITE_RE = /(?:writeFile(?:Sync)?|appendFile(?:Sync)?|createWriteStream)\s*\(/;
const PATHS_IMPORT = /paths\.mjs|paths\.ts|@\/lib\/config\/paths/;
const INDIRECT_PATHS =
  /MEDSCOPE_(DATA|LOGS|PROJECT)_ROOT|V24_DATA_ROOT|V25_DATA_ROOT|v24DataPath|v24LogPath|dataPath|logPath|projectPath|logsPath|localDataPath|from ["']@\/lib\/v2[45]\/(config|data-store)/;

/** Lines / files exempt from static scan (documented in d-drive-only-policy.md). */
function isExemptLine(line, fileRel) {
  if (/^\s*\/\//.test(line) || /^\s*\*/.test(line)) return true;
  if (line.includes("assertNotOnCDrive") || line.includes("/^C:\\\\/i")) return true;
  if (line.includes("%TEMP%") || line.includes("os.tmpdir()")) return true;
  if (fileRel.endsWith("verify-d-drive-only.mjs")) return true;
  if (fileRel.endsWith("paths.ts") || fileRel.endsWith("paths.mjs")) return true;
  if (fileRel.endsWith("apply-migrations.mjs") || fileRel.endsWith("apply-article-translations-table.mjs")) {
    if (line.includes("USERPROFILE") || line.includes(".supabase")) return true;
  }
  if (fileRel.endsWith("push-d-to-github.ps1") && line.includes("$env:TEMP")) return true;
  return false;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (EXT.test(name)) files.push(full);
  }
  return files;
}

function checkFile(filePath) {
  const rel = relative(projectRoot, filePath).replace(/\\/g, "/");
  const text = readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  const issues = [];
  const usesPaths = PATHS_IMPORT.test(text) || INDIRECT_PATHS.test(text);
  const hasWrites = WRITE_RE.test(text);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isExemptLine(line, rel)) continue;

    for (const { id, re } of FORBIDDEN_PATTERNS) {
      if (re.test(line)) {
        issues.push({ kind: id, line: i + 1, snippet: line.trim().slice(0, 120) });
      }
    }

    if (WRITE_RE.test(line) && /process\.cwd\s*\(\s*\)/.test(line)) {
      issues.push({ kind: "cwd-write", line: i + 1, snippet: line.trim().slice(0, 120) });
    }
  }

  if (hasWrites && !usesPaths && !rel.includes("auto-git-commit-push")) {
  }

  if (hasWrites && !usesPaths) {
    const allowedWithoutPaths = ["scripts/auto-git-commit-push.js"];
    if (!allowedWithoutPaths.includes(rel)) {
      issues.push({
        kind: "write-without-paths-import",
        line: 1,
        snippet: `${rel} uses fs write but does not import lib/config/paths`,
      });
    }
  }

  if (/fileURLToPath\s*\(\s*import\.meta\.url\s*\)/.test(text) && hasWrites && !usesPaths) {
    const allowedFileUrl = ["scripts/auto-git-commit-push.js"];
    if (!allowedFileUrl.includes(rel)) {
      issues.push({
        kind: "dirname-root-write",
        line: 1,
        snippet: `${rel} resolves root via __dirname/fileURLToPath for writes — use projectPath()`,
      });
    }
  }

  return issues.map((x) => ({ ...x, file: rel }));
}

function verifyCanonicalRoots() {
  const roots = [
    ["MEDSCOPE_PROJECT_ROOT", MEDSCOPE_PROJECT_ROOT],
    ["MEDSCOPE_DATA_ROOT", MEDSCOPE_DATA_ROOT],
    ["MEDSCOPE_LOGS_ROOT", MEDSCOPE_LOGS_ROOT],
    ["projectPath('.')", projectPath(".")],
    ["dataPath('.')", dataPath(".")],
    ["logPath('.')", logPath(".")],
  ];
  for (const [label, p] of roots) {
    assertNotOnCDrive(resolve(p), label);
  }
}

function main() {
  console.log("=== verify-d-drive-only ===");
  console.log(`Project root: ${MEDSCOPE_PROJECT_ROOT}`);

  verifyCanonicalRoots();

  const allIssues = [];
  for (const dir of SCAN_DIRS) {
    if (!statSync(dir).isDirectory()) continue;
    for (const file of walk(dir)) {
      allIssues.push(...checkFile(file));
    }
  }

  const unique = [];
  const seen = new Set();
  for (const issue of allIssues) {
    const key = `${issue.file}:${issue.kind}:${issue.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(issue);
  }

  if (unique.length) {
    console.error(`\nFAIL — ${unique.length} D: drive policy violation(s):\n`);
    for (const { file, kind, line, snippet } of unique) {
      console.error(`  ${file}:${line} [${kind}]`);
      console.error(`    ${snippet}\n`);
    }
    process.exit(1);
  }

  console.log("OK — no C: drive write paths detected in lib/ or scripts/");
  console.log(`  Canonical roots: ${MEDSCOPE_PROJECT_ROOT}, ${MEDSCOPE_DATA_ROOT}, ${MEDSCOPE_LOGS_ROOT}`);
  process.exit(0);
}

main();
