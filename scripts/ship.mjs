#!/usr/bin/env node
/**
 * Production ship for D: FAT32.
 * - Gates once (no double predeploy)
 * - Optional subst drive (default Z:) to shorten paths past FAT32/lstat limits
 * - In-place Next build via build-win.ps1 + OpenNext package/deploy
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const openNextCli = join(
  root,
  "node_modules/@opennextjs/cloudflare/dist/cli/index.js"
);
const letter = (process.env.MEDSCOPE_SUBST_DRIVE || "Z").replace(":", "").toUpperCase();
const substRoot = `${letter}:\\`;

function run(label, cmd, args, opts = {}) {
  console.log(`\n→ ${label}\n`);
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd ?? root,
    stdio: "inherit",
    shell: false,
    env: opts.env ?? process.env,
    windowsHide: true,
  });
  if (r.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${r.status ?? 1})\n`);
    process.exit(r.status || 1);
  }
}

function substMount() {
  if (process.platform !== "win32") return root;
  // Drop stale mapping if present, then map project root to a short drive.
  spawnSync("subst", [`${letter}:`, "/D"], { windowsHide: true });
  const mapped = spawnSync("subst", [`${letter}:`, root], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (mapped.status !== 0) {
    console.warn(`subst ${letter}: failed — continuing from long path`);
    return root;
  }
  console.log(`✓ subst ${letter}: → ${root}`);
  return substRoot;
}

function substUnmount() {
  if (process.platform !== "win32") return;
  spawnSync("subst", [`${letter}:`, "/D"], { windowsHide: true });
}

if (!existsSync(openNextCli)) {
  console.error("Missing @opennextjs/cloudflare CLI — run pnpm install");
  process.exit(1);
}

run("pre-deploy gates", process.execPath, [
  join(root, "scripts/run-predeploy-gates.mjs"),
]);

const workRoot = substMount();
const openNextFromWork = join(
  workRoot,
  "node_modules/@opennextjs/cloudflare/dist/cli/index.js"
);
const env = {
  ...process.env,
  MEDSCOPE_GATES_DONE: "1",
  // Keep Next/OpenNext resolving modules from the short root.
  PWD: workRoot,
};

try {
  run(
    "OpenNext Cloudflare build",
    process.execPath,
    [openNextFromWork, "build"],
    { cwd: workRoot, env }
  );
  run(
    "OpenNext Cloudflare deploy",
    process.execPath,
    [openNextFromWork, "deploy"],
    { cwd: workRoot, env }
  );
} finally {
  substUnmount();
}

console.log("\n✓ Ship complete\n");
