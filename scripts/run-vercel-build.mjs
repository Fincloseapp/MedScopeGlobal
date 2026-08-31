#!/usr/bin/env node
/**
 * Vercel / CI build — pre-deploy gates + static version verify + Next.js build.
 * Triggered by: npm run build (Vercel Git integration on push to main).
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(label, cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${result.status ?? 1})\n`);
    process.exit(result.status || 1);
  }
  console.log(`✓ ${label}`);
}

console.log("\n=== MedScopeGlobal build (local Next.js) ===\n");
if (process.env.VERCEL === "1") {
  console.error("Vercel builds are disabled. Deploy with pnpm cf:deploy (Cloudflare Workers).");
  process.exit(1);
}

run("pre-deploy gates", process.execPath, [join(root, "scripts/run-predeploy-gates.mjs")]);
run("verify build version", process.execPath, [join(root, "scripts/verify-build-version.mjs")]);

const nextBin = join(root, "node_modules/next/dist/bin/next");
if (!existsSync(nextBin)) {
  console.error("✗ Next.js binary missing — run npm install");
  process.exit(1);
}

if (process.platform === "win32" && process.env.VERCEL !== "1") {
  run("next build (Windows staging)", "powershell", [
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    join(root, "scripts/build-win.ps1"),
  ]);
} else {
  run("next build", process.execPath, [nextBin, "build"]);
}

console.log("\n=== Build complete — production deploys via Cloudflare Workers (pnpm cf:deploy) ===\n");
