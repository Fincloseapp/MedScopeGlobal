#!/usr/bin/env node
/**
 * Cloudflare / CI build — pre-deploy gates + Next.js build in the project tree.
 * Windows PC: stay on D: (no C:/%TEMP% copy). FAT32 readlink EISDIR is patched
 * in the Next child via NODE_OPTIONS --require.
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fat32Patch = join(root, "scripts/win-fat32-fs-patch.cjs").replace(/\\/g, "/");

function run(label, cmd, args, extraEnv = {}) {
  const useShell = process.platform === "win32" && cmd === "powershell";
  const env = { ...process.env, ...extraEnv };
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: useShell,
    windowsHide: true,
    env,
  });
  if (result.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${result.status ?? 1})\n`);
    process.exit(result.status || 1);
  }
  console.log(`✓ ${label}`);
}

console.log("\n=== MedScopeGlobal build (Cloudflare Workers / OpenNext) ===\n");
if (process.env.CF_PAGES === "1" || process.env.CLOUDFLARE) {
  console.log("Cloudflare CI environment detected\n");
}

if (process.env.MEDSCOPE_GATES_DONE === "1") {
  console.log("Skipping pre-deploy gates (already ran for this upload)\n");
} else {
  run("pre-deploy gates", process.execPath, [join(root, "scripts/run-predeploy-gates.mjs")]);
}
run("verify build version", process.execPath, [join(root, "scripts/verify-build-version.mjs")]);

const nextBin = join(root, "node_modules/next/dist/bin/next");
if (!existsSync(nextBin)) {
  console.error("✗ Next.js binary missing — run npm install");
  process.exit(1);
}

const nextEnv = {};
if (process.platform === "win32") {
  if (!/^D:\\/i.test(root) && process.env.MEDSCOPE_ALLOW_C_DRIVE !== "1") {
    console.error(`✗ Windows Next build must run from D: — got ${root}`);
    process.exit(1);
  }
  const prior = process.env.NODE_OPTIONS || "";
  nextEnv.NODE_OPTIONS = [prior, `--require=${fat32Patch}`].filter(Boolean).join(" ").trim();
  console.log("next build in place on D: (FAT32 readlink patch)\n");
}

run("next build", process.execPath, [nextBin, "build"], nextEnv);

console.log("\n=== Next build complete — OpenNext will package for Cloudflare Workers ===\n");
