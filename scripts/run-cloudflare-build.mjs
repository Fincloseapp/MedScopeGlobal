#!/usr/bin/env node
/**
 * Cloudflare / CI build — pre-deploy gates + Next.js build.
 * OpenNext (`opennextjs-cloudflare build`) invokes `npm run build` / next build.
 */
import { existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(label, cmd, args) {
  const useShell = process.platform === "win32" && cmd === "powershell";
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: useShell,
    windowsHide: true,
  });
  if (result.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${result.status ?? 1})\n`);
    process.exit(result.status || 1);
  }
  console.log(`✓ ${label}`);
}

console.log("\n=== MedScopeGlobal build (Cloudflare Workers / OpenNext) ===\n");
if (process.env.VERCEL === "1") {
  console.error("Vercel builds are disabled. Deploy with pnpm cf:deploy (Cloudflare Workers).");
  process.exit(1);
}
if (process.env.CF_PAGES === "1" || process.env.CLOUDFLARE) {
  console.log("Cloudflare CI environment detected\n");
}

run("pre-deploy gates", process.execPath, [join(root, "scripts/run-predeploy-gates.mjs")]);
run("verify build version", process.execPath, [join(root, "scripts/verify-build-version.mjs")]);

const nextBin = join(root, "node_modules/next/dist/bin/next");
if (!existsSync(nextBin)) {
  console.error("✗ Next.js binary missing — run npm install");
  process.exit(1);
}

if (process.platform === "win32" && !process.env.CI) {
  run("next build (Windows staging)", "powershell", [
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    join(root, "scripts/build-win.ps1"),
  ]);
} else {
  const maxAttempts = Number(process.env.NEXT_BUILD_RETRIES ?? 3);
  let built = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      console.warn(`\nRetrying next build (${attempt}/${maxAttempts}) after PageNotFound flake…\n`);
      rmSync(join(root, ".next"), { recursive: true, force: true });
    }
    const result = spawnSync(process.execPath, [nextBin, "build"], {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
    });
    if (result.status === 0) {
      built = true;
      console.log("✓ next build");
      break;
    }
    if (attempt === maxAttempts) {
      console.error(`\n✗ next build failed (exit ${result.status ?? 1})\n`);
      process.exit(result.status || 1);
    }
  }
  if (!built) process.exit(1);
}

console.log("\n=== Next build complete — OpenNext will package for Cloudflare Workers ===\n");